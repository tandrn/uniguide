import { NextRequest, NextResponse } from "next/server";
import { ingestDocument } from "@/lib/rag";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text, source } = body;

        if (!text || !source) {
            return NextResponse.json(
                { error: "Missing 'text' or 'source' field" },
                { status: 400 }
            );
        }

        const chunksAdded = await ingestDocument(text, source);

        return NextResponse.json({
            success: true,
            chunksAdded,
            source,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
