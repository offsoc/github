import {Outlet} from 'react-router-dom'
import {usePublishPayload} from './use-publish-payload'
import type {ReactNode} from 'react'

/**
 * Wraps an optional App component around the outlet.
 */
export function AppWrapper({App}: {App?: AppComponentType}) {
  usePublishPayload()

  return App ? (
    <App>
      <Outlet />
    </App>
  ) : (
    <Outlet />
  )
}

export type AppComponentType = React.ComponentType<{children?: ReactNode}>
