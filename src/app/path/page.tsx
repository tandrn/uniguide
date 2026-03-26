"use client";

import Link from "next/link";
import { BottomTabBar } from "@/components/BottomTabBar";
import { useAppContext } from "@/context/AppContext";
import { useState, useEffect } from "react";

// Scenarios Types
type TimelineStage = "current" | "milestone" | "recommended" | "alt" | "warning" | "course" | "semester";

interface TimelineItem {
    id: string;
    stage: TimelineStage;
    title: string;
    subtitle: string;
    detail?: string;
    progress?: number;
    match?: number;
    tags?: string[];
    programId?: string;
    // Reality Tracker
    isPassed?: boolean;
    isFailed?: boolean;
    tasks?: { id: string, name: string, passed: boolean }[];
    // Deep Dive
    semesterContext?: string;
    // Warnings & Courses
    warningText?: string;
    courseInfo?: { provider: string, name: string, duration: string };
}

export default function PathPage() {
    const { recommendations, isLoading, userPath, setUserPath, user } = useAppContext();
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [showProgramPicker, setShowProgramPicker] = useState(false);
    const [currentStage, setCurrentStage] = useState<"applicant" | "year1" | "year2" | "year3" | "year4">("year1");

    // Deep Dive State
    const [selectedSemester, setSelectedSemester] = useState<TimelineItem | null>(null);
    const [semesterDetails, setSemesterDetails] = useState<any>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Warning Pop-up State
    const [selectedWarning, setSelectedWarning] = useState<TimelineItem | null>(null);
    const [warningDetails, setWarningDetails] = useState<any>(null);
    const [isLoadingWarning, setIsLoadingWarning] = useState(false);

    // Track simulated vs actual goal
    const [simulatedGoalId, setSimulatedGoalId] = useState<string | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    // Calculate EGE Average for 100-point scale
    const egeAvg = userPath?.subjects && userPath.subjects.length > 0
        ? Math.round(
            userPath.subjects.reduce((sum, id) => sum + (userPath.egeScores[`sub_${id}`] || 0), 0) / userPath.subjects.length
        )
        : 0;

    useEffect(() => {
        if (recommendations.length === 0) return;

        const manualId = userPath?.egeScores?.selectedProgramId;
        const autoMatch = userPath?.careerTrack
            ? recommendations.find(p => p.careers.some(c => c.toLowerCase().includes(userPath.careerTrack.toLowerCase()))) || recommendations[0]
            : recommendations[0];

        const baseProgram = manualId
            ? (recommendations.find(p => p.id === manualId) || autoMatch)
            : autoMatch;

        // Base goal vs simulated goal
        const currentGoal = simulatedGoalId
            ? recommendations.find(p => p.id === simulatedGoalId) || baseProgram
            : baseProgram;

        const passedTasks = userPath?.egeScores?.passedExams || {};
        const externalCourses = userPath?.egeScores?.externalCourses || [];
        const hasFailedTask = Object.values(passedTasks).some(v => v === false);

        // Timeline Generation Logic based on Current Stage
        let generatedTimeline: TimelineItem[] = [];

        // Base/Current Stage Node
        generatedTimeline.push({
            id: "stage_current",
            stage: "current",
            title: baseProgram.name,
            subtitle: `${baseProgram.universityShort} · Бакалавриат`,
            detail: `${baseProgram.duration} года · Ср. балл ЕГЭ: ${egeAvg}/100`,
            progress: currentStage === "applicant" ? 0 : currentStage === "year1" ? 25 : currentStage === "year2" ? 50 : currentStage === "year3" ? 75 : 100,
        });

        // Semester 1 (1st Year)
        if (currentStage === "applicant" || currentStage === "year1") {
            generatedTimeline.push({
                id: "sem_1",
                stage: "semester",
                title: "1 курс · Весна",
                subtitle: "Фундаментальная подготовка",
                semesterContext: "1st year spring",
                isPassed: passedTasks["sem_1"] === true,
                isFailed: passedTasks["sem_1"] === false,
                tasks: [
                    { id: "task_math", name: "Математический анализ", passed: passedTasks["task_math"] === true },
                    { id: "task_prog", name: "Основы программирования", passed: passedTasks["task_prog"] === true }
                ]
            });
        }

        // Semester 3 (2nd Year)
        if (currentStage !== "year3" && currentStage !== "year4") {
            generatedTimeline.push({
                id: "sem_3",
                stage: "semester",
                title: "2 курс · Осень",
                subtitle: "Начало специализации",
                semesterContext: "2nd year fall",
                isPassed: passedTasks["sem_3"] === true,
                isFailed: passedTasks["sem_3"] === false,
                tasks: [
                    { id: "task_algo", name: "Алгоритмы и структуры", passed: passedTasks["task_algo"] === true }
                ]
            });
        }

        // Scenario 1: Gap Constructor Trigger (only if not already added external course)
        if (!externalCourses.includes("sql_course") && currentGoal.name.includes("Интеллект")) {
            generatedTimeline.push({
                id: "warning_sql",
                stage: "warning",
                title: "[ Требуется внимание ]",
                subtitle: "Разрыв навыков перед стажировкой",
            });
        }

        // Scenario 1: External Course Display
        if (externalCourses.includes("sql_course")) {
            generatedTimeline.push({
                id: "course_sql",
                stage: "course",
                title: "Курс партнера: SQL Data Analytics",
                subtitle: "Яндекс Практикум · 3 месяца",
            });
        }

        generatedTimeline.push({
            id: "internship_summer",
            stage: "milestone",
            title: "Летняя стажировка",
            subtitle: "3 курс · BigTech"
        });

        // Simulating scenario: change milestones
        if (simulatedGoalId && simulatedGoalId !== baseProgram.id) {
            generatedTimeline.push({
                id: "simulated_club",
                stage: "milestone",
                title: "Студенческий бизнес-клуб",
                subtitle: "Рекомендуется для развития Soft Skills"
            });
        }

        // Final Goal - impacted by failures
        generatedTimeline.push({
            id: "goal_final",
            stage: "recommended",
            title: "Цель: " + (currentGoal.careers[0] || "Специалист"),
            subtitle: currentGoal.name,
            match: currentGoal.matchPercent,
            tags: currentGoal.hashtags.slice(0, 3),
            programId: currentGoal.id,
        });

        setTimeline(generatedTimeline);
    }, [recommendations, userPath, egeAvg, simulatedGoalId, currentStage]);

    const syncUserData = async (updates: any) => {
        if (!userPath) return;
        const newPath = {
            ...userPath,
            egeScores: { ...userPath.egeScores, ...updates }
        };
        setUserPath(newPath);
        localStorage.setItem("userPath", JSON.stringify(newPath));

        if (user) {
            try {
                await fetch("/api/user", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ egeScores: newPath.egeScores }),
                });
            } catch (e) {
                console.error("Failed to sync", e);
            }
        }
    };

    // Scenario 4: Reality Tracker Handler
    const handleToggleTask = (taskId: string, currentStatus: boolean, blockId: string) => {
        const passedExams = userPath?.egeScores?.passedExams || {};

        // If clicking on an already passed task, we fail it to show the Reality Tracker mechanic
        const newStatus = currentStatus ? false : true;

        const newExams = {
            ...passedExams,
            [taskId]: newStatus
        };

        // If any task in a block is failed, the block is failed
        const allBlockTasksPassed = timeline.find(t => t.id === blockId)?.tasks?.every(tk =>
            tk.id === taskId ? newStatus : newExams[tk.id]
        );
        newExams[blockId] = allBlockTasksPassed;

        syncUserData({ passedExams: newExams });

        // If failed, ping AI for advice
        if (!newStatus) {
            handleFailedTaskAI(taskId);
        }
    };

    const handleFailedTaskAI = async (taskId: string) => {
        const manualId = userPath?.egeScores?.selectedProgramId;
        const programName = recommendations.find(p => p.id === manualId)?.name || "Программа";
        const taskName = taskId === "task_math" ? "Математический анализ" :
            taskId === "task_prog" ? "Основы программирования" : "Алгоритмы";

        try {
            const res = await fetch("/api/path/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "reality_tracker",
                    programName,
                    context: { failedSubject: taskName }
                })
            });
            const data = await res.json();
            if (data.advice) {
                alert(`⚠️ Упс..\n\n${data.impact}\n\nРекомендация: ${data.advice}`);
            }
        } catch (e) {
            console.error(e);
        }
    };


    // Scenario 3: Deep Dive Handler
    const openSemesterDetails = async (item: TimelineItem) => {
        setSelectedSemester(item);
        setSemesterDetails(null);
        setIsLoadingDetails(true);

        const manualId = userPath?.egeScores?.selectedProgramId;
        const programName = recommendations.find(p => p.id === manualId)?.name || "Программа";

        try {
            const res = await fetch("/api/path/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "semester_details",
                    programName,
                    context: { semester: item.title }
                })
            });
            const data = await res.json();
            setSemesterDetails(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // Scenario 1: Gap Warning Handler
    const openWarning = async (item: TimelineItem) => {
        setSelectedWarning(item);
        setWarningDetails(null);
        setIsLoadingWarning(true);

        const manualId = userPath?.egeScores?.selectedProgramId;
        const currentGoal = recommendations.find(p => p.id === manualId) || recommendations[0];

        try {
            const res = await fetch("/api/path/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "gap_warning",
                    programName: currentGoal.name,
                    context: { goal: currentGoal.careers[0] || "Junior" }
                })
            });
            const data = await res.json();
            setWarningDetails(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingWarning(false);
        }
    };

    const addExternalCourse = () => {
        const externalCourses = userPath?.egeScores?.externalCourses || [];
        syncUserData({ externalCourses: [...externalCourses, "sql_course"] });
        setSelectedWarning(null);
    };

    // Scenario 2: What If Handler
    const handleSelectProgram = async (id: string, simulate: boolean) => {
        if (!userPath) return;

        if (simulate) {
            setIsSimulating(true);
            setSimulatedGoalId(id);
            setShowProgramPicker(false);
            setTimeout(() => setIsSimulating(false), 500); // Trigger animation reflow
        } else {
            // Hard change
            setSimulatedGoalId(null);
            syncUserData({ selectedProgramId: id });
            setShowProgramPicker(false);
        }
    };


    if (isLoading || timeline.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center pb-20 bg-background min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-text-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                </div>
            </div>
        );
    }

    // Checking if future branch is tainted by failures
    const passedExams = userPath?.egeScores?.passedExams || {};
    const hasFailed = Object.values(passedExams).some(v => v === false);

    return (
        <div className="flex-1 flex flex-col pb-20 bg-background min-h-screen relative overflow-x-hidden">
            {/* Header */}
            <div className="px-6 pt-12 pb-8 z-10 bg-background/80 backdrop-blur-md sticky top-0 border-b border-border mb-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary">
                        Траектория
                    </span>
                    <div className="flex gap-2">
                        <select
                            value={currentStage}
                            onChange={(e) => setCurrentStage(e.target.value as any)}
                            className="bg-transparent text-[11px] font-mono text-text-secondary border border-border rounded px-2 py-1 outline-none hover:border-text-tertiary focus:border-text-primary transition-colors appearance-none cursor-pointer"
                        >
                            <option value="applicant">Абитуриент</option>
                            <option value="year1">1 курс</option>
                            <option value="year2">2 курс</option>
                            <option value="year3">3 курс</option>
                            <option value="year4">4 курс (Выпуск)</option>
                        </select>
                        <button
                            onClick={() => setShowProgramPicker(true)}
                            className="text-[12px] font-mono uppercase tracking-[0.05em] px-3 py-1.5 border border-border rounded-lg hover:border-text-primary transition-colors text-text-secondary whitespace-nowrap"
                        >
                            Сменить цель
                        </button>
                    </div>
                </div>
                <h1 className="font-serif text-[32px] leading-[1.15] text-text-primary mb-2">
                    Образовательный путь
                </h1>
                {hasFailed && (
                    <div className="mt-2 text-[12px] font-mono text-accent bg-accent/10 px-3 py-2 rounded border border-accent/20">
                        ⚠️ Обнаружены задолженности. Будущие милистоуны под угрозой.
                    </div>
                )}
            </div>

            {/* Timeline */}
            <div className={`px-6 transition-opacity duration-500 ${isSimulating ? "opacity-30" : "opacity-100"}`}>
                {timeline.map((item, i) => {
                    const isFuture = i > 1; // Simplistic future cut-off for visual
                    const isGoal = item.stage === "recommended";
                    const isWarning = item.stage === "warning";
                    const lineBleeds = isGoal ? false : true;
                    const dangerZone = isFuture && hasFailed;

                    return (
                        <div key={item.id} className="flex gap-5 relative group">
                            {/* Axis */}
                            <div className="flex flex-col items-center relative z-10 w-4">
                                <div
                                    className={`w-2.5 h-2.5 rounded-full mt-2 border-2 transition-colors duration-500
                                        ${item.stage === "current" ? "bg-text-primary border-text-primary" :
                                            isWarning ? "bg-transparent border-accent" :
                                                item.stage === "course" ? "bg-accent border-accent" :
                                                    item.isPassed ? "bg-success border-success" :
                                                        item.isFailed ? "bg-accent border-accent" :
                                                            dangerZone ? "bg-transparent border-accent/50" :
                                                                "bg-transparent border-border"}
                                    `}
                                />
                                {lineBleeds && (
                                    <div className={`w-px flex-1 my-2 transition-colors duration-500
                                        ${isWarning ? "border-l border-dashed border-accent" :
                                            item.stage === "course" ? "border-l border-dashed border-text-tertiary" :
                                                dangerZone ? "border-l border-dashed border-accent/40" :
                                                    "border-l border-solid border-border"}`} />
                                )}
                            </div>

                            {/* Content Block */}
                            <div className="flex-1 pb-8 animate-in slide-in-from-right-4 duration-500 fade-in" style={{ animationDelay: `${i * 100}ms` }}>

                                {/* Current Node */}
                                {item.stage === "current" && (
                                    <div className="bg-surface rounded-xl border border-text-primary p-6 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
                                        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-3">
                                            Текущий этап
                                        </span>
                                        <h3 className="font-serif text-[22px] leading-[1.2] text-text-primary mb-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-[14px] text-text-secondary mb-4">{item.subtitle}</p>
                                        {item.progress !== undefined && (
                                            <>
                                                <div className="h-[2px] bg-border rounded-full overflow-hidden mb-2">
                                                    <div className="h-full bg-text-primary rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                                                </div>
                                                <span className="font-mono text-[12px] text-text-tertiary">{item.detail}</span>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Interactive Semester Node (Reality Tracker) */}
                                {item.stage === "semester" && (
                                    <div className={`bg-surface rounded-xl border p-5 transition-all
                                        ${item.isFailed ? 'border-accent/40 bg-accent/5' :
                                            item.isPassed ? 'border-success/30' :
                                                'border-border hover:border-text-tertiary'}`}
                                    >
                                        <div
                                            className="flex justify-between items-start cursor-pointer group-hover:opacity-80 transition-opacity"
                                            onClick={() => openSemesterDetails(item)}
                                        >
                                            <div>
                                                <h3 className="font-sans font-medium text-[15px] text-text-primary">{item.title}</h3>
                                                <p className="text-[13px] text-text-tertiary mt-1">{item.subtitle}</p>
                                            </div>
                                            <span className="font-mono text-[11px] text-text-tertiary border border-border px-2 py-1 rounded hidden sm:inline-block">Подробнее →</span>
                                        </div>

                                        {/* Task Checkboxes */}
                                        {item.tasks && (
                                            <div className="mt-4 pt-4 border-t border-dashed border-border flex flex-col gap-2">
                                                {item.tasks.map(task => (
                                                    <label key={task.id} className="flex items-start gap-3 cursor-pointer group/label">
                                                        <div className="relative mt-0.5">
                                                            <input
                                                                type="checkbox"
                                                                className="peer sr-only"
                                                                checked={task.passed}
                                                                onChange={() => handleToggleTask(task.id, task.passed, item.id)}
                                                            />
                                                            <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors
                                                                ${task.passed ? 'bg-success border-success' :
                                                                    item.isFailed ? 'border-accent bg-transparent' :
                                                                        'border-text-tertiary bg-transparent peer-focus:ring-2 ring-text-tertiary/20'}`}>
                                                                {task.passed && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                                            </div>
                                                        </div>
                                                        <span className={`text-[13px] leading-tight select-none transition-colors
                                                             ${task.passed ? 'text-text-tertiary line-through' :
                                                                item.isFailed ? 'text-accent' :
                                                                    'text-text-secondary group-hover/label:text-text-primary'}`}>
                                                            {task.name}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Milestone */}
                                {item.stage === "milestone" && (
                                    <div className={`bg-transparent p-3 rounded-lg border-l-2
                                        ${dangerZone ? 'border-accent text-accent' : 'border-text-tertiary text-text-secondary'}`}>
                                        <h3 className="font-sans font-medium text-[14px]">{item.title}</h3>
                                        <p className="text-[12px] mt-1 opacity-70">{item.subtitle}</p>
                                    </div>
                                )}

                                {/* Gap Warning (Scenario 1) */}
                                {item.stage === "warning" && (
                                    <button
                                        onClick={() => openWarning(item)}
                                        className="w-full text-left bg-background rounded-xl border border-dashed border-accent hover:bg-accent/5 p-4 transition-colors animate-pulse-slow relative overflow-hidden group/warn"
                                    >
                                        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent block mb-1">
                                            {item.title}
                                        </span>
                                        <h3 className="font-sans font-medium text-[14px] text-text-primary group-hover/warn:text-accent transition-colors">
                                            {item.subtitle}
                                        </h3>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-accent opacity-50 font-mono text-[10px]">
                                            [ АНАЛИЗ ]
                                        </div>
                                    </button>
                                )}

                                {/* External Partner Course */}
                                {item.stage === "course" && (
                                    <div className="bg-surface rounded-xl border border-text-tertiary p-5 relative">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-tertiary absolute -top-2.5 bg-background px-2 left-4">
                                            Внешний модуль
                                        </span>
                                        <h3 className="font-sans font-medium text-[15px] text-text-primary">{item.title}</h3>
                                        <p className="text-[13px] text-text-secondary mt-1 font-mono">{item.subtitle}</p>
                                    </div>
                                )}

                                {/* Final Goal Node */}
                                {item.stage === "recommended" && (
                                    <div>
                                        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-3 mt-2">
                                            Финал траектории
                                        </span>
                                        <div className={`bg-surface rounded-xl border p-6 transition-colors
                                            ${dangerZone ? 'border-accent/40 shadow-[0_0_15px_rgba(255,0,0,0.05)]' : 'border-border shadow-sm hover:border-text-tertiary'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className={`font-serif text-[22px] leading-[1.2] ${dangerZone ? 'text-accent' : 'text-text-primary'}`}>
                                                    {item.title}
                                                </h3>
                                                <span className={`font-mono text-[13px] px-2 py-1 rounded
                                                    ${dangerZone ? 'text-accent bg-accent/10' : 'text-success bg-success/10'}`}>
                                                    {dangerZone ? 'Риск срыва' : `${item.match}% Match`}
                                                </span>
                                            </div>
                                            <p className="text-[14px] text-text-secondary mb-4">{item.subtitle}</p>
                                            {item.tags && (
                                                <div className="flex flex-wrap gap-2">
                                                    {item.tags.map((tag) => (
                                                        <span key={tag} className="px-3 py-1 rounded-full text-[11px] border border-border text-text-secondary">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Slide-over Deep Dive (Scenario 3) */}
            {selectedSemester && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-all animate-in fade-in duration-300">
                    <div className="w-full max-w-sm h-full bg-background border-l border-border shadow-2xl animate-in slide-in-from-right-full duration-300 flex flex-col">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <div>
                                <h3 className="font-serif text-[20px] text-text-primary">{selectedSemester.title}</h3>
                                <p className="text-[13px] text-text-tertiary mt-1 font-mono uppercase tracking-widest">{selectedSemester.subtitle}</p>
                            </div>
                            <button onClick={() => setSelectedSemester(null)} className="p-2 text-text-secondary hover:text-text-primary group">
                                <span className="font-mono text-[10px] uppercase border px-2 py-1 rounded group-hover:border-text-primary transition-colors">Закрыть</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {isLoadingDetails ? (
                                <div className="h-40 flex items-center justify-center font-mono text-[12px] text-text-tertiary animate-pulse">
                                    [ AI Analyzing Pipeline... ]
                                </div>
                            ) : semesterDetails ? (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div>
                                        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-4 border-b border-border pb-2">
                                            Формируемые навыки
                                        </span>
                                        <ul className="space-y-3">
                                            {semesterDetails.skills?.map((s: any, i: number) => (
                                                <li key={i} className="flex justify-between items-center text-[14px]">
                                                    <span className="text-text-primary relative before:content-[''] before:absolute before:-left-3 before:top-2 before:w-1 before:h-1 before:bg-text-tertiary before:rounded-full ml-3">{s.name}</span>
                                                    <span className="font-mono text-[12px] text-text-tertiary bg-surface px-2 py-0.5 rounded border border-border">{s.hours}ч</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block mb-3 border-b border-border pb-2">
                                            Сложность: {semesterDetails.difficulty?.split('.')[0] || "Оценка"}
                                        </span>
                                        <p className="text-[13px] text-text-secondary leading-relaxed">
                                            {semesterDetails.difficulty}
                                        </p>
                                    </div>

                                    <div className="bg-surface p-4 rounded-xl border border-border">
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary mb-2 block">
                                            Статус рынка после семестра
                                        </span>
                                        <p className="text-[14px] text-text-primary font-medium">
                                            {semesterDetails.jobProspects}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-[13px] text-text-secondary">Не удалось загрузить данные ИИ.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Pop-up Gap Constructor (Scenario 1) */}
            {selectedWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-background w-full max-w-[420px] rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-300 border border-accent/20">
                        <div className="flex items-center gap-3 justify-center mb-6">
                            <span className="w-16 h-1 bg-accent/30 rounded-full" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Выявлен разрыв</span>
                            <span className="w-16 h-1 bg-accent/30 rounded-full" />
                        </div>

                        {isLoadingWarning ? (
                            <div className="h-32 flex items-center justify-center font-mono text-[12px] text-accent animate-pulse text-center">
                                Анализируем требования стажировок...
                            </div>
                        ) : warningDetails ? (
                            <div className="space-y-6 text-center animate-in fade-in duration-500">
                                <p className="text-[16px] text-text-primary font-serif leading-relaxed">
                                    {warningDetails.warningText}
                                </p>

                                <div className="bg-surface p-4 rounded-xl border border-dashed border-border text-left mt-6">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary mb-2 block">
                                        Решение: Модуль партнера
                                    </span>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[15px] font-medium text-text-primary">{warningDetails.suggestedCourse?.name}</p>
                                            <p className="text-[12px] text-text-secondary mt-1">{warningDetails.suggestedCourse?.provider}</p>
                                        </div>
                                        <span className="font-mono text-[11px] bg-background px-2 py-1 rounded border border-border">
                                            {warningDetails.suggestedCourse?.duration}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setSelectedWarning(null)}
                                        className="flex-1 py-3 border border-border rounded-lg text-[13px] font-mono uppercase hover:bg-hover transition-colors"
                                    >
                                        Проигнорировать
                                    </button>
                                    <button
                                        onClick={addExternalCourse}
                                        className="flex-1 py-3 bg-text-primary text-white rounded-lg text-[13px] font-medium hover:bg-black transition-colors"
                                    >
                                        Встроить курс
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setSelectedWarning(null)} className="w-full py-3 border border-border rounded-lg mt-4">Закрыть</button>
                        )}
                    </div>
                </div>
            )}


            {/* Program Picker Modal (Scenario 2: Simulator) */}
            {showProgramPicker && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-background w-full max-w-[500px] rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[85vh] flex flex-col">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
                            <div>
                                <h3 className="font-serif text-[24px] text-text-primary">Симулятор Развилок</h3>
                                <p className="text-sm text-text-secondary mt-1">Измените цель, чтобы перестроить будущий путь</p>
                            </div>
                            <button onClick={() => setShowProgramPicker(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-hover text-text-secondary hover:text-text-primary transition-colors border border-border">
                                &times;
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-3 bg-background relative">
                            {/* Option to clear simulation */}
                            {simulatedGoalId && (
                                <button
                                    onClick={() => { setSimulatedGoalId(null); setShowProgramPicker(false); }}
                                    className="w-full text-center p-3 rounded-lg border border-dashed border-accent text-accent font-mono text-[12px] uppercase tracking-wider mb-4 hover:bg-accent/5"
                                >
                                    Отменить симуляцию
                                </button>
                            )}

                            {recommendations.map(p => {
                                const isCurrentGoal = p.id === (simulatedGoalId || userPath?.egeScores?.selectedProgramId || timeline[0].programId);
                                const isOriginalBase = p.id === (userPath?.egeScores?.selectedProgramId || timeline[0].programId);

                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => handleSelectProgram(p.id, true)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${isCurrentGoal ? "border-text-primary bg-surface shadow-sm" : "border-border hover:border-text-tertiary"}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary">
                                                Новая цель: {p.careers[0] || "Специалист"}
                                            </span>
                                            <span className="font-mono text-[12px] text-success bg-success/10 px-1.5 py-0.5 rounded">{p.matchPercent}%</span>
                                        </div>
                                        <h4 className="font-medium text-[15px] text-text-primary mb-1">{p.name}</h4>
                                        <div className="text-[13px] text-text-secondary flex items-center justify-between">
                                            <span>{p.universityShort}</span>
                                            {isOriginalBase && <span className="text-[10px] font-mono border px-2 py-0.5 rounded text-text-tertiary uppercase">База</span>}
                                            {isCurrentGoal && !isOriginalBase && <span className="text-[10px] font-mono border border-text-primary bg-text-primary text-white px-2 py-0.5 rounded uppercase">Симуляция</span>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <BottomTabBar />
        </div>
    );
}
