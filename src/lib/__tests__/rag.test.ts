import { chunkText, cosineSimilarity } from '../rag';

describe('RAG Utilities', () => {
    describe('chunkText', () => {
        it('should split text into chunks based on size and overlap', () => {
            const text = "1234567890".repeat(10); // 100 chars
            const chunks = chunkText(text, 50, 10);
            
            expect(chunks.length).toBeGreaterThan(1);
            expect(chunks[0].length).toBeLessThanOrEqual(50);
            expect(chunks[1].length).toBeLessThanOrEqual(50);
            
            // Check overlap
            const overlapText = chunks[0].slice(-10);
            expect(chunks[1].startsWith(overlapText)).toBe(true);
        });

        it('should ignore very small chunks', () => {
            const text = "Small string";
            const chunks = chunkText(text, 50, 10);
            expect(chunks.length).toBe(0); // Because length < 20 in the implementation
        });
    });

    describe('cosineSimilarity', () => {
        it('should return 1 for identical vectors', () => {
            const v1 = [1, 2, 3];
            const v2 = [1, 2, 3];
            expect(cosineSimilarity(v1, v2)).toBeCloseTo(1);
        });

        it('should return 0 for orthogonal vectors', () => {
            const v1 = [1, 0];
            const v2 = [0, 1];
            expect(cosineSimilarity(v1, v2)).toBe(0);
        });

        it('should return 0 if one vector is zero', () => {
            const v1 = [0, 0];
            const v2 = [1, 1];
            expect(cosineSimilarity(v1, v2)).toBe(0);
        });
    });
});
