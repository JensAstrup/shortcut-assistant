module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.chromeSetup.js'],
  collectCoverage: true,
  collectCoverageFrom: ['src/js/**/*.js', 'src/js/**/*.ts', '!src/js/coverage/**'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest'
  },
  testMatch: [
    '<rootDir>/src/js/**/*.test.js', // Matches any file ending with .test.js in the js directory
    '<rootDir>/tests/**/*.test.js' // Matches any file ending with .test.js in the js directory
  ]
}
