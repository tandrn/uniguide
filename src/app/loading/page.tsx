"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STAGES = [
    "Загрузка профиля",
    "Поиск совпадений",
    "Анализ программ",
    "Подготовка результатов",
];

export default function LoadingPage() {
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState(0);

    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress((prev) => (prev >= 100 ? 100 : prev + 1));
        }, 55);

        const stageInterval = setInterval(() => {
            setStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
        }, 1400);

        const redirect = setTimeout(() => router.push("/results"), 6000);

        return () => {
            clearInterval(progressInterval);
            clearInterval(stageInterval);
            clearTimeout(redirect);
        };
    }, [router]);

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 bg-background min-h-screen">
            {/* Progress number */}
            <span className="font-serif text-[72px] text-text-primary mb-4 tabular-nums">
                {progress}
            </span>

            {/* Progress bar */}
            <div className="w-full max-w-[280px] h-[2px] bg-border rounded-full overflow-hidden mb-10">
                <div
                    className="h-full bg-text-primary rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Stage label */}
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary mb-2">
                {STAGES[stage]}
            </span>

            {/* Dots */}
            <div className="flex gap-2 mt-8">
                {STAGES.map((_, i) => (
                    <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i <= stage ? "bg-text-primary" : "bg-border"
                            }`}
                    />
                ))}
            </div>

            {/* Cancel */}
            <button
                onClick={() => router.push("/start")}
                className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary hover:text-text-secondary transition-colors mt-16"
            >
                Отменить
            </button>
        </div>
    );
}
