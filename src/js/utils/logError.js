import * as Sentry from '@sentry/browser'


export function logError(error) {
  console.error(error)
  Sentry.captureException(error)
}
