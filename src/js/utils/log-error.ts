import * as Sentry from '@sentry/browser'


export function logError(error: Error) {
  console.error(error)
  Sentry.captureException(error)
}
