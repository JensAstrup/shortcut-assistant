import * as Sentry from '@sentry/browser'

import scope from '@sx/utils/sentry'


export function logError(error: Error) {
  console.error(error)
  scope.captureException(error)
}
