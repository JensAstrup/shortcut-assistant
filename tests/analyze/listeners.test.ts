jest.mock('@sx/analyze/ai-functions', () => {
  return {
    AiFunctions: jest.fn().mockImplementation(() => {
      return {
        triggerAnalysis: jest.fn(),
        processOpenAIResponse: jest.fn()
      }
    })
  }
})

describe('Event Listeners', () => {
  const mockChromeRuntimeOnMessage = jest.fn()

  global.chrome = {
    ...chrome,
    runtime: {
      ...chrome.runtime,
      onMessage: {
        ...chrome.runtime.onMessage,
        addListener: mockChromeRuntimeOnMessage
      }
    }
  }

  require('@sx/analyze/listeners') // Adjust this path to where your actual script is

  it('should set up chrome.runtime.onMessage listener', () => {
    expect(mockChromeRuntimeOnMessage).toHaveBeenCalledWith(expect.any(Function))
  })
})
