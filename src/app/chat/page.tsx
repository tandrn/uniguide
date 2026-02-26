"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

const SUGGESTIONS = [
    "Какие предметы на 1 курсе в Бауманке?",
    "Сравни МГТУ и МГУ",
    "Где лучше стажировки?",
];

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [ragEnabled, setRagEnabled] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const content = text || input.trim();
        if (!content || isStreaming) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content,
        };

        const assistantMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "",
        };

        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        setInput("");
        setIsStreaming(true);

        try {
            const apiMessages = [...messages, userMsg].map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: apiMessages,
                    useRag: ragEnabled,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "API error");
            }

            const reader = res.body?.getReader();
            if (!reader) throw new Error("No reader");

            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                if (chunk.includes("[DONE]")) break;

                accumulated += chunk;

                setMessages((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last && last.role === "assistant") {
                        updated[updated.length - 1] = { ...last, content: accumulated };
                    }
                    return updated;
                });
            }
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Ошибка";
            setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                    updated[updated.length - 1] = {
                        ...last,
                        content: `Ошибка: ${errMsg}. Проверьте DEEPSEEK_API_KEY в .env.local`,
                    };
                }
                return updated;
            });
        } finally {
            setIsStreaming(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-background min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-10 pb-4 border-b border-border">
                <div className="flex items-center gap-4">
                    <Link
                        href="/results"
                        className="text-text-secondary hover:text-text-primary transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
                    </Link>
                    <div>
                        <span className="font-sans font-medium text-base text-text-primary">
                            Помощник
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary block">
                            {isStreaming ? "Печатает..." : "Онлайн"}
                        </span>
                    </div>
                </div>
                {/* RAG toggle */}
                <button
                    onClick={() => setRagEnabled(!ragEnabled)}
                    className={`font-mono text-[11px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border transition-colors ${ragEnabled
                        ? "bg-dark-bg text-white border-dark-bg"
                        : "border-border text-text-tertiary hover:text-text-secondary"
                        }`}
                >
                    База знаний {ragEnabled ? "вкл" : "выкл"}
                </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                        <h2 className="font-serif text-[28px] text-text-primary mb-3">
                            Задайте вопрос
                        </h2>
                        <p className="text-sm text-text-tertiary mb-8 max-w-[300px] leading-[1.7]">
                            Спросите что угодно про программы, университеты или поступление
                        </p>
                        <div className="space-y-2 w-full max-w-[340px]">
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => sendMessage(s)}
                                    className="w-full text-left px-5 py-3.5 rounded-xl border border-border text-sm text-text-secondary hover:bg-hover transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id}>
                        {msg.role === "user" ? (
                            <div className="flex justify-end">
                                <div className="max-w-[85%]">
                                    <div className="bg-dark-bg text-white rounded-2xl rounded-tr-sm px-5 py-4">
                                        <p className="text-sm leading-[1.7]">{msg.content}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-start">
                                <div className="max-w-[85%]">
                                    <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-5 py-4">
                                        {msg.content ? (
                                            <div className="text-sm text-text-secondary leading-[1.7]">
                                                <ReactMarkdown
                                                    components={{
                                                        p: ({ node, ...props }: any) => <p className="mb-2 last:mb-0" {...props} />,
                                                        ul: ({ node, ...props }: any) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                                        ol: ({ node, ...props }: any) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                                        li: ({ node, ...props }: any) => <li className="pl-1" {...props} />,
                                                        a: ({ node, ...props }: any) => <a className="text-accent hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                                        strong: ({ node, ...props }: any) => <span className="font-semibold text-text-primary" {...props} />,
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-text-secondary leading-[1.7] whitespace-pre-wrap">
                                                <span className="text-text-tertiary animate-pulse">
                                                    ···
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-border">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                        placeholder="Спросите про программу или ВУЗ..."
                        disabled={isStreaming}
                        className="flex-1 pb-2 border-b-2 border-border bg-transparent text-sm placeholder:text-text-tertiary focus:outline-none focus:border-text-primary transition-colors disabled:opacity-50"
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || isStreaming}
                        className={`font-mono text-[11px] uppercase tracking-[0.1em] transition-colors px-3 py-2 ${input.trim() && !isStreaming
                            ? "text-text-primary"
                            : "text-text-tertiary"
                            }`}
                    >
                        {isStreaming ? "..." : "Отправить"}
                    </button>
                </div>
            </div>
        </div>
    );
}
