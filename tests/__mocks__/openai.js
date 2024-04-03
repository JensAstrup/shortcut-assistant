const mockStream = {
  async* [Symbol.asyncIterator]() {
    yield* [{choices: [{delta: {content: 'response'}}]},
      {choices: []}] // empty array to end the stream
  }
}

export const mockOpenAI = jest.fn()
mockOpenAI.chat = {
  completions: {
    create: jest.fn().mockResolvedValue(mockStream)
  }
}
const mock = jest.fn().mockImplementation(() => {
  return mockOpenAI
})

export default mock
