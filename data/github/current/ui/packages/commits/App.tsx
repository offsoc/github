import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {CurrentUserProvider} from '@github-ui/current-user'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type React from 'react'
import {useState} from 'react'

import type {CommitsBasePayload} from './types/shared'

/**
 * The App component is used to render content which should be present on _all_ routes within this app
 */
export function App(props: {children?: React.ReactNode}) {
  const payload = useRoutePayload<CommitsBasePayload>()
  const [repo] = useState(payload?.repo)
  const [user] = useState(payload?.currentUser)

  return (
    <CurrentUserProvider user={user}>
      <CurrentRepositoryProvider repository={repo}>{props.children}</CurrentRepositoryProvider>
    </CurrentUserProvider>
  )
}
