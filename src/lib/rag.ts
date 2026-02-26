import { getEmbedding } from "./deepseek";
import * as fs from "fs";
import * as path from "path";

const VECTORS_PATH = path.join(process.cwd(), "data", "vectors.json");

export interface VectorChunk {
    text: string;
    embedding: number[];
    source: string;
}

interface VectorStore {
    chunks: VectorChunk[];
}

/**
 * Split text into overlapping chunks.
 */
export function chunkText(
    text: string,
    chunkSize = 500,
    overlap = 100
): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        const chunk = text.slice(start, end).trim();
        if (chunk.length > 20) {
            chunks.push(chunk);
        }
        start += chunkSize - overlap;
    }

    return chunks;
}

/**
 * Cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
    return magnitude === 0 ? 0 : dot / magnitude;
}

/**
 * Load vector store from disk.
 */
export function loadVectorStore(): VectorStore {
    try {
        if (fs.existsSync(VECTORS_PATH)) {
            const data = fs.readFileSync(VECTORS_PATH, "utf-8");
            return JSON.parse(data);
        }
    } catch {
        // ignore
    }
    return { chunks: [] };
}

/**
 * Save vector store to disk.
 */
export function saveVectorStore(store: VectorStore): void {
    const dir = path.dirname(VECTORS_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(VECTORS_PATH, JSON.stringify(store, null, 2), "utf-8");
}

/**
 * Add a document to the vector store.
 */
export async function ingestDocument(
    text: string,
    source: string
): Promise<number> {
    const chunks = chunkText(text);
    const store = loadVectorStore();

    // Remove old chunks from same source
    store.chunks = store.chunks.filter((c) => c.source !== source);

    for (const chunk of chunks) {
        const embedding = await getEmbedding(chunk);
        store.chunks.push({ text: chunk, embedding, source });
    }

    saveVectorStore(store);
    return chunks.length;
}

/**
 * Search the vector store for chunks similar to the query.
 */
export async function searchSimilar(
    query: string,
    topK = 5
): Promise<{ text: string; score: number; source: string }[]> {
    const store = loadVectorStore();
    if (store.chunks.length === 0) return [];

    const queryEmbedding = await getEmbedding(query);

    const scored = store.chunks.map((chunk) => ({
        text: chunk.text,
        source: chunk.source,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).filter((s) => s.score > 0.1);
}

/**
 * Build a RAG context string from retrieved chunks.
 */
export async function buildRagContext(query: string): Promise<string> {
    const results = await searchSimilar(query, 5);
    if (results.length === 0) return "";

    const ctx = results
        .map((r, i) => `[Документ ${i + 1}: ${r.source}]\n${r.text}`)
        .join("\n\n---\n\n");

    return ctx;
}
