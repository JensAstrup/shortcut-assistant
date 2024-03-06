module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['./jest.chromeSetup.js'],
  collectCoverage: true,
  collectCoverageFrom: ['js/**/*.js', 'js/**/*.ts']
}
