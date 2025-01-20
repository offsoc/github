import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {ThemeProvider} from '@primer/react'
import type React from 'react'
import {createContext, useMemo, useState} from 'react'
import {RelayEnvironmentProvider} from 'react-relay'

type AppProps = {
  children?: React.ReactNode
}

export const PageContext = createContext({
  isStafftoolsRoute: false,
  isOrganizationRoute: false,
  isEnterpriseRoute: false,
})

// Create a new context for triggering re-renders
export const ReloadContext = createContext({
  reloadKey: 0,

  setReloadKey: (_: number) => {},
})

const environment = relayEnvironmentWithMissingFieldHandlerForNode()

export const App = (props: AppProps) => {
  const isStafftoolsRoute = ssrSafeLocation.pathname.startsWith('/stafftools')
  const isOrganizationRoute =
    ssrSafeLocation.pathname.startsWith('/organizations') || ssrSafeLocation.pathname.startsWith('/stafftools/users')
  const isEnterpriseRoute =
    ssrSafeLocation.pathname.startsWith('/enterprises') ||
    ssrSafeLocation.pathname.startsWith('/stafftools/enterprises')
  const pageContext = useMemo(
    () => ({isStafftoolsRoute, isOrganizationRoute, isEnterpriseRoute}),
    [isStafftoolsRoute, isOrganizationRoute, isEnterpriseRoute],
  )

  const [reloadKey, setReloadKey] = useState(0)

  const reloadContextValue = useMemo(() => ({reloadKey, setReloadKey}), [reloadKey, setReloadKey])

  return (
    <PageContext.Provider value={pageContext}>
      <ReloadContext.Provider value={reloadContextValue}>
        {isStafftoolsRoute ? (
          <ThemeProvider colorMode={isStafftoolsRoute ? 'day' : undefined}>
            <RelayEnvironmentProvider environment={environment}>
              <div data-color-mode={isStafftoolsRoute ? 'light' : undefined}>{props.children}</div>
            </RelayEnvironmentProvider>
          </ThemeProvider>
        ) : (
          <RelayEnvironmentProvider environment={environment}>
            <div>{props.children}</div>
          </RelayEnvironmentProvider>
        )}
      </ReloadContext.Provider>
    </PageContext.Provider>
  )
}
