import { NextRequest, NextResponse } from "next/server";
import { ingestDocument, loadVectorStore } from "@/lib/rag";

export async function GET() {
    try {
        const store = loadVectorStore();
        return NextResponse.json({
            chunksCount: store.chunks.length,
            sources: [...new Set(store.chunks.map((c) => c.source))],
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text, source } = body;

        if (!text || !source) {
            return NextResponse.json({ error: "Ожидаются text и source" }, { status: 400 });
        }

        const addedChunksCount = await ingestDocument(text, source);

        return NextResponse.json({
            message: `Успешно проиндексировано. Добавлено ${addedChunksCount} чанков.`,
        });
    } catch (error: any) {
        console.error("RAG ingest error:", error);
        return NextResponse.json(
            { error: error.message || "Unknown error" },
            { status: 500 }
        );
    }
}
