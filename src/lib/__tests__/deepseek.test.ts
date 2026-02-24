import { getEmbedding } from '../deepseek';

describe('DeepSeek Utilities', () => {
    describe('getEmbedding', () => {
        it('should generate a 256-dimensional vector', async () => {
            const vector = await getEmbedding("Test string for embedding length check");
            expect(vector.length).toBe(256);
        });

        it('should return similar vectors for similar strings', async () => {
            const v1 = await getEmbedding("This is a test of the embedding system");
            const v2 = await getEmbedding("This is a test of the embedding");
            
            // Calculate similarity manually
            let dot = 0;
            for (let i = 0; i < v1.length; i++) {
                dot += v1[i] * v2[i];
            }
            // Should be highly correlated
            expect(dot).toBeGreaterThan(0.7);
        });

        it('should return normalized vectors', async () => {
            const vector = await getEmbedding("normalize me");
            const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
            expect(magnitude).toBeCloseTo(1);
        });
    });
});
