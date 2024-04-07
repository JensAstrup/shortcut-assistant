module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.chromeSetup.js', './tests/setup.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['src/js/**/*.js', 'src/js/**/*.ts', '!src/js/coverage/**'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest'
  },
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/?(*.)+(spec|test).(js|ts)']
}
