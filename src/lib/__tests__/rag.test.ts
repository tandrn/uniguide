import { chunkText, cosineSimilarity } from '../rag';
describe('RAG Utilities', () => {
    describe('chunkText', () => {
        it('should split text into chunks based on size and overlap', () => {
            const text = "1234567890".repeat(10); 
            const chunks = chunkText(text, 50, 10);
            expect(chunks.length).toBeGreaterThan(1);
            expect(chunks[0].length).toBeLessThanOrEqual(50);
            expect(chunks[1].length).toBeLessThanOrEqual(50);
            const overlapText = chunks[0].slice(-10);
            expect(chunks[1].startsWith(overlapText)).toBe(true);
        });
        it('should ignore very small chunks', () => {
            const text = "Small string";
            const chunks = chunkText(text, 50, 10);
            expect(chunks.length).toBe(0);
        });
    });
    describe('cosineSimilarity', () => {
        it('should return 1 for identical vectors', () => {
            expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
        });
        it('should return 0 for orthogonal vectors', () => {
            expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
        });
        it('should return 0 if one vector is zero', () => {
            expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
        });
    });
});
