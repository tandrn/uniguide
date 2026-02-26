"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function AuthPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/start";

    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const supabase = createClient();

    const handleSubmit = async () => {
        if (!email || !password) {
            setError("Заполните все поля");
            return;
        }
        if (mode === "register" && !name) {
            setError("Укажите имя");
            return;
        }

        setLoading(true);
        setError("");

        try {
            if (mode === "register") {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { name },
                    },
                });

                if (signUpError) throw signUpError;

                // Create user profile in our users table
                if (data.user) {
                    const { error: profileError } = await supabase
                        .from("users")
                        .insert({
                            id: data.user.id,
                            email: data.user.email,
                            name,
                        });

                    if (profileError && !profileError.message.includes("duplicate")) {
                        console.error("Profile creation error:", profileError);
                    }
                }

                router.push(redirect);
                router.refresh();
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) throw signInError;

                router.push(redirect);
                router.refresh();
            }
        } catch (err: any) {
            const msg = err?.message || "Ошибка авторизации";
            if (msg.includes("Invalid login")) {
                setError("Неверный email или пароль");
            } else if (msg.includes("already registered")) {
                setError("Этот email уже зарегистрирован");
            } else if (msg.includes("Password should be")) {
                setError("Пароль должен быть не менее 6 символов");
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-background min-h-screen">
            <div className="flex-1 flex flex-col justify-center px-6 max-w-[400px] mx-auto w-full">
                {/* Header */}
                <div className="mb-12">
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-4">
                        {mode === "login" ? "Вход" : "Регистрация"}
                    </span>
                    <h1 className="font-serif text-[40px] leading-[1.1] text-text-primary mb-3">
                        {mode === "login" ? "С возвращением" : "Создать аккаунт"}
                    </h1>
                    <p className="text-[15px] text-text-secondary leading-[1.7]">
                        {mode === "login"
                            ? "Войдите, чтобы продолжить подбор программ"
                            : "Зарегистрируйтесь для персонального подбора"}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 px-4 py-3 rounded-lg border border-accent/30 bg-accent-light/50">
                        <p className="text-sm text-accent">{error}</p>
                    </div>
                )}

                {/* Form */}
                <div className="space-y-6 mb-8">
                    {mode === "register" && (
                        <div>
                            <label className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-3">
                                Имя
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Как вас зовут"
                                className="w-full pb-3 border-b-2 border-border bg-transparent text-[15px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors"
                            />
                        </div>
                    )}

                    <div>
                        <label className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-3">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@mail.ru"
                            className="w-full pb-3 border-b-2 border-border bg-transparent text-[15px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors"
                        />
                    </div>

                    <div>
                        <label className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-3">
                            Пароль
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            placeholder="Минимум 6 символов"
                            className="w-full pb-3 border-b-2 border-border bg-transparent text-[15px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors"
                        />
                    </div>
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-4 bg-dark-bg text-white text-[15px] font-medium rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity mb-4"
                >
                    {loading
                        ? "..."
                        : mode === "login"
                            ? "Войти"
                            : "Зарегистрироваться"}
                </button>

                {/* Switch mode */}
                <div className="text-center">
                    <button
                        onClick={() => {
                            setMode(mode === "login" ? "register" : "login");
                            setError("");
                        }}
                        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                        {mode === "login"
                            ? "Нет аккаунта? Зарегистрируйтесь"
                            : "Уже есть аккаунт? Войдите"}
                    </button>
                </div>
            </div>
        </div>
    );
}
