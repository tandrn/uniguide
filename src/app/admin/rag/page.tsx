"use client";

import { useState, useEffect } from "react";
import { BottomTabBar } from "@/components/BottomTabBar";

export default function RagAdminPage() {
    const [source, setSource] = useState("");
    const [text, setText] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [stats, setStats] = useState<{ chunksCount: number; sources: string[] } | null>(null);

    const loadStats = async () => {
        try {
            const res = await fetch("/api/admin/rag");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch("/api/admin/rag", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source, text }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Ошибка загрузки");
            }

            setStatus("success");
            setMessage(data.message);
            setSource("");
            setText("");
            loadStats();
        } catch (err: any) {
            setStatus("error");
            setMessage(err.message);
        }
    };

    return (
        <div className="flex-1 flex flex-col pb-20 bg-background min-h-screen">
            <div className="px-6 pt-12 pb-8 border-b border-border">
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-3">
                    Administration
                </span>
                <h1 className="font-serif text-[32px] leading-[1.15] text-text-primary">
                    Управление RAG
                </h1>
                <p className="text-sm text-text-tertiary mt-2">
                    Добавление документов в векторную базу знаний DeepSeek.
                </p>
            </div>

            <div className="px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-surface p-4 rounded-xl border border-border">
                        <span className="font-mono text-[11px] uppercase text-text-tertiary block mb-1">
                            Чанков в базе
                        </span>
                        <span className="font-serif text-2xl">{stats?.chunksCount || 0}</span>
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-border">
                        <span className="font-mono text-[11px] uppercase text-text-tertiary block mb-1">
                            Источников
                        </span>
                        <span className="font-serif text-2xl">{stats?.sources.length || 0}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Название источника (Source)
                        </label>
                        <input
                            type="text"
                            required
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            placeholder="Например: Описание ВШЭ"
                            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-text-primary transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Текст документа
                        </label>
                        <textarea
                            required
                            rows={8}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Вставьте объемный текст сюда..."
                            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-text-primary transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full py-4 bg-dark-bg text-white font-sans font-medium text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {status === "loading" ? "Анализ и сохранение..." : "Добавить в базу (Ingest)"}
                    </button>

                    {message && (
                        <div
                            className={`p-4 rounded-lg text-sm border ${
                                status === "success"
                                    ? "bg-green-50/50 border-green-200 text-green-700"
                                    : "bg-red-50/50 border-red-200 text-red-700"
                            }`}
                        >
                            {message}
                        </div>
                    )}
                </form>

                {/* Sources list */}
                {stats && stats.sources.length > 0 && (
                    <div className="mt-12">
                        <h3 className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-4">
                            Загруженные источники
                        </h3>
                        <div className="space-y-2">
                            {stats.sources.map((src) => (
                                <div key={src} className="flex justify-between items-center py-2 border-b border-border text-sm text-text-secondary">
                                    <span>{src}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <BottomTabBar />
        </div>
    );
}
