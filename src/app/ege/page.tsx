"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const EGE_SUBJECTS = [
    { id: "russian", name: "Русский язык", max: 100 },
    { id: "math", name: "Математика", max: 100 },
    { id: "physics", name: "Физика", max: 100 },
    { id: "informatics", name: "Информатика", max: 100 },
    { id: "english", name: "Английский язык", max: 100 },
    { id: "chemistry", name: "Химия", max: 100 },
    { id: "history", name: "История", max: 100 },
    { id: "biology", name: "Биология", max: 100 },
    { id: "social", name: "Обществознание", max: 100 },
    { id: "literature", name: "Литература", max: 100 },
];

interface ScoreEntry {
    subjectId: string;
    score: string;
}

export default function EgePage() {
    const router = useRouter();
    const [entries, setEntries] = useState<ScoreEntry[]>([
        { subjectId: "russian", score: "" },
        { subjectId: "math", score: "" },
    ]);
    const [showPicker, setShowPicker] = useState(false);

    // Load saved path subjects
    useEffect(() => {
        const saved = localStorage.getItem("userPath");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.subjects && parsed.subjects.length > 0) {
                    const initial: ScoreEntry[] = parsed.subjects.map((id: string) => ({
                        subjectId: id,
                        score: "",
                    }));
                    // Always include russian if not present
                    if (!initial.find((e: ScoreEntry) => e.subjectId === "russian")) {
                        initial.unshift({ subjectId: "russian", score: "" });
                    }
                    setEntries(initial);
                }
            } catch {
                // ignore
            }
        }
    }, []);

    const updateScore = (index: number, value: string) => {
        // Only allow numbers 0-100
        const num = value.replace(/\D/g, "");
        if (num.length > 3) return;
        const parsed = parseInt(num, 10);
        if (num && parsed > 100) return;

        setEntries(prev => prev.map((e, i) => i === index ? { ...e, score: num } : e));
    };

    const removeEntry = (index: number) => {
        if (entries.length <= 1) return;
        setEntries(prev => prev.filter((_, i) => i !== index));
    };

    const addSubject = (subjectId: string) => {
        if (entries.find(e => e.subjectId === subjectId)) return;
        setEntries(prev => [...prev, { subjectId, score: "" }]);
        setShowPicker(false);
    };

    const availableSubjects = EGE_SUBJECTS.filter(
        s => !entries.find(e => e.subjectId === s.id)
    );

    const filledCount = entries.filter(e => e.score && parseInt(e.score) > 0).length;
    const totalScore = entries.reduce((sum, e) => sum + (parseInt(e.score) || 0), 0);

    const handleSubmit = () => {
        const scores: Record<string, number> = {};
        entries.forEach(e => {
            if (e.score) scores[e.subjectId] = parseInt(e.score);
        });
        localStorage.setItem("egeScores", JSON.stringify(scores));
        router.push("/loading");
    };

    const getSubjectName = (id: string) => {
        return EGE_SUBJECTS.find(s => s.id === id)?.name || id;
    };

    return (
        <div className="flex-1 flex flex-col bg-background min-h-screen">
            {/* Header */}
            <div className="px-6 pt-10 pb-2">
                {/* Back link */}
                <Link
                    href="/start"
                    className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary hover:text-text-primary transition-colors inline-block mb-8"
                >
                    ← Назад
                </Link>

                {/* Label */}
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-4">
                    Баллы ЕГЭ
                </span>

                {/* Title */}
                <h1 className="font-serif text-[36px] leading-[1.1] text-text-primary mb-2">
                    Введите результаты
                </h1>
                <p className="text-[15px] text-text-secondary leading-[1.7] mb-2">
                    Укажите баллы по предметам, которые вы сдали или планируете сдавать.
                </p>
                <p className="text-[13px] text-text-tertiary leading-[1.6] mb-10">
                    Это необязательно — можно пропустить и вернуться позже.
                </p>
            </div>

            {/* Score inputs */}
            <div className="flex-1 px-6 overflow-y-auto">
                <div className="space-y-0">
                    {entries.map((entry, index) => (
                        <div key={`${entry.subjectId}-${index}`} className="flex items-center border-b border-border py-5 gap-4">
                            {/* Subject name */}
                            <div className="flex-1 min-w-0">
                                <span className="text-[15px] text-text-primary font-medium block">
                                    {getSubjectName(entry.subjectId)}
                                </span>
                            </div>

                            {/* Score input */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={entry.score}
                                    onChange={(e) => updateScore(index, e.target.value)}
                                    placeholder="—"
                                    className="w-16 text-right text-[20px] font-serif text-text-primary bg-transparent border-none outline-none placeholder:text-border"
                                />
                                <span className="text-[13px] text-text-tertiary w-8">/100</span>
                            </div>

                            {/* Remove */}
                            {entries.length > 1 && (
                                <button
                                    onClick={() => removeEntry(index)}
                                    className="text-text-tertiary hover:text-text-secondary transition-colors text-[18px] leading-none px-1"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add subject */}
                {availableSubjects.length > 0 && (
                    <div className="mt-6">
                        {!showPicker ? (
                            <button
                                onClick={() => setShowPicker(true)}
                                className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary hover:text-text-primary transition-colors"
                            >
                                + Добавить предмет
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary">
                                        Выберите предмет
                                    </span>
                                    <button
                                        onClick={() => setShowPicker(false)}
                                        className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary hover:text-text-primary transition-colors"
                                    >
                                        Закрыть
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {availableSubjects.map((sub) => (
                                        <button
                                            key={sub.id}
                                            onClick={() => addSubject(sub.id)}
                                            className="px-4 py-2 rounded-full text-[13px] border border-border text-text-secondary hover:bg-hover transition-colors"
                                        >
                                            {sub.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Summary */}
                {filledCount > 0 && (
                    <div className="mt-10 pt-6 border-t border-border">
                        <div className="flex justify-between items-baseline">
                            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary">
                                Итого ({filledCount} предм.)
                            </span>
                            <span className="font-serif text-[28px] text-text-primary">
                                {totalScore}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/loading")}
                        className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary hover:text-text-primary transition-colors px-4 py-3"
                    >
                        Пропустить
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={filledCount === 0}
                        className="flex-1 py-4 bg-dark-bg text-white text-[15px] font-medium rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                        Подобрать программы
                    </button>
                </div>
            </div>
        </div>
    );
}
