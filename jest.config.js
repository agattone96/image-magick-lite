// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom', // Use jsdom for testing React components
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'], // Run setup file after env is set up
  moduleNameMapper: {
    // Handle CSS imports (if you import CSS directly in components)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/__mocks__/fileMock.js',
    // Handle module path aliases
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    // Use ts-jest for .ts and .tsx files
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json', // Ensure it uses your project's tsconfig
    }],
    // If you have JS files that need Babel transformation (e.g. from node_modules or complex JS)
    // '^.+\\.(js|jsx)$': 'babel-jest', 
  },
  // Ignore transpiling from node_modules except for specific modules if needed
  transformIgnorePatterns: [
    '/node_modules/',
    // Add exceptions here if needed, e.g. for ES modules in node_modules
    // '!node_modules/some-es-module-package', 
  ],
  // Collect coverage from src directory, excluding certain files
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx', // Example: ignore main entry point
    '!src/vite-env.d.ts',
    // Add other files/patterns to ignore for coverage
  ],
  // Jest will look for test files in __tests__ folders and files with .test. or .spec. extensions
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Added to support ESM modules that Vite uses, though Jest primarily uses CommonJS.
  // This might need further adjustment if specific ESM issues arise.
  // For Next.js projects, this might be handled by `next/jest` preset.
  // Since this is Vite, we are setting it up manually.
  // extensionsToTreatAsEsm: ['.ts', '.tsx'], // Optional: if you have ESM-only TS/TSX files
  // globals: {
  //   'ts-jest': {
  //     useESM: true, // If using ESM for TS files
  //   },
  // },
};
