import {
  BrowserClient,
  Scope,
  defaultStackParser,
  getDefaultIntegrations,
  makeFetchTransport
} from '@sentry/browser'


const isTestEnv = process.env.NODE_ENV === 'test'

let client: BrowserClient
let scope: Scope

if (!isTestEnv) {
  const manifestData = chrome.runtime.getManifest()
  const integrations = getDefaultIntegrations({}).filter(defaultIntegration => {
    return !['Breadcrumbs', 'BrowserApiErrors', 'GlobalHandlers', 'TryCatch'].includes(defaultIntegration.name)
  })

  client = new BrowserClient({
    dsn: 'https://966b241d3d57856bd13a0945fa9fa162@o49777.ingest.us.sentry.io/4506624214368256',
    transport: makeFetchTransport,
    stackParser: defaultStackParser,
    integrations,
    release: manifestData.version,
    environment: process.env.NODE_ENV
  })

  scope = new Scope()
  scope.setClient(client)
  client.init()
}
else {
  client = { init: jest.fn() } as unknown as BrowserClient // Stub for test environment
  scope = new Scope() // Keep it simple, you might not need to do anything here in tests
}

export default scope
