// setupTests.ts
import '@testing-library/jest-dom';

// You can add other global setup configurations here if needed.
// For example, mocking global objects:
// global.matchMedia = global.matchMedia || function() {
//   return {
//     matches : false,
//     addListener : function() {},
//     removeListener: function() {}
//   }
// }

// If you're using fetch in your components, you might want to mock it globally:
// import fetchMock from 'jest-fetch-mock';
// fetchMock.enableMocks();

// Silence console.error and console.warn during tests if they are too noisy,
// but be careful as this might hide important warnings.
// beforeEach(() => {
//   jest.spyOn(console, 'error').mockImplementation(jest.fn());
//   jest.spyOn(console, 'warn').mockImplementation(jest.fn());
// });
