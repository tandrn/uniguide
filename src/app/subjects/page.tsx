"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Subject {
    id: string;
    name: string;
    category: string | null;
}

export default function SubjectsPage() {
    const router = useRouter();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSubjects = async () => {
            try {
                const res = await fetch("/api/subjects");
                if (!res.ok) throw new Error("Failed");
                const data = await res.json();
                setSubjects(data);
            } catch {
                // Fallback subjects
                setSubjects([
                    { id: "math", name: "Математика", category: "Математика" },
                    { id: "physics", name: "Физика", category: "Естественные науки" },
                    { id: "informatics", name: "Информатика", category: "Программирование" },
                    { id: "russian", name: "Русский язык", category: null },
                    { id: "english", name: "Английский язык", category: null },
                ]);
            } finally {
                setLoading(false);
            }
        };
        loadSubjects();
    }, []);

    const filtered = subjects.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggleSubject = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    return (
        <div className="flex-1 flex flex-col px-6 pt-10 pb-12 bg-background min-h-screen">
            {/* Back */}
            <Link
                href="/start"
                className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary hover:text-text-primary transition-colors inline-block mb-8"
            >
                ← Назад
            </Link>

            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-4">
                Предметы
            </span>
            <h1 className="font-serif text-[36px] leading-[1.1] text-text-primary mb-3">
                Дисциплины
            </h1>
            <p className="text-[15px] text-text-secondary leading-[1.7] mb-10">
                Какие дисциплины вас интересуют? Можно выбрать несколько.
            </p>

            {/* Search */}
            <div className="mb-8">
                <input
                    type="text"
                    placeholder="Поиск предметов..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pb-3 border-b-2 border-border bg-transparent text-[15px] placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors"
                />
            </div>

            {/* Subject chips */}
            {loading ? (
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary animate-pulse">
                    Загрузка...
                </span>
            ) : (
                <div className="flex flex-wrap gap-2 flex-1">
                    {filtered.map((subject) => {
                        const isSelected = selected.includes(subject.id);
                        return (
                            <button
                                key={subject.id}
                                onClick={() => toggleSubject(subject.id)}
                                className={`px-4 py-2.5 rounded-full text-[14px] border transition-all ${isSelected
                                        ? "bg-dark-bg text-white border-dark-bg"
                                        : "border-border text-text-secondary hover:bg-hover"
                                    }`}
                            >
                                {subject.name}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* CTA */}
            <div className="mt-12">
                <button
                    onClick={() => router.push("/results")}
                    className="w-full py-4 bg-dark-bg text-white text-[15px] font-medium rounded-lg transition-opacity hover:opacity-90"
                >
                    Продолжить
                </button>
            </div>
        </div>
    );
}
