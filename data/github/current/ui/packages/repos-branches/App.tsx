import type React from 'react'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {CurrentRepositoryProvider, type Repository} from '@github-ui/current-repository'
import type {CreateBranchButtonProps} from '@github-ui/create-branch-button'
import {ScreenSizeProvider} from '@github-ui/screen-size'
import {CreateBranchButtonOptionProvider} from './contexts/CreateBranchButtonOptionContext'
import {CurrentUserProvider} from './contexts/CurrentUserContext'
import type {Author} from './types'

type AppPayload = {
  repo: Repository
  createBranchButtonOptions: CreateBranchButtonProps
  currentUser: Author
}

/**
 * The App component is used to render content which should be present on _all_ routes within this app
 */
export function App({children}: {children?: React.ReactNode}) {
  const {repo, createBranchButtonOptions, currentUser} = useAppPayload<AppPayload>()

  return (
    <CurrentUserProvider user={currentUser}>
      <CurrentRepositoryProvider repository={repo}>
        <CreateBranchButtonOptionProvider options={createBranchButtonOptions}>
          <ScreenSizeProvider>{children}</ScreenSizeProvider>
        </CreateBranchButtonOptionProvider>
      </CurrentRepositoryProvider>
    </CurrentUserProvider>
  )
}
