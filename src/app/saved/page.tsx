"use client";

import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { BottomTabBar } from "@/components/BottomTabBar";
import { useState, useEffect } from "react";

export default function SavedPage() {
    const { savedPrograms, toggleSavedProgram, recommendations } = useAppContext();
    const [savedList, setSavedList] = useState<any[]>([]);

    useEffect(() => {
        // Фильтруем программы из recommendations по savedPrograms
        const saved = recommendations.filter((p) => savedPrograms.includes(p.id));
        setSavedList(saved);
    }, [savedPrograms, recommendations]);

    return (
        <div className="flex-1 flex flex-col pb-20 bg-background min-h-screen">
            <div className="px-6 pt-12 pb-8">
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-3">
                    Коллекция
                </span>
                <h1 className="font-serif text-[32px] leading-[1.15] text-text-primary">
                    Сохранённое
                </h1>
            </div>

            <div className="px-6">
                {savedList.length === 0 ? (
                    <div className="text-center py-20">
                        <h3 className="font-serif text-[24px] text-text-primary mb-3">Пока пусто</h3>
                        <p className="text-sm text-text-tertiary mb-8 max-w-[280px] mx-auto leading-[1.7]">
                            Сохраняйте программы, чтобы вернуться к ним позже
                        </p>
                        <Link
                            href="/results"
                            className="inline-block px-6 py-3 bg-dark-bg text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                        >
                            К рекомендациям
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {savedList.map((program) => (
                            <div key={program.id} className="bg-surface rounded-xl border border-border p-6">
                                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-2">
                                    {program.universityShort}
                                </span>
                                <h3 className="font-serif text-[20px] leading-[1.2] text-text-primary mb-1">
                                    {program.name}
                                </h3>
                                <p className="text-sm text-text-tertiary mb-4">{program.university}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <Link
                                        href={`/program/${program.id}`}
                                        className="text-sm text-text-primary hover:text-accent transition-colors"
                                    >
                                        Подробнее →
                                    </Link>
                                    <button
                                        onClick={() => toggleSavedProgram(program.id)}
                                        className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary hover:text-accent transition-colors"
                                    >
                                        Убрать
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomTabBar />
        </div>
    );
}
