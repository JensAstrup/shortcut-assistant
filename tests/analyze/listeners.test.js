jest.mock('../../src/js/analyze/ai-functions', () => {
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
  document.body.innerHTML = `
    <button id="analyzeButton"></button>
  `

  const mockAddEventListener = jest.fn()
  document.getElementById = jest.fn().mockReturnValue({addEventListener: mockAddEventListener})
  const mockChromeRuntimeOnMessage = jest.fn()

  global.chrome = {
    runtime: {
      onMessage: {
        addListener: mockChromeRuntimeOnMessage
      }
    }
  }

  require('../../src/js/analyze/listeners') // Adjust this path to where your actual script is

  it('should add click event listener to analyzeButton', () => {
    expect(mockAddEventListener).toHaveBeenCalled()
  })

  it('should set up chrome.runtime.onMessage listener', () => {
    expect(mockChromeRuntimeOnMessage).toHaveBeenCalledWith(expect.any(Function))
  })
})
