"use client";

import Link from "next/link";
import { BottomTabBar } from "@/components/BottomTabBar";
import { useAppContext } from "@/context/AppContext";
import { useState, useEffect } from "react";

interface TimelineItem {
    stage: "current" | "milestone" | "recommended" | "alt";
    title: string;
    subtitle: string;
    detail?: string;
    progress?: number;
    match?: number;
    tags?: string[];
    programId?: string;
}

export default function PathPage() {
    const { recommendations, isLoading, userPath } = useAppContext();
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);

    useEffect(() => {
        if (recommendations.length === 0) return;

        // Если есть пользовательский путь, используем его
        const selectedProgram = userPath 
            ? recommendations.find(p => 
                  p.degree === userPath.educationLevel ||
                  p.careers.some(c => c.toLowerCase().includes(userPath.careerTrack.toLowerCase()))
              ) || recommendations[0]
            : recommendations[0];
            
        const altProgram = recommendations[1];

        const generatedTimeline: TimelineItem[] = [
            {
                stage: "current",
                title: selectedProgram.name,
                subtitle: `${selectedProgram.universityShort} · ${selectedProgram.city}`,
                detail: `${selectedProgram.duration} · GPA 4.0`,
                progress: 0,
            },
            {
                stage: "milestone",
                title: "Базовые предметы",
                subtitle: "1-2 курс · Математика, Программирование",
            },
            {
                stage: "milestone",
                title: "Специализация",
                subtitle: "3 курс · Выбор направления",
            },
            {
                stage: "recommended",
                title: "Магистратура: " + (selectedProgram.careers[0] || "Специализация"),
                subtitle: `${selectedProgram.universityShort} · 2 года`,
                match: selectedProgram.matchPercent,
                tags: selectedProgram.hashtags.slice(0, 3),
                programId: selectedProgram.id,
            },
            {
                stage: "alt",
                title: altProgram ? `Альтернатива: ${altProgram.name}` : "Другие программы",
                subtitle: altProgram ? `${altProgram.universityShort} · ${altProgram.city}` : "Изучите другие варианты",
                match: altProgram?.matchPercent || 80,
            },
        ];

        setTimeline(generatedTimeline);
    }, [recommendations, userPath]);

    if (isLoading || timeline.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center pb-20 bg-background min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="font-serif text-[24px] text-text-primary mb-2">Загрузка траектории...</h2>
                    <p className="text-sm text-text-tertiary">Формируем ваш образовательный путь</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col pb-20 bg-background min-h-screen">
            {/* Header */}
            <div className="px-6 pt-12 pb-8">
                <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary">
                        Траектория
                    </span>
                    <Link
                        href="/start"
                        className="text-xs text-accent hover:underline"
                    >
                        Изменить путь →
                    </Link>
                </div>
                <h1 className="font-serif text-[32px] leading-[1.15] text-text-primary mb-4">
                    Образовательный путь
                </h1>
                <div className="flex gap-2">
                    <span className="px-3 py-1.5 rounded-full text-xs bg-dark-bg text-white">
                        {timeline[0]?.title.split(' ')[0] || "Специальность"}
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-xs border border-border text-text-secondary">
                        Высокий спрос
                    </span>
                </div>
            </div>

            {/* Timeline */}
            <div className="px-6">
                {timeline.map((item, i) => (
                    <div key={i} className="flex gap-5">
                        {/* Line + dot */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-2 h-2 rounded-full mt-2 ${item.stage === "current" ? "bg-text-primary" : "bg-border"
                                    }`}
                            />
                            {i < timeline.length - 1 && (
                                <div className="w-px flex-1 border-l border-dashed border-border my-2" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-8">
                            {item.stage === "current" && (
                                <div className="bg-surface rounded-xl border border-text-primary p-6">
                                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-3">
                                        Текущий этап
                                    </span>
                                    <h3 className="font-serif text-[22px] leading-[1.2] text-text-primary mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-text-secondary mb-4">{item.subtitle}</p>
                                    {item.progress !== undefined && (
                                        <>
                                            <div className="h-[2px] bg-border rounded-full overflow-hidden mb-2">
                                                <div className="h-full bg-text-primary rounded-full" style={{ width: `${item.progress}%` }} />
                                            </div>
                                            <span className="text-xs text-text-tertiary">{item.detail}</span>
                                        </>
                                    )}
                                </div>
                            )}
                            {item.stage === "milestone" && (
                                <div className="bg-surface rounded-xl border border-border p-5">
                                    <h3 className="font-sans font-medium text-sm text-text-primary">{item.title}</h3>
                                    <p className="text-xs text-text-tertiary mt-1">{item.subtitle}</p>
                                </div>
                            )}
                            {item.stage === "recommended" && (
                                <div>
                                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-3">
                                        Рекомендация
                                    </span>
                                    <div className="bg-surface rounded-xl border border-border p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-serif text-[22px] leading-[1.2] text-text-primary">
                                                {item.title}
                                            </h3>
                                            <span className="font-mono text-[13px] text-success">{item.match}%</span>
                                        </div>
                                        <p className="text-sm text-text-secondary mb-4">{item.subtitle}</p>
                                        {item.tags && (
                                            <div className="flex gap-2">
                                                {item.tags.map((tag) => (
                                                    <span key={tag} className="px-3 py-1 rounded-full text-xs border border-border text-text-secondary">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {item.programId && (
                                            <Link
                                                href={`/program/${item.programId}`}
                                                className="text-sm text-accent hover:underline mt-2 inline-block"
                                            >
                                                Подробнее →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                            {item.stage === "alt" && (
                                <div className="bg-surface rounded-xl border border-border p-5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-sans font-medium text-sm text-text-primary">{item.title}</h3>
                                            <p className="text-xs text-text-tertiary mt-1">{item.subtitle}</p>
                                        </div>
                                        <span className="font-mono text-[11px] text-text-tertiary">{item.match}%</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <BottomTabBar />
        </div>
    );
}
