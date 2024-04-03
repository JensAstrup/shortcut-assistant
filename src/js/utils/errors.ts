export class OpenAIError extends Error {
  constructor(message) {
    super(message)
    this.name = 'OpenAIError'
  }
}
