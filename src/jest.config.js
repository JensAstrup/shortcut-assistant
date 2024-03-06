module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.chromeSetup.js'],
  collectCoverage: true,
  collectCoverageFrom: ['js/**/*.js', 'js/**/*.ts', '!js/coverage/**'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest'
  }
}
Object.assign(global, require('jest-chrome'))
