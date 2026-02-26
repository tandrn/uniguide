"use client";

import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="flex-1 flex flex-col px-6 pt-16 pb-12 bg-background min-h-screen">
      {/* Logo */}
      <div className="mb-20">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary">
          uniguide
        </span>
      </div>

      {/* Hero text */}
      <div className="mb-16">
        <h1 className="font-serif text-[48px] leading-[1.1] text-text-primary mb-6">
          Найдите программу,
          <br />
          <span className="text-accent italic">которая вам подходит</span>
        </h1>
        <p className="text-text-secondary text-base leading-[1.7] max-w-[420px]">
          Мы поможем подобрать университет и направление на основе ваших
          интересов, предметов и целей. Спокойно, без спешки.
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-12 mb-20">
        <div>
          <span className="font-serif text-[32px] text-text-primary">2k+</span>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary mt-1">
            Студентов
          </p>
        </div>
        <div>
          <span className="font-serif text-[32px] text-text-primary">150+</span>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary mt-1">
            Программ
          </p>
        </div>
        <div>
          <span className="font-serif text-[32px] text-text-primary">94%</span>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary mt-1">
            Точность
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto">
        <Link
          href="/start"
          className="block w-full py-4 bg-dark-bg text-white text-center font-sans font-medium text-base rounded-lg transition-opacity hover:opacity-90 active:opacity-80"
        >
          Начать подбор
        </Link>
        <p className="text-center text-text-tertiary text-sm mt-4">
          Займёт около 3 минут
        </p>
      </div>
    </div>
  );
}
