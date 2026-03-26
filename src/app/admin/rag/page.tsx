"use client";
import { useState, useEffect } from "react";
import { BottomTabBar } from "@/components/BottomTabBar";

export default function RagAdminPage() {
    const [source, setSource] = useState("");
    const [text, setText] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [stats, setStats] = useState<{ chunksCount: number; sources: string[] } | null>(null);

    const loadStats = async () => {
        try {
            const res = await fetch("/api/admin/rag");
            if (res.ok) setStats(await res.json());
        } catch { }
    };
    useEffect(() => { loadStats(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        try {
            const res = await fetch("/api/admin/rag", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source, text }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setStatus("success");
            setMessage(data.message);
            setSource(""); setText("");
            loadStats();
        } catch (err: any) {
            setStatus("error"); setMessage(err.message);
        }
    };

    return (
        <div className="flex-1 flex flex-col pb-20 bg-background min-h-screen">
            <div className="px-6 pt-12 pb-8 border-b border-border">
                <h1 className="font-serif text-[32px] text-text-primary">Управление RAG</h1>
            </div>
            <div className="px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input type="text" required value={source} onChange={(e) => setSource(e.target.value)} placeholder="Source" className="w-full bg-surface border border-border rounded-lg p-3" />
                    <textarea required rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="Text" className="w-full bg-surface border border-border rounded-lg p-3" />
                    <button type="submit" disabled={status === "loading"} className="w-full py-4 bg-dark-bg text-white rounded-lg">
                        {status === "loading" ? "Загрузка..." : "Ingest"}
                    </button>
                    {message && <div className="p-4 rounded-lg bg-surface">{message}</div>}
                </form>
            </div>
            <BottomTabBar />
        </div>
    );
}
