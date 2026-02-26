"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

export interface Program {
    id: string;
    name: string;
    university: string;
    universityShort: string;
    matchPercent: number;
    tags: string[];
    aiInsight: string;
    city: string;
    duration: string;
    language: string;
    passingScore: number;
    budgetPlaces: number;
    costPerYear: number;
    description: string;
    whyFits: string;
    theoryPercent: number;
    practicePercent: number;
    rating: number;
    employment: number;
    dropout: number;
    satisfaction: number;
    expectedSalary: { claimed: number; real: number };
    hashtags: string[];
    subjects: string[];
    careers: string[];
    partners: string[];
}

interface AppState {
    // Auth
    user: User | null;
    isAuthLoading: boolean;
    signOut: () => Promise<void>;

    // Data
    savedPrograms: string[];
    toggleSavedProgram: (id: string) => void;
    recommendations: Program[];
    setRecommendations: (v: Program[]) => void;
    isLoading: boolean;
    error: string | null;

    // Preferences
    userPath: UserPath | null;
    setUserPath: (path: UserPath | null) => void;
}

export interface UserPath {
    educationLevel: string;
    subjects: string[];
    studyFormat: string;
    careerTrack: string;
    preferredCity?: string;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const supabase = createClient();

    // Auth state
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    // Data state
    const [savedPrograms, setSavedPrograms] = useState<string[]>([]);
    const [recommendations, setRecommendations] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userPath, setUserPath] = useState<UserPath | null>(null);

    // Listen to auth changes
    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setIsAuthLoading(false);
        });

        // Initial session check
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            setIsAuthLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load programs from API
    useEffect(() => {
        if (!user) return;

        const loadPrograms = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/programs");
                if (!res.ok) throw new Error("Failed to fetch programs");
                const data = await res.json();
                setRecommendations(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
                console.error("Error loading programs:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadPrograms();
    }, [user]);

    // Load saved programs from API
    useEffect(() => {
        if (!user) return;

        const loadSaved = async () => {
            try {
                const res = await fetch("/api/saved");
                if (!res.ok) return;
                const data = await res.json();
                setSavedPrograms(data.map((s: any) => s.programId));
            } catch {
                // ignore
            }
        };

        loadSaved();
    }, [user]);

    // Load user path from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("userPath");
        if (saved) {
            try {
                setUserPath(JSON.parse(saved));
            } catch {
                // ignore
            }
        }
    }, []);

    const toggleSavedProgram = async (id: string) => {
        const isSaved = savedPrograms.includes(id);

        // Optimistic update
        setSavedPrograms((prev) =>
            isSaved ? prev.filter((p) => p !== id) : [...prev, id]
        );

        try {
            if (isSaved) {
                await fetch(`/api/saved?programId=${id}`, { method: "DELETE" });
            } else {
                await fetch("/api/saved", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ programId: id }),
                });
            }
        } catch {
            // Revert on error
            setSavedPrograms((prev) =>
                isSaved ? [...prev, id] : prev.filter((p) => p !== id)
            );
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSavedPrograms([]);
        setRecommendations([]);
    };

    return (
        <AppContext.Provider
            value={{
                user,
                isAuthLoading,
                signOut,
                savedPrograms,
                toggleSavedProgram,
                recommendations,
                setRecommendations,
                isLoading,
                error,
                userPath,
                setUserPath,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppContext must be used within AppProvider");
    return context;
}
