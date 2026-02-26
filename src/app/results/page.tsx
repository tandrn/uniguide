"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { BottomTabBar } from "@/components/BottomTabBar";

const FILTERS = ["Все", "IT", "Бюджет", "Москва", "Стажировки"];

export default function ResultsPage() {
    const { recommendations, savedPrograms, toggleSavedProgram, isLoading, error } = useAppContext();
    const [activeFilter, setActiveFilter] = useState("Все");

    // Фильтрация программ
    const filteredPrograms = recommendations.filter((program) => {
        if (activeFilter === "Все") return true;
        if (activeFilter === "IT") return program.hashtags.some(t => t.includes('#Python') || t.includes('#AI') || t.includes('робот'));
        if (activeFilter === "Бюджет") return (program.budgetPlaces || 0) > 0;
        if (activeFilter === "Москва") return program.city === "Москва";
        if (activeFilter === "Стажировки") return program.tags.some(t => t.includes('Стажировки'));
        return true;
    });

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center pb-20 bg-background min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="font-serif text-[24px] text-text-primary mb-2">Загрузка программ...</h2>
                    <p className="text-sm text-text-tertiary">Получаем рекомендации из базы</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center pb-20 bg-background min-h-screen">
                <div className="text-center px-6">
                    <h2 className="font-serif text-[24px] text-text-primary mb-2">Ошибка загрузки</h2>
                    <p className="text-sm text-text-secondary mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-dark-bg text-white rounded-lg hover:opacity-90"
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col pb-20 bg-background min-h-screen">
            {/* Header */}
            <div className="px-6 pt-12 pb-8">
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-3">
                    Результаты
                </span>
                <h1 className="font-serif text-[32px] leading-[1.15] text-text-primary mb-6">
                    Рекомендации
                </h1>

                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-full text-sm transition-all ${activeFilter === filter
                                    ? "bg-dark-bg text-white"
                                    : "border border-border text-text-secondary hover:bg-hover"
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cards */}
            <div className="px-6 space-y-4">
                {filteredPrograms.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-text-secondary">Нет программ по выбранному фильтру</p>
                    </div>
                ) : (
                    filteredPrograms.map((program) => {
                        const isSaved = savedPrograms.includes(program.id);
                        return (
                            <div key={program.id} className="bg-surface rounded-xl border border-border p-6">
                                {/* University label */}
                                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary">
                                    {program.universityShort}
                                </span>

                                {/* Title + match */}
                                <div className="flex items-start justify-between gap-4 mt-2 mb-4">
                                    <h3 className="font-serif text-[22px] leading-[1.2] text-text-primary">
                                        {program.name}
                                    </h3>
                                    <span className="font-mono text-[13px] text-success whitespace-nowrap">
                                        {program.matchPercent}%
                                    </span>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-5">
                                    {program.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 rounded-full text-xs border border-border text-text-secondary"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Insight */}
                                <div className="border-l-2 border-accent pl-4 mb-6">
                                    <p className="text-sm text-text-secondary leading-[1.7]">
                                        {program.aiInsight}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <Link
                                        href={`/program/${program.id}`}
                                        className="text-sm font-medium text-text-primary hover:text-accent transition-colors"
                                    >
                                        Подробнее →
                                    </Link>
                                    <button
                                        onClick={() => toggleSavedProgram(program.id)}
                                        className={`font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${isSaved ? "text-accent" : "text-text-tertiary hover:text-text-secondary"
                                            }`}
                                    >
                                        {isSaved ? "Сохранено" : "Сохранить"}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <BottomTabBar />
        </div>
    );
}
