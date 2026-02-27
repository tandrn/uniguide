"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppContext, Program } from "@/context/AppContext";
import { ArrowLeft } from "lucide-react";

export default function ProgramDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { savedPrograms, toggleSavedProgram } = useAppContext();

    const programId = typeof params.id === "string" ? params.id : "";
    const [program, setProgram] = useState<Program | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProgram = async () => {
            try {
                const res = await fetch("/api/programs");
                if (!res.ok) throw new Error("Failed");
                const programs: Program[] = await res.json();
                const found = programs.find((p) => p.id === programId);
                setProgram(found || null);
            } catch {
                setProgram(null);
            } finally {
                setLoading(false);
            }
        };

        loadProgram();
    }, [programId]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary animate-pulse">
                    Загрузка...
                </span>
            </div>
        );
    }

    if (!program) {
        return (
            <div className="flex-1 flex items-center justify-center px-6 min-h-screen bg-background">
                <div className="text-center">
                    <h1 className="font-serif text-[24px] mb-4">Не найдено</h1>
                    <button onClick={() => router.back()} className="text-accent text-sm">
                        Назад
                    </button>
                </div>
            </div>
        );
    }

    const isSaved = savedPrograms.includes(program.id);

    return (
        <div className="flex-1 flex flex-col bg-background min-h-screen pb-24">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-10 pb-6">
                <button onClick={() => router.back()} className="text-text-secondary hover:text-text-primary transition-colors">
                    <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
                </button>
                <button
                    onClick={() => toggleSavedProgram(program.id)}
                    className={`font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${isSaved ? "text-accent" : "text-text-tertiary hover:text-text-secondary"
                        }`}
                >
                    {isSaved ? "Сохранено" : "Сохранить"}
                </button>
            </div>

            <div className="px-6">
                {/* University */}
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-3">
                    {program.university}
                </span>

                {/* Title */}
                <h1 className="font-serif text-[36px] leading-[1.1] text-text-primary mb-6">
                    {program.name}
                </h1>

                {/* Key stats */}
                <div className="flex flex-wrap gap-x-8 gap-y-6 mb-8">
                    <div>
                        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-1">
                            Совпадение
                        </span>
                        <span className="font-serif text-[28px] text-success">{program.matchPercent}%</span>
                    </div>
                    <div>
                        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-1">
                            Проходной балл (2024)
                        </span>
                        <span className="font-serif text-[28px] text-text-primary">{program.passingScore || "—"}</span>
                    </div>
                    <div>
                        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-1">
                            Бюджетных мест
                        </span>
                        <span className="font-serif text-[28px] text-text-primary">{program.budgetPlaces || "—"}</span>
                    </div>
                    <div>
                        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-1">
                            Платное ({program.paidPlaces || "—"} мест)
                        </span>
                        <span className="font-serif text-[28px] text-text-primary">{program.costPerYear ? `${(program.costPerYear / 1000).toFixed(0)}k ₽/г` : "—"}</span>
                    </div>
                </div>

                <div className="border-t border-border mb-8" />

                {/* Why it fits */}
                <div className="mb-12">
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-4">
                        Почему подходит
                    </span>
                    <p className="text-base text-text-secondary leading-[1.7]">
                        {program.whyFits}
                    </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-12">
                    {program.hashtags.map((tag) => (
                        <span key={tag} className="px-3 py-1.5 rounded-full text-xs border border-border text-text-secondary">
                            {tag}
                        </span>
                    ))}
                    {program.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1.5 rounded-full text-xs border border-border text-text-secondary">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="border-t border-border mb-12" />

                {/* Focus */}
                <div className="mb-12">
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-5">
                        Фокус обучения
                    </span>
                    <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm text-text-secondary w-20">Теория</span>
                        <div className="flex-1 h-[2px] bg-border rounded-full">
                            <div className="h-full bg-text-primary rounded-full" style={{ width: `${program.theoryPercent}%` }} />
                        </div>
                        <span className="font-mono text-[13px] text-text-tertiary w-10 text-right">{program.theoryPercent}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-text-secondary w-20">Практика</span>
                        <div className="flex-1 h-[2px] bg-border rounded-full">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${program.practicePercent}%` }} />
                        </div>
                        <span className="font-mono text-[13px] text-accent w-10 text-right">{program.practicePercent}%</span>
                    </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-px bg-border rounded-xl overflow-hidden mb-12">
                    {[
                        { label: "Рейтинг", value: program.rating.toString() },
                        { label: "Трудоустройство", value: `${program.employment}%` },
                        { label: "Отсев (1 курс)", value: `< ${program.dropout}%` },
                        { label: "Удовлетворённость", value: `${program.satisfaction}%` },
                    ].map((m) => (
                        <div key={m.label} className="bg-surface p-6">
                            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-3">
                                {m.label}
                            </span>
                            <span className="font-serif text-[28px] text-text-primary">{m.value}</span>
                        </div>
                    ))}
                </div>

                {/* Salary */}
                <div className="mb-12">
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-5">
                        Стартовая зарплата
                    </span>
                    <div className="flex justify-between">
                        <div>
                            <span className="text-sm text-text-tertiary block mb-1">Ожидание</span>
                            <span className="font-serif text-[24px]">{(program.expectedSalary.claimed / 1000)}k ₽</span>
                        </div>
                        <div className="text-right">
                            <span className="text-sm text-text-tertiary block mb-1">Реальность</span>
                            <span className="font-serif text-[24px] text-accent">{(program.expectedSalary.real / 1000)}k ₽</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border mb-6" />

                <p className="text-xs text-text-tertiary leading-[1.7] mb-12">
                    Данные на основе отчётов университетов и статистики Минобразования.
                </p>
            </div>

            {/* Sticky CTA */}
            <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-background border-t border-border">
                <div className="max-w-[640px] mx-auto">
                    <button className="w-full py-4 bg-dark-bg text-white font-sans font-medium text-base rounded-lg transition-opacity hover:opacity-90">
                        Подать заявку
                    </button>
                </div>
            </div>
        </div>
    );
}
