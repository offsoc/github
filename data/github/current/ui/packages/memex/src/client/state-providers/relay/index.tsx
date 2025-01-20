import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {type Environment, RelayEnvironmentProvider} from 'react-relay'

// We want to use a relative URL for the prod / staging / dev environments, but an absolute URL for jest tests
const baseUrl =
  process.env.APP_ENV === 'production' || process.env.APP_ENV === 'staging' || process.env.APP_ENV === 'development'
    ? undefined
    : 'http://memex.dev/_graphql'

const defaultEnvironment = relayEnvironmentWithMissingFieldHandlerForNode(baseUrl)

export const RelayProvider: React.FC<{children: React.ReactNode; environment?: Environment}> = ({
  children,
  environment,
}) => <RelayEnvironmentProvider environment={environment || defaultEnvironment}>{children}</RelayEnvironmentProvider>
