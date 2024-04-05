import {logError} from '../../src/js/utils/logError'
import * as Sentry from '@sentry/browser'


describe('logError', () => {

  it('logs the error using console.error', () => {
    console.error = jest.fn()

    const error = new Error('An error occurred!')

    logError(error)

    expect(console.error).toHaveBeenCalledWith(error)
  })

  it('logs the error using Sentry SDK', () => {
    Sentry.captureException = jest.fn()

    const error = new Error('An error occurred!')

    logError(error)

    expect(Sentry.captureException).toHaveBeenCalledWith(error)
  })
})
