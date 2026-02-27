"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext, UserPath } from "@/context/AppContext";

const EDUCATION_LEVELS = [
    { id: "bachelor", title: "Бакалавриат", detail: "4 года · Первое высшее" },
    { id: "master", title: "Магистратура", detail: "2 года · После бакалавриата" },
    { id: "specialist", title: "Специалитет", detail: "5 лет · Инженерное образование" },
];

const CAREER_TRACKS = [
    { id: "development", title: "Разработка", detail: "Программист, Software Engineer" },
    { id: "data-science", title: "Data Science", detail: "Аналитик данных, Machine Learning" },
    { id: "management", title: "Менеджмент", detail: "Управление продуктом, продакт-менеджер" },
    { id: "design", title: "Дизайн", detail: "UX/UI, графический дизайн" },
    { id: "science", title: "Наука", detail: "Исследования, PhD" },
    { id: "undecided", title: "Пока не решил", detail: "Хочу изучить варианты" },
];

const STUDY_FORMATS = [
    { id: "full-time", title: "Очная", detail: "Полный день · Кампус" },
    { id: "part-time", title: "Заочная", detail: "Вечера и выходные" },
    { id: "online", title: "Онлайн", detail: "Дистанционное обучение" },
];

const SUBJECTS = [
    { id: "russian", name: "Русский язык", required: true },
    { id: "math", name: "Математика (Профиль)" },
    { id: "math_basic", name: "Математика (База)" },
    { id: "physics", name: "Физика" },
    { id: "informatics", name: "Информатика" },
    { id: "english", name: "Английский язык" },
    { id: "chemistry", name: "Химия" },
    { id: "history", name: "История" },
    { id: "biology", name: "Биология" },
    { id: "social", name: "Обществознание" },
    { id: "literature", name: "Литература" },
];

const CITIES = ["Москва", "Санкт-Петербург", "Иннополис", "Другие регионы", "Любой"];

const STEPS = [
    { label: "Уровень", title: "Уровень образования", subtitle: "Какую степень вы хотите получить?" },
    { label: "Цель", title: "Карьерная цель", subtitle: "Кем хотите работать в будущем?" },
    { label: "Формат", title: "Формат обучения", subtitle: "Как вам удобнее учиться?" },
    { label: "Предметы", title: "Предметы ЕГЭ", subtitle: "Какие экзамены вы сдаёте или планируете сдавать?" },
    { label: "Баллы", title: "Ваши баллы ЕГЭ и достижения", subtitle: "Укажите баллы — и мы покажем реальный шанс поступления на бюджет и платно. Это сильно повысит точность (до 94%)" },
    { label: "Условия", title: "Где хотите учиться и как планируете оплачивать", subtitle: "Выберите город и вариант финансирования" },
];

