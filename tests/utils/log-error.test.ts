import {logError} from '@sx/utils/log-error'
import scope from '@sx/utils/sentry'


describe('logError', () => {

  it('logs the error using console.error', () => {
    console.error = jest.fn()

    const error = new Error('An error occurred!')

    logError(error)

    expect(console.error).toHaveBeenCalledWith(error)
  })

  it('logs the error using Sentry SDK', () => {
    scope.captureException = jest.fn()

    const error = new Error('An error occurred!')

    logError(error)

    expect(scope.captureException).toHaveBeenCalledWith(error)
  })
})
