import { NextRequest, NextResponse } from "next/server";
import { chatStream, type ChatMessage } from "@/lib/deepseek";
import { buildRagContext } from "@/lib/rag";

const SYSTEM_PROMPT = `Ты — UNIGUIDE, умный помощник по подбору образовательных программ в российских университетах.

Правила:
- Отвечай на русском языке
- Будь кратким, точным и полезным
- Если пользователь спрашивает про конкретную программу или ВУЗ — используй предоставленный контекст
- Если контекста нет — отвечай на основе общих знаний, но предупреди что данные могут быть неточными
- Не придумывай конкретные цифры (баллы, цены) если их нет в контексте
- Тон: спокойный, доброжелательный, профессиональный
- Ограничивай длину ответа 2-3 предложениями. Не давай слишком подробных списков.
- Для полного списка программ или детального подбора отправляй пользователя в раздел "Результаты" или "Подбор".`;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const messages: ChatMessage[] = body.messages || [];
        const useRag: boolean = body.useRag !== false; // RAG on by default

        let systemPrompt = SYSTEM_PROMPT;

        // RAG: retrieve relevant context
        if (useRag && messages.length > 0) {
            const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
            if (lastUserMsg) {
                const context = await buildRagContext(lastUserMsg.content);
                if (context) {
                    systemPrompt += `\n\nКонтекст из базы знаний:\n${context}\n\nИспользуй этот контекст для ответа. Ссылайся на источники.`;
                }
            }
        }

        const stream = await chatStream(messages, systemPrompt);

        // Transform the SSE stream into a simpler text stream
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const transformedStream = new ReadableStream({
            async start(controller) {
                const reader = stream.getReader();

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const text = decoder.decode(value, { stream: true });
                        const lines = text.split("\n");

                        for (const line of lines) {
                            if (line.startsWith("data: ")) {
                                const data = line.slice(6).trim();
                                if (data === "[DONE]") {
                                    controller.enqueue(encoder.encode("\n[DONE]"));
                                    continue;
                                }
                                try {
                                    const parsed = JSON.parse(data);
                                    const content = parsed.choices?.[0]?.delta?.content;
                                    if (content) {
                                        controller.enqueue(encoder.encode(content));
                                    }
                                } catch {
                                    // skip unparseable chunks
                                }
                            }
                        }
                    }
                } catch (err) {
                    controller.error(err);
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(transformedStream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
