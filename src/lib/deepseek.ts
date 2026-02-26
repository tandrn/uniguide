const DEEPSEEK_BASE = "https://api.deepseek.com/v1";

function getKey(): string {
    const key = process.env.DEEPSEEK_API_KEY;
    if (!key) throw new Error("DEEPSEEK_API_KEY is not set in .env.local");
    return key;
}

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

/**
 * Stream chat completions from DeepSeek.
 * Returns a ReadableStream of SSE chunks.
 */
export async function chatStream(
    messages: ChatMessage[],
    systemPrompt?: string
): Promise<ReadableStream<Uint8Array>> {
    const allMessages: ChatMessage[] = [];

    if (systemPrompt) {
        allMessages.push({ role: "system", content: systemPrompt });
    }
    allMessages.push(...messages);

    const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getKey()}`,
        },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages: allMessages,
            stream: true,
            temperature: 0.7,
            max_tokens: 2048,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`DeepSeek API error ${res.status}: ${err}`);
    }

    if (!res.body) {
        throw new Error("No response body from DeepSeek");
    }

    return res.body;
}

/**
 * Non-streaming chat for simple queries.
 */
export async function chat(
    messages: ChatMessage[],
    systemPrompt?: string
): Promise<string> {
    const allMessages: ChatMessage[] = [];
    if (systemPrompt) {
        allMessages.push({ role: "system", content: systemPrompt });
    }
    allMessages.push(...messages);

    const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getKey()}`,
        },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages: allMessages,
            temperature: 0.7,
            max_tokens: 2048,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`DeepSeek API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.choices[0]?.message?.content || "";
}

/**
 * Get embeddings from DeepSeek (or fallback to simple hash-based approach).
 * DeepSeek doesn't officially expose embeddings via their main API,
 * so we use a lightweight local approach: TF-IDF-like keyword matching.
 */
export async function getEmbedding(text: string): Promise<number[]> {
    // Simple but effective: character trigram frequency vector
    // This avoids needing a separate embedding API
    const trigrams = new Map<string, number>();
    const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();

    for (let i = 0; i < normalized.length - 2; i++) {
        const tri = normalized.substring(i, i + 3);
        trigrams.set(tri, (trigrams.get(tri) || 0) + 1);
    }

    // Create a fixed-size hash vector (256 dims)
    const dims = 256;
    const vector = new Array(dims).fill(0);

    for (const [tri, count] of trigrams) {
        const hash = hashString(tri) % dims;
        vector[hash] += count;
    }

    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (magnitude > 0) {
        for (let i = 0; i < dims; i++) {
            vector[i] /= magnitude;
        }
    }

    return vector;
}

function hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0x7fffffff;
    }
    return hash;
}
