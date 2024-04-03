module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.chromeSetup.js'],
  collectCoverage: true,
  collectCoverageFrom: ['src/js/**/*.js', 'src/js/**/*.ts', '!src/js/coverage/**'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest'
  },
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/tests/*', '**/?(*.)+(spec|test).js']
}
