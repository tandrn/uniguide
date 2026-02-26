"use client";

import React from "react";

interface SelectableCardProps {
    selected: boolean;
    onSelect: () => void;
    title: string;
    description?: string;
    label?: string;
    className?: string;
}

export function SelectableCard({
    selected,
    onSelect,
    title,
    description,
    label,
    className,
}: SelectableCardProps) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`w-full text-left p-6 rounded-xl border transition-all duration-200 ${selected
                    ? "border-text-primary bg-surface"
                    : "border-border bg-surface hover:bg-hover"
                } ${className || ""}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    {label && (
                        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-2">
                            {label}
                        </span>
                    )}
                    <span className={`font-sans text-base font-medium block ${selected ? "text-text-primary" : "text-text-primary"}`}>
                        {title}
                    </span>
                    {description && (
                        <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
                {/* Minimal radio circle */}
                <div className="flex-shrink-0 mt-1">
                    <div
                        className={`w-5 h-5 rounded-full border transition-all ${selected ? "border-text-primary" : "border-border"
                            }`}
                    >
                        {selected && (
                            <div className="w-full h-full rounded-full flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-text-primary" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
}
