import sleep from './sleep' // Adjust the import path according to your project structure

describe('sleep function', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should complete after the specified time using fake timers', async () => {
    setTimeout = jest.fn(setTimeout)
    const promise = sleep(1000)

    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)

    jest.advanceTimersByTime(1000)

    await promise
  })
})
