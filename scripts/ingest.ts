/**
 * Ingest all .txt and .md files from data/knowledge/ into the vector store.
 *
 * Usage: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/ingest.ts
 * Or:    npx tsx scripts/ingest.ts
 */

import * as fs from "fs";
import * as path from "path";

// Inline the functions to avoid module resolution issues in scripts
const VECTORS_PATH = path.join(process.cwd(), "data", "vectors.json");
const KNOWLEDGE_DIR = path.join(process.cwd(), "data", "knowledge");

interface VectorChunk {
    text: string;
    embedding: number[];
    source: string;
}

function hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0x7fffffff;
    }
    return hash;
}

function getEmbedding(text: string): number[] {
    const trigrams = new Map<string, number>();
    const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();

    for (let i = 0; i < normalized.length - 2; i++) {
        const tri = normalized.substring(i, i + 3);
        trigrams.set(tri, (trigrams.get(tri) || 0) + 1);
    }

    const dims = 256;
    const vector = new Array(dims).fill(0);

    for (const [tri, count] of trigrams) {
        const h = hashString(tri) % dims;
        vector[h] += count;
    }

    const magnitude = Math.sqrt(vector.reduce((sum: number, v: number) => sum + v * v, 0));
    if (magnitude > 0) {
        for (let i = 0; i < dims; i++) {
            vector[i] /= magnitude;
        }
    }

    return vector;
}

function chunkText(text: string, chunkSize = 500, overlap = 100): string[] {
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

async function main() {
    console.log("📂 Scanning data/knowledge/ ...");

    if (!fs.existsSync(KNOWLEDGE_DIR)) {
        fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
        console.log("   Created data/knowledge/ — add your .txt/.md files there");
        return;
    }

    const files = fs.readdirSync(KNOWLEDGE_DIR).filter((f) =>
        f.endsWith(".txt") || f.endsWith(".md")
    );

    if (files.length === 0) {
        console.log("   No .txt or .md files found in data/knowledge/");
        return;
    }

    console.log(`   Found ${files.length} file(s)\n`);

    const allChunks: VectorChunk[] = [];

    for (const file of files) {
        const filePath = path.join(KNOWLEDGE_DIR, file);
        const text = fs.readFileSync(filePath, "utf-8");
        const chunks = chunkText(text);

        console.log(`   ${file}: ${chunks.length} chunks`);

        for (const chunk of chunks) {
            const embedding = getEmbedding(chunk);
            allChunks.push({ text: chunk, embedding, source: file });
        }
    }

    // Save
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(VECTORS_PATH, JSON.stringify({ chunks: allChunks }, null, 2), "utf-8");
    console.log(`\n✓ Saved ${allChunks.length} chunks to data/vectors.json`);
}

main().catch(console.error);
