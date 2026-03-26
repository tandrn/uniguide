import nextJest from 'next/jest.js'
const createJestConfig = nextJest({ dir: './' })
const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  }
}
export default createJestConfig(config)
