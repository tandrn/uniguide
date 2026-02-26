"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext, UserPath } from "@/context/AppContext";

const EDUCATION_LEVELS = [
    { id: "bachelor", title: "Бакалавриат", detail: "4 года · Первое высшее" },
    { id: "master", title: "Магистратура", detail: "2 года · После бакалавриата" },
    { id: "specialist", title: "Специалитет", detail: "5 лет · Инженерное образование" },
];

const STUDY_FORMATS = [
    { id: "full-time", title: "Очная", detail: "Полный день · Кампус" },
    { id: "part-time", title: "Заочная", detail: "Вечера и выходные" },
    { id: "online", title: "Онлайн", detail: "Дистанционное обучение" },
];

const CAREER_TRACKS = [
    { id: "development", title: "Разработка", detail: "Программист, разработчик" },
    { id: "data-science", title: "Data Science", detail: "Аналитик данных, ML" },
    { id: "management", title: "Менеджмент", detail: "Управление, бизнес" },
    { id: "design", title: "Дизайн", detail: "UX/UI, графический дизайн" },
];

const SUBJECTS = [
    { id: "math", name: "Математика" },
    { id: "physics", name: "Физика" },
    { id: "informatics", name: "Информатика" },
    { id: "russian", name: "Русский язык" },
    { id: "english", name: "Английский язык" },
    { id: "chemistry", name: "Химия" },
    { id: "history", name: "История" },
    { id: "biology", name: "Биология" },
];

const STEPS = [
    { label: "Уровень", title: "Уровень образования", subtitle: "Какую степень вы хотите получить?" },
    { label: "Предметы", title: "Предметы ЕГЭ", subtitle: "Какие экзамены вы сдаёте?" },
    { label: "Формат", title: "Формат обучения", subtitle: "Как удобнее учиться?" },
    { label: "Цель", title: "Карьерная цель", subtitle: "Кем хотите работать?" },
];

export default function StartPage() {
    const router = useRouter();
    const { setUserPath } = useAppContext();

    const [step, setStep] = useState(0);
    const [path, setPath] = useState<UserPath>({
        educationLevel: "",
        subjects: [],
        studyFormat: "",
        careerTrack: "",
    });

    const totalSteps = STEPS.length;
    const current = STEPS[step];

    const toggleSubject = (id: string) => {
        setPath(prev => ({
            ...prev,
            subjects: prev.subjects.includes(id)
                ? prev.subjects.filter(s => s !== id)
                : [...prev.subjects, id],
        }));
    };

    const canProceed =
        (step === 0 && path.educationLevel) ||
        (step === 1 && path.subjects.length > 0) ||
        (step === 2 && path.studyFormat) ||
        (step === 3 && path.careerTrack);

    const handleNext = () => {
        if (step < totalSteps - 1) {
            setStep(step + 1);
        } else {
            setUserPath(path);
            localStorage.setItem("userPath", JSON.stringify(path));
            router.push("/ege");
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-background min-h-screen">
            {/* Progress */}
            <div className="px-6 pt-10 pb-2">
                <div className="flex gap-1.5 mb-10">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className="h-[2px] flex-1 rounded-full transition-all duration-500"
                            style={{ backgroundColor: i <= step ? "#1a1a1a" : "#e8e5e0" }}
                        />
                    ))}
                </div>

                {/* Step label */}
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-4">
                    {current.label}
                </span>

                {/* Title */}
                <h1 className="font-serif text-[36px] leading-[1.1] text-text-primary mb-2">
                    {current.title}
                </h1>
                <p className="text-[15px] text-text-secondary leading-[1.7] mb-10">
                    {current.subtitle}
                </p>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 overflow-y-auto">
                {/* Step 0: Education Level */}
                {step === 0 && (
                    <div className="space-y-3">
                        {EDUCATION_LEVELS.map((level) => {
                            const selected = path.educationLevel === level.id;
                            return (
                                <button
                                    key={level.id}
                                    onClick={() => setPath(p => ({ ...p, educationLevel: level.id }))}
                                    className={`w-full text-left px-5 py-5 rounded-xl border transition-all ${selected
                                            ? "border-text-primary bg-surface"
                                            : "border-border bg-transparent hover:bg-hover"
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
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected ? "border-text-primary" : "border-border"
                                            }`}>
                                            {selected && <div className="w-2.5 h-2.5 rounded-full bg-text-primary" />}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Step 1: Subjects */}
                {step === 1 && (
                    <div className="flex flex-wrap gap-2">
                        {SUBJECTS.map((sub) => {
                            const selected = path.subjects.includes(sub.id);
                            return (
                                <button
                                    key={sub.id}
                                    onClick={() => toggleSubject(sub.id)}
                                    className={`px-4 py-2.5 rounded-full text-[14px] border transition-all ${selected
                                            ? "bg-dark-bg text-white border-dark-bg"
                                            : "border-border text-text-secondary hover:bg-hover"
                                        }`}
                                >
                                    {sub.name}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Step 2: Study Format */}
                {step === 2 && (
                    <div className="space-y-3">
                        {STUDY_FORMATS.map((fmt) => {
                            const selected = path.studyFormat === fmt.id;
                            return (
                                <button
                                    key={fmt.id}
                                    onClick={() => setPath(p => ({ ...p, studyFormat: fmt.id }))}
                                    className={`w-full text-left px-5 py-5 rounded-xl border transition-all ${selected
                                            ? "border-text-primary bg-surface"
                                            : "border-border bg-transparent hover:bg-hover"
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
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected ? "border-text-primary" : "border-border"
                                            }`}>
                                            {selected && <div className="w-2.5 h-2.5 rounded-full bg-text-primary" />}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Step 3: Career Track */}
                {step === 3 && (
                    <div className="space-y-3">
                        {CAREER_TRACKS.map((track) => {
                            const selected = path.careerTrack === track.id;
                            return (
                                <button
                                    key={track.id}
                                    onClick={() => setPath(p => ({ ...p, careerTrack: track.id }))}
                                    className={`w-full text-left px-5 py-5 rounded-xl border transition-all ${selected
                                            ? "border-text-primary bg-surface"
                                            : "border-border bg-transparent hover:bg-hover"
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
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected ? "border-text-primary" : "border-border"
                                            }`}>
                                            {selected && <div className="w-2.5 h-2.5 rounded-full bg-text-primary" />}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-6">
                <div className="flex items-center gap-3">
                    {step > 0 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary hover:text-text-primary transition-colors px-4 py-3"
                        >
                            Назад
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={!canProceed}
                        className="flex-1 py-4 bg-dark-bg text-white text-[15px] font-medium rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                        {step < totalSteps - 1 ? "Продолжить" : "Далее"}
                    </button>
                </div>
            </div>
        </div>
    );
}
