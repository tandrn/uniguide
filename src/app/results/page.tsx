"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { BottomTabBar } from "@/components/BottomTabBar";

const FILTERS = ["Все", "IT", "Бюджет", "Москва", "Стажировки"];

export default function ResultsPage() {
    const { recommendations, savedPrograms, toggleSavedProgram, isLoading, error, userPath } = useAppContext();
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

                        // Calculate total EGE score of the user for this logic
                        let userScore = 0;
                        let budgetChance = { text: "—", color: "text-text-tertiary" };
                        let paidChance = { text: "—", color: "text-text-tertiary" };

                        if (userPath?.egeScores && userPath.subjects) {
                            const egeSum = userPath.subjects.reduce((sum, id) => {
                                const score = userPath.egeScores[`sub_${id}`] || 0;
                                return sum + score;
                            }, 0);

                            const bonusSum = (userPath.egeScores.olympiad || 0) +
                                (userPath.egeScores.medal ? 5 : 0) +
                                (userPath.egeScores.gto ? 2 : 0) +
                                (userPath.egeScores.volunteer ? 2 : 0) +
                                (parseInt(userPath.egeScores.dvi) || 0);

                            userScore = egeSum + bonusSum;

                            if (userScore > 0 && program.passingScore) {
                                let cBudget = 0;
                                let cPaid = 0;

                                // Budget calculation
                                if (userScore >= program.passingScore + 10) cBudget = 94;
                                else if (userScore >= program.passingScore) cBudget = 85;
                                else if (userScore >= program.passingScore - 10) cBudget = 55;
                                else if (userScore >= program.passingScore - 20) cBudget = 30;
                                else cBudget = 5;

                                // Paid calculation (usually requires lower score, mostly minimum threshold)
                                if (userScore >= program.passingScore - 30) cPaid = 95;
                                else if (userScore >= program.passingScore - 50) cPaid = 70;
                                else if (userScore >= program.passingScore - 80) cPaid = 40;
                                else cPaid = 10;

                                const getColor = (val: number) => {
                                    if (val > 60) return "text-success"; // Green
                                    if (val >= 30) return "text-orange-500"; // Orange
                                    return "text-accent"; // Red
                                };

                                budgetChance = { text: `${cBudget}%`, color: getColor(cBudget) };
                                paidChance = { text: `${cPaid}%`, color: getColor(cPaid) };
                            }
                        }

                        return (
                            <div key={program.id} className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:border-text-tertiary transition-colors">
                                {/* University label */}
                                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary">
                                    {program.universityShort}
                                </span>

                                {/* Title + match */}
                                <div className="flex items-start justify-between gap-4 mt-2 mb-4">
                                    <h3 className="font-serif text-[22px] leading-[1.2] text-text-primary">
                                        {program.name}
                                    </h3>
                                    <span className="font-mono text-[13px] text-success whitespace-nowrap bg-success/10 px-2 py-1 rounded">
                                        {program.matchPercent}% Match
                                    </span>
                                </div>

                                {/* Metrics grid */}
                                <div className="grid grid-cols-2 gap-4 mb-5 p-4 rounded-lg bg-background border border-border">
                                    <div>
                                        <span className="font-mono text-[10px] uppercase text-text-tertiary mb-1 block">Бюджет</span>
                                        <span className="text-[14px] font-medium text-text-primary">{program.budgetPlaces || "—"} мест</span>
                                    </div>
                                    <div>
                                        <span className="font-mono text-[10px] uppercase text-text-tertiary mb-1 block">Проходной 2024</span>
                                        <span className="text-[14px] font-medium text-text-primary">{program.passingScore || "—"} балл.</span>
                                    </div>
                                    <div className="pt-2 border-t border-border border-dashed">
                                        <span className="font-mono text-[10px] uppercase text-text-tertiary mb-1 block">Шанс: Бюджет</span>
                                        <span className={`text-[14px] font-medium ${budgetChance.color}`}>
                                            {budgetChance.text}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-border border-dashed">
                                        <span className="font-mono text-[10px] uppercase text-text-tertiary mb-1 block">Шанс: Платное</span>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`text-[14px] font-medium ${paidChance.color}`}>
                                                {paidChance.text}
                                            </span>
                                            <span className="text-[11px] text-text-tertiary whitespace-nowrap">
                                                {program.costPerYear ? `${(program.costPerYear / 1000).toFixed(0)}k ₽/г` : "—"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-5">
                                    {program.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 rounded-full text-xs border border-border text-text-secondary bg-transparent"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Insight */}
                                <div className="border-l-2 border-text-tertiary pl-4 mb-6">
                                    <p className="text-sm text-text-secondary leading-[1.7]">
                                        {program.aiInsight}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                                    <Link
                                        href={`/program/${program.id}`}
                                        className="text-[13px] font-medium text-text-primary hover:text-accent transition-colors flex items-center gap-1"
                                    >
                                        Подробнее <span className="font-sans">→</span>
                                    </Link>
                                    <button
                                        onClick={() => toggleSavedProgram(program.id)}
                                        className={`font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${isSaved ? "text-accent" : "text-text-tertiary hover:text-text-secondary"
                                            }`}
                                    >
                                        {isSaved ? "Выбрано" : "+ В избранное"}
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
