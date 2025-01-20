import 'focus-options-polyfill'

import {BaseStyles, ThemeProvider} from '@primer/react'
import {QueryClientProvider} from '@tanstack/react-query'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'

import {App} from './app'
import {ErrorBoundary} from './components/error-boundaries/error-boundary'
import {ProjectErrorFallback} from './components/error-boundaries/project-error-fallback'
import {getThemePropsFromThemePreferences} from './helpers/color-modes'
import {useColorSchemeFromDocumentElement} from './hooks/use-color-scheme-from-document-element'
import {RootElementContext} from './hooks/use-root-element'
import {queryClient} from './queries/query-client'

const Memex: React.FC<{
  /**
   * Children can be rendered after the 'App' Component.
   * This is only used for forcing a Rendering error
   * in dev/staging/test modes and not in the production build.
   */
  children?: React.ReactNode
  rootElement: HTMLElement
}> = ({children, rootElement}) => {
  const errorFallback = <ProjectErrorFallback />
  return (
    <RootElementContext.Provider value={rootElement}>
      <QueryClientProvider client={queryClient}>
        <MemexThemeProvider>
          <ErrorBoundary fallback={errorFallback}>
            <App>{children}</App>
          </ErrorBoundary>
        </MemexThemeProvider>
        <ReactQueryDevtools buttonPosition="bottom-right" />
      </QueryClientProvider>
    </RootElementContext.Provider>
  )
}

export default Memex

const MemexThemeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const themeProps = useColorSchemeFromDocumentElement()
  return (
    <ThemeProvider {...getThemePropsFromThemePreferences(themeProps)}>
      <BaseStyles display="contents">{children}</BaseStyles>
    </ThemeProvider>
  )
}
