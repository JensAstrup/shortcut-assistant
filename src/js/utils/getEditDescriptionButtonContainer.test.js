import getEditDescriptionButtonContainer from './getEditDescriptionButtonContainer'


jest.mock('./sleep', () => jest.fn().mockResolvedValue(undefined))

describe('getEditDescriptionButtonContainer', () => {
  let originalQuerySelector

  beforeEach(() => {
    originalQuerySelector = document.querySelector

    document.querySelector = jest.fn()
  })

  afterEach(() => {
    document.querySelector = originalQuerySelector
    jest.clearAllTimers()
  })

  it('should return the container immediately if the button is found', async () => {
    const mockContainer = document.createElement('div')
    document.querySelector.mockReturnValue({parentElement: mockContainer})

    const container = await getEditDescriptionButtonContainer()

    expect(container).toBe(mockContainer)
    expect(document.querySelector).toHaveBeenCalledTimes(1)
  })

  it('should return the container after a few attempts if the button initially does not exist', async () => {
    const mockContainer = document.createElement('div')
    document.querySelector
    .mockReturnValueOnce({parentElement: null}) // First call, button not found
    .mockReturnValueOnce({parentElement: null}) // Second call, button still not found
    .mockReturnValue({parentElement: mockContainer}) // Third call, button found

    const promise = getEditDescriptionButtonContainer()

    const container = await promise

    expect(container).toBe(mockContainer)
    expect(document.querySelector).toHaveBeenCalledTimes(3)
  })

  it('should return null if the button is not found within the maximum number of attempts', async () => {
    document.querySelector.mockReturnValue({parentElement: null})

    const promise = getEditDescriptionButtonContainer()

    const container = await promise

    expect(container).toBeNull()
    expect(document.querySelector).toHaveBeenCalledTimes(12)
  })
})
