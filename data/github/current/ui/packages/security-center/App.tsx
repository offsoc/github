import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import type React from 'react'

import {Blankslate, type BlankslateProps} from './common/components/Blankslate'

type AppPayload = {variant?: 'content'} | ({variant: 'blankslate'} & BlankslateProps)

/**
 * The App component is used to render content which should be present on _all_ routes within this app
 */
export function App({children}: {children?: React.ReactNode}): JSX.Element {
  const appPayload = useAppPayload<AppPayload>()
  if (appPayload.variant === 'blankslate') {
    return <Blankslate {...appPayload} />
  } else {
    return <>{children}</>
  }
}
