"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SelectableCard } from "@/components/SelectableCard";
import Link from "next/link";

const STUDY_FORMATS = [
    { id: "theory", title: "Теория", description: "Фундамент, лекции, академическая база" },
    { id: "practice", title: "Практика", description: "Проекты, кейсы, лаборатории" },
    { id: "mixed", title: "Смешанный", description: "Баланс теории и практики" },
];

const CAREER_TRACKS = [
    { id: "industry", title: "Индустрия", description: "Корпорации, стартапы" },
    { id: "science", title: "Наука", description: "Исследования, PhD" },
    { id: "unknown", title: "Пока не решил", description: "Хочу разобраться" },
];

export default function GoalsPage() {
    const router = useRouter();
    const [studyFormat, setStudyFormat] = useState("");
    const [careerTrack, setCareerTrack] = useState("");

    return (
        <div className="flex-1 flex flex-col px-6 pt-10 pb-12 bg-background min-h-screen">
            {/* Back */}
            <Link
                href="/subjects"
                className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary hover:text-text-primary transition-colors inline-block mb-8"
            >
                ← Назад
            </Link>

            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-4">
                Цели
            </span>
            <h1 className="font-serif text-[36px] leading-[1.1] text-text-primary mb-3">
                Ваши цели
            </h1>
            <p className="text-[15px] text-text-secondary leading-[1.7] mb-12">
                Это поможет точнее подобрать программы под ваш стиль
            </p>

            {/* Study Format */}
            <div className="mb-12">
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-5">
                    Формат обучения
                </span>
                <div className="space-y-3">
                    {STUDY_FORMATS.map((fmt) => (
                        <SelectableCard
                            key={fmt.id}
                            selected={studyFormat === fmt.id}
                            onSelect={() => setStudyFormat(fmt.id)}
                            title={fmt.title}
                            description={fmt.description}
                        />
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border mb-12" />

            {/* Career Track */}
            <div className="mb-12">
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-5">
                    Карьерный трек
                </span>
                <div className="space-y-3">
                    {CAREER_TRACKS.map((track) => (
                        <SelectableCard
                            key={track.id}
                            selected={careerTrack === track.id}
                            onSelect={() => setCareerTrack(track.id)}
                            title={track.title}
                            description={track.description}
                        />
                    ))}
                </div>
            </div>

            <button
                onClick={() => router.push("/loading")}
                className="w-full py-4 bg-dark-bg text-white text-[15px] font-medium rounded-lg transition-opacity hover:opacity-90 mt-auto"
            >
                Продолжить
            </button>
        </div>
    );
}
