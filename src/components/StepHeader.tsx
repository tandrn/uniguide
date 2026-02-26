"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface StepHeaderProps {
    step: number;
    totalSteps: number;
    onSkip?: () => void;
    backHref?: string;
}

export function StepHeader({ step, totalSteps, onSkip, backHref }: StepHeaderProps) {
    return (
        <div className="mb-12">
            {/* Top row */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {backHref && (
                        <Link href={backHref} className="text-text-secondary hover:text-text-primary transition-colors">
                            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
                        </Link>
                    )}
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary">
                        Шаг {step} из {totalSteps}
                    </span>
                </div>
                {onSkip && (
                    <button
                        onClick={onSkip}
                        className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary hover:text-text-primary transition-colors"
                    >
                        Пропустить
                    </button>
                )}
            </div>

            {/* Progress bar — thin, minimal */}
            <div className="flex gap-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                        key={i}
                        className="h-[2px] flex-1 rounded-full transition-all duration-700"
                        style={{
                            backgroundColor: i < step ? "#1a1a1a" : "#e8e5e0",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
