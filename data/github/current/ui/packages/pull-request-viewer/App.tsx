import {ScreenSizeProvider} from '@github-ui/screen-size'
import type React from 'react'
import {Suspense} from 'react'

export function App({children}: {children?: React.ReactNode}) {
  return (
    <ScreenSizeProvider>
      <meta data-hydrostats="publish" />
      <Suspense fallback={<span />}>{children}</Suspense>
    </ScreenSizeProvider>
  )
}
