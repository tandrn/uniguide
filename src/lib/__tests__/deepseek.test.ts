import { getEmbedding } from '../deepseek';
describe('DeepSeek Utilities', () => {
    describe('getEmbedding', () => {
        it('should generate a 256-dimensional vector', async () => {
            const vector = await getEmbedding("Test string");
            expect(vector.length).toBe(256);
        });
        it('should return similar vectors for similar strings', async () => {
            const v1 = await getEmbedding("This is a test");
            const v2 = await getEmbedding("This is a test approx");
            let dot = 0;
            for (let i = 0; i < v1.length; i++) dot += v1[i] * v2[i];
            expect(dot).toBeGreaterThan(0.7);
        });
    });
});
