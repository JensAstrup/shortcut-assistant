import scope from '@sx/utils/sentry'


export function logError(error: Error): void {
  console.error(error)
  scope.captureException(error)
}
