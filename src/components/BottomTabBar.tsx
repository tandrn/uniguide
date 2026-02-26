"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
    { href: "/results", label: "Подбор" },
    { href: "/path", label: "Путь" },
    { href: "/saved", label: "Сохранённое" },
    { href: "/chat", label: "Помощник" },
];

export function BottomTabBar() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50">
            <div className="max-w-[640px] mx-auto flex justify-around items-center h-14 px-4">
                {TABS.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.label}
                            href={tab.href}
                            className={`font-mono text-[11px] uppercase tracking-[0.1em] transition-colors py-2 px-3 ${isActive ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary"
                                }`}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
