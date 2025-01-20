import {ThemeProvider} from '@primer/react'
import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {ScreenSizeProvider} from '@github-ui/screen-size'
import type React from 'react'
import {useIsStafftools} from './hooks/use-is-stafftools'

const appName = 'repository-rulesets'
const category = 'repository-rulesets'
const metadata = {}

type AppProps = {
  children?: React.ReactNode
}

export function App({children}: AppProps) {
  const isStafftools = useIsStafftools()

  if (!isStafftools) {
    return <InnerApp>{children}</InnerApp>
  }
  return (
    <StafftoolsThemeWrapper>
      <InnerApp>{children}</InnerApp>
    </StafftoolsThemeWrapper>
  )
}

function InnerApp({children}: AppProps) {
  return (
    <AnalyticsProvider appName={appName} category={category} metadata={metadata}>
      <ScreenSizeProvider>{children}</ScreenSizeProvider>
    </AnalyticsProvider>
  )
}

function StafftoolsThemeWrapper({children}: AppProps) {
  return <ThemeProvider colorMode="day">{children}</ThemeProvider>
}