export default function StartPage() {
    const router = useRouter();
    const { setUserPath, user } = useAppContext();

    const [step, setStep] = useState(0);
    const [path, setPath] = useState<UserPath>({
        educationLevel: "",
        careerTrack: "",
        studyFormat: "",
        subjects: [],
        city: ["Любой"], // Default to any city
        budget: 0,
        egeScores: {},
    });

    const [budgetType, setBudgetType] = useState<"budget" | "both" | "paid">("budget");
    const [budgetAmount, setBudgetAmount] = useState<number>(300000);
    const [showAchievements, setShowAchievements] = useState(false);

    // Initial config for required subjects
    useEffect(() => {
        if (path.subjects.length === 0) {
            setPath(prev => ({ ...prev, subjects: ["russian"] }));
        }
    }, [path.subjects.length]);

    const totalSteps = STEPS.length;
    const current = STEPS[step];

    const toggleSubject = (id: string) => {
        if (id === "russian") return; // required
        setPath(prev => {
            const subjects = prev.subjects.includes(id)
                ? prev.subjects.filter(s => s !== id)
                : [...prev.subjects, id];

            // cleanup egeScores logic if subject is removed
            const egeScores = { ...prev.egeScores };
            if (prev.subjects.includes(id)) {
                delete egeScores[`sub_${id}`];
            }

            return { ...prev, subjects, egeScores };
        });
    };

    const toggleCity = (city: string) => {
        setPath(prev => {
            if (city === "Любой") {
                return { ...prev, city: prev.city.includes("Любой") ? [] : ["Любой"] };
            }
            const withoutAny = prev.city.filter(c => c !== "Любой");
            const newCities = withoutAny.includes(city)
                ? withoutAny.filter(c => c !== city)
                : [...withoutAny, city];
            return { ...prev, city: newCities };
        });
    };

    const updateEgeScore = (key: string, value: string) => {
        if (typeof value === "string") {
            const num = value.replace(/\D/g, "");
            if (num.length > 3) return;
            const parsed = parseInt(num, 10);
            if (num && parsed > 100) return;

            setPath(prev => ({
                ...prev,
                egeScores: { ...prev.egeScores, [key]: num ? parsed : null }
            }));
        } else {
            setPath(prev => ({
                ...prev,
                egeScores: { ...prev.egeScores, [key]: value }
            }));
        }
    };

    const currentEgeSum = path.subjects.reduce((sum, id) => {
        const score = path.egeScores[`sub_${id}`] || 0;
        return sum + score;
    }, 0);

    const bonusSum = (path.egeScores.olympiad || 0) +
        (path.egeScores.medal ? 5 : 0) +
        (path.egeScores.gto ? 2 : 0) +
        (path.egeScores.volunteer ? 2 : 0) +
        (path.egeScores.dvi || 0);

    const totalSum = currentEgeSum + bonusSum;

    const canProceed = () => {
        if (step === 0) return path.educationLevel !== "";
        if (step === 1) return path.careerTrack !== "";
        if (step === 2) return path.studyFormat !== "";
        if (step === 3) return path.subjects.length > 0;
        if (step === 4) return true; // EGE step is skippable or partially fillable
        if (step === 5) return path.city.length > 0;
        return false;
    };

    const handleNext = async () => {
        if (step === 5) {
            // Finalize budget
            const finalPath = { ...path };
            if (budgetType === "budget") {
                finalPath.budget = 0;
            } else {
                finalPath.budget = budgetAmount;
            }

            // Also save to egeScores jsonb
            finalPath.egeScores.budgetType = budgetType;

            setUserPath(finalPath);
            localStorage.setItem("userPath", JSON.stringify(finalPath));

            // Sync with Supabase if a user is logged in
            if (user) {
                try {
                    await fetch("/api/user", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            educationLevel: finalPath.educationLevel,
                            careerTrack: finalPath.careerTrack,
                            studyFormat: finalPath.studyFormat,
                            selectedSubjects: finalPath.subjects,
                            city: finalPath.city,
                            budget: finalPath.budget,
                            egeScores: finalPath.egeScores,
                        }),
                    });
                } catch (e) {
                    console.error("Failed to sync profile", e);
                }
            }

            router.push("/loading");
        } else {
            setStep(step + 1);
        }
    };

    const handleSkip = () => {
        if (step === 4) setStep(step + 1);
    };

    return (
        <div className="flex-1 flex flex-col bg-background min-h-screen font-sans">
            {/* Progress */}
            <div className="px-6 pt-10 pb-2 bg-background sticky top-0 z-10">
                <div className="flex gap-1 mb-8">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className="h-[2px] flex-1 rounded-full transition-all duration-300"
                            style={{ backgroundColor: i <= step ? "#1a1a1a" : "#e8e5e0" }}
                        />
                    ))}
                </div>

                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-4">
                    {current.label}
                </span>

                <h1 className="font-serif text-[32px] leading-[1.1] text-text-primary mb-3">
                    {current.title}
                </h1>
                <p className="text-[14px] text-text-secondary leading-[1.6]">
                    {current.subtitle}
                </p>

                {step === 4 && (
                    <div className="mt-4 pb-2">
                        <div className="flex justify-between items-baseline border-b border-border pb-3">
                            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-secondary">
                                Предварительная сумма
                            </span>
                            <div className="text-right">
                                <span className="font-serif text-[36px] text-text-primary leading-none block">
                                    {totalSum}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 px-6 pb-24 overflow-y-auto">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">

                    {/* Step 0: Education Level */}
                    {step === 0 && (
                        <div className="space-y-3 pt-4">
                            {EDUCATION_LEVELS.map((level) => {
                                const selected = path.educationLevel === level.id;
                                return (
                                    <button
                                        key={level.id}
                                        onClick={() => setPath(p => ({ ...p, educationLevel: level.id }))}
                                        className={`w-full text-left px-5 py-5 rounded-xl border transition-all ${selected
                                            ? "border-text-primary bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
                                            : "border-border bg-transparent hover:bg-hover hover:border-text-tertiary"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-sans text-[15px] font-medium text-text-primary block">
                                                    {level.title}
                                                </span>
                                                <span className="text-[13px] text-text-tertiary mt-0.5 block">
                                                    {level.detail}
                                                </span>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selected ? "border-text-primary" : "border-border"}`}>
                                                {selected && <div className="w-2.5 h-2.5 rounded-full bg-text-primary" />}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Step 1: Career Track */}
                    {step === 1 && (
                        <div className="space-y-3 pt-4">
                            {CAREER_TRACKS.map((track) => {
                                const selected = path.careerTrack === track.id;
                                return (
                                    <button
                                        key={track.id}
                                        onClick={() => setPath(p => ({ ...p, careerTrack: track.id }))}
                                        className={`w-full text-left px-5 py-5 rounded-xl border transition-all ${selected
                                            ? "border-text-primary bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
                                            : "border-border bg-transparent hover:bg-hover hover:border-text-tertiary"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-sans text-[15px] font-medium text-text-primary block">
                                                    {track.title}
                                                </span>
                                                <span className="text-[13px] text-text-tertiary mt-0.5 block">
                                                    {track.detail}
                                                </span>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selected ? "border-text-primary" : "border-border"}`}>
                                                {selected && <div className="w-2.5 h-2.5 rounded-full bg-text-primary" />}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Step 2: Study Format */}
                    {step === 2 && (
                        <div className="space-y-3 pt-4">
                            {STUDY_FORMATS.map((fmt) => {
                                const selected = path.studyFormat === fmt.id;
                                return (
                                    <button
                                        key={fmt.id}
                                        onClick={() => setPath(p => ({ ...p, studyFormat: fmt.id }))}
                                        className={`w-full text-left px-5 py-5 rounded-xl border transition-all ${selected
                                            ? "border-text-primary bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
                                            : "border-border bg-transparent hover:bg-hover hover:border-text-tertiary"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-sans text-[15px] font-medium text-text-primary block">
                                                    {fmt.title}
                                                </span>
                                                <span className="text-[13px] text-text-tertiary mt-0.5 block">
                                                    {fmt.detail}
                                                </span>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selected ? "border-text-primary" : "border-border"}`}>
                                                {selected && <div className="w-2.5 h-2.5 rounded-full bg-text-primary" />}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Step 3: Subjects */}
                    {step === 3 && (
                        <div className="flex flex-wrap gap-2 pt-4">
                            {SUBJECTS.map((sub) => {
                                const selected = path.subjects.includes(sub.id);
                                return (
                                    <button
                                        key={sub.id}
                                        onClick={() => toggleSubject(sub.id)}
                                        className={`px-4 py-3 rounded-full text-[14px] font-medium border transition-all ${selected
                                            ? "bg-text-primary text-white border-text-primary"
                                            : "border-border text-text-secondary hover:border-text-tertiary"
                                            } ${sub.required ? "opacity-60 cursor-not-allowed" : ""}`}
                                    >
                                        {sub.name} {sub.required && " ✓"}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Step 4: EGE and Achievements */}
                    {step === 4 && (
                        <div className="pt-2">
                            {/* Inputs */}
                            <div className="space-y-0 border-b border-border pb-6">
                                {path.subjects.map(subId => {
                                    const sub = SUBJECTS.find(s => s.id === subId);
                                    if (!sub) return null;
                                    return (
                                        <div key={subId} className="flex justify-between items-center py-4 border-b border-border last:border-0 hover:bg-hover transition-colors rounded-lg px-2 -mx-2">
                                            <span className="text-[15px] font-medium text-text-primary">{sub.name}</span>
                                            <div className="flex items-baseline gap-2">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={path.egeScores[`sub_${subId}`] || ""}
                                                    onChange={(e) => updateEgeScore(`sub_${subId}`, e.target.value)}
                                                    placeholder="—"
                                                    className="w-14 text-right text-[18px] font-serif text-text-primary bg-transparent focus:outline-none placeholder:text-text-tertiary placeholder:font-sans"
                                                />
                                                <span className="text-[13px] text-text-tertiary font-mono">/100</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Additional Info / Achievements Accordion */}
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowAchievements(!showAchievements)}
                                    className="w-full flex justify-between items-center py-4 text-[15px] font-medium text-text-primary hover:text-accent transition-colors border-b border-border"
                                >
                                    <span>Дополнительно (олимпиады, ГТО, ДВИ)</span>
                                    <span className="font-mono text-[14px] text-text-tertiary">{showAchievements ? "−" : "+"}</span>
                                </button>

                                {showAchievements && (
                                    <div className="py-6 space-y-6 animate-in slide-in-from-top-2 duration-300">

                                        {/* Olympiads */}
                                        <div>
                                            <label className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-3">
                                                Олимпиады РШОШ
                                            </label>
                                            <div className="grid grid-cols-4 gap-2">
                                                <button onClick={() => updateEgeScore("olympiad", "0")} className={`py-2 text-[13px] border rounded-lg ${!path.egeScores.olympiad ? 'border-text-primary bg-text-primary text-white' : 'border-border text-text-secondary'}`}>Нет</button>
                                                <button onClick={() => updateEgeScore("olympiad", "10")} className={`py-2 text-[13px] border rounded-lg ${path.egeScores.olympiad === 10 ? 'border-text-primary bg-text-primary text-white' : 'border-border text-text-secondary'}`}>I ур (+10)</button>
                                                <button onClick={() => updateEgeScore("olympiad", "5")} className={`py-2 text-[13px] border rounded-lg ${path.egeScores.olympiad === 5 ? 'border-text-primary bg-text-primary text-white' : 'border-border text-text-secondary'}`}>II ур (+5)</button>
                                                <button onClick={() => updateEgeScore("olympiad", "2")} className={`py-2 text-[13px] border rounded-lg ${path.egeScores.olympiad === 2 ? 'border-text-primary bg-text-primary text-white' : 'border-border text-text-secondary'}`}>III ур (+2)</button>
                                            </div>
                                        </div>

                                        {/* Achievements */}
                                        <div>
                                            <label className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-3">
                                                Индивидуальные достижения
                                            </label>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${path.egeScores.medal ? 'bg-text-primary border-text-primary' : 'border-border'}`}>
                                                        {path.egeScores.medal && <span className="text-white text-[12px]">✓</span>}
                                                    </div>
                                                    <span className="text-[14px] text-text-secondary">Золотая медаль (+5 баллов)</span>
                                                    <input type="checkbox" className="hidden" checked={!!path.egeScores.medal} onChange={(e) => updateEgeScore("medal", e.target.checked as any)} />
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${path.egeScores.gto ? 'bg-text-primary border-text-primary' : 'border-border'}`}>
                                                        {path.egeScores.gto && <span className="text-white text-[12px]">✓</span>}
                                                    </div>
                                                    <span className="text-[14px] text-text-secondary">Значок ГТО (+2 балла)</span>
                                                    <input type="checkbox" className="hidden" checked={!!path.egeScores.gto} onChange={(e) => updateEgeScore("gto", e.target.checked as any)} />
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${path.egeScores.volunteer ? 'bg-text-primary border-text-primary' : 'border-border'}`}>
                                                        {path.egeScores.volunteer && <span className="text-white text-[12px]">✓</span>}
                                                    </div>
                                                    <span className="text-[14px] text-text-secondary">Волонтёрство (+2 балла)</span>
                                                    <input type="checkbox" className="hidden" checked={!!path.egeScores.volunteer} onChange={(e) => updateEgeScore("volunteer", e.target.checked as any)} />
                                                </label>
                                            </div>
                                        </div>

                                        {/* DVI */}
                                        <div>
                                            <label className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-3">
                                                ДВИ (если требуется вузом)
                                            </label>
                                            <div className="flex items-center gap-3 bg-surface p-3 rounded-lg border border-border">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={path.egeScores.dvi || ""}
                                                    onChange={(e) => updateEgeScore("dvi", e.target.value)}
                                                    placeholder="Например, 85"
                                                    className="w-full text-[15px] font-medium text-text-primary bg-transparent focus:outline-none placeholder:font-normal"
                                                />
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 5: City and Finance */}
                    {step === 5 && (
                        <div className="space-y-10 pt-4">
                            {/* City */}
                            <div>
                                <label className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-4">
                                    Выберите города
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CITIES.map(c => {
                                        const selected = path.city.includes(c);
                                        return (
                                            <button
                                                key={c}
                                                onClick={() => toggleCity(c)}
                                                className={`px-4 py-3 rounded-full text-[14px] font-medium border transition-all ${selected
                                                    ? "bg-text-primary text-white border-text-primary"
                                                    : "border-border text-text-secondary hover:border-text-tertiary"
                                                    }`}
                                            >
                                                {c}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Financing */}
                            <div>
                                <label className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-4">
                                    Финансирование
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                                    <button onClick={() => setBudgetType("budget")} className={`px-4 py-4 rounded-xl border transition-all text-left ${budgetType === "budget" ? "border-text-primary bg-surface shadow-sm" : "border-border text-text-secondary"}`}>
                                        <span className="block text-[14px] font-medium mb-1">Только бюджет</span>
                                    </button>
                                    <button onClick={() => setBudgetType("both")} className={`px-4 py-4 rounded-xl border transition-all text-left ${budgetType === "both" ? "border-text-primary bg-surface shadow-sm" : "border-border text-text-secondary"}`}>
                                        <span className="block text-[14px] font-medium mb-1">Бюджет + Платное</span>
                                    </button>
                                    <button onClick={() => setBudgetType("paid")} className={`px-4 py-4 rounded-xl border transition-all text-left ${budgetType === "paid" ? "border-text-primary bg-surface shadow-sm" : "border-border text-text-secondary"}`}>
                                        <span className="block text-[14px] font-medium mb-1">Только платное</span>
                                    </button>
                                </div>

                                {/* Slider */}
                                {budgetType !== "budget" && (
                                    <div className="animate-in slide-in-from-top-2 duration-300 bg-surface border border-border rounded-xl p-5">
                                        <div className="flex justify-between items-end mb-6">
                                            <span className="text-[13px] text-text-secondary">Максимум в год</span>
                                            <span className="font-serif text-[24px] text-text-primary leading-none">
                                                {(budgetAmount / 1000).toFixed(0)} тыс. ₽
                                            </span>
                                        </div>

                                        <input
                                            type="range"
                                            min="100000"
                                            max="1000000"
                                            step="50000"
                                            value={budgetAmount}
                                            onChange={(e) => setBudgetAmount(parseInt(e.target.value))}
                                            className="w-full h-[3px] bg-border rounded-lg appearance-none cursor-pointer accent-text-primary focus:outline-none"
                                            style={{
                                                background: `linear-gradient(to right, #1a1a1a ${(budgetAmount - 100000) / (1000000 - 100000) * 100}%, #e8e5e0 0%)`
                                            }}
                                        />

                                        <div className="flex justify-between mt-3 text-[11px] font-mono text-text-tertiary">
                                            <span>100к ₽</span>
                                            <span>1 млн ₽ +</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Sticky Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border p-4 sm:p-6 z-20 mx-auto max-w-[800px]">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        {step > 0 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary hover:text-text-primary transition-colors px-4 py-4 border border-border hover:bg-hover rounded-lg"
                            >
                                Назад
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className="flex-1 py-4 bg-text-primary text-white text-[15px] font-medium rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black transition-colors"
                        >
                            {step < totalSteps - 1 ? "Продолжить" : "Подобрать программы"}
                        </button>
                    </div>
                    {step === 4 && (
                        <button
                            onClick={handleSkip}
                            className="text-[12px] text-text-tertiary hover:text-text-secondary transition-colors underline underline-offset-4 w-full text-center py-2"
                        >
                            Пропустить, но точность будет ниже
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
