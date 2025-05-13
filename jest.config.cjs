module.exports = {
    testEnvironment: 'jsdom',
    transform: { '^.+\\.(ts|tsx|js|mjs)$': 'babel-jest' },
    transformIgnorePatterns: [],              // ou votre whitelist ESM
    moduleFileExtensions: ['ts','tsx','js','jsx','mjs','json','node'],
    moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
    setupFiles: ['<rootDir>/jest.setup.cjs'], // <-- on charge notre stub AVANT chaque test
};
