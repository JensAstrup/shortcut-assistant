module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.chromeSetup.js'],
  collectCoverage: true,
  collectCoverageFrom: ['js/**/*.js', 'js/**/*.ts', '!js/coverage/**'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest'
  },
  testMatch: [
    '<rootDir>/js/**/*.test.js' // Matches any file ending with .test.js in the js directory
  ]
}
