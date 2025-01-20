import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import type {FileTreePagePayload, RepositoryClickTarget} from '@github-ui/code-view-types'
import {screen, waitFor} from '@testing-library/react'

import {testTreePayload} from '../../__tests__/test-helpers'
import {AddFileDropdownButton} from '../AddFileDropdownButton'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {FilesPageInfoProvider} from '../../contexts/FilesPageInfoContext'
import {render, type User} from '@github-ui/react-core/test-utils'

jest.mock('react', () => {
  const React = jest.requireActual('react')
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.Suspense = ({children}: {children: any}) => children
  return React
})

const renderAddFileDropdownButton = (payload: FileTreePagePayload) => {
  return render(
    <CurrentRepositoryProvider repository={payload.repo}>
      <FilesPageInfoProvider action="tree" copilotAccessAllowed={false} path={payload.path} refInfo={payload.refInfo}>
        <AddFileDropdownButton />
      </FilesPageInfoProvider>
    </CurrentRepositoryProvider>,
  )
}

describe('AddFilesDropdownButton', () => {
  it('renders nothing if user cannot edit', async () => {
    renderAddFileDropdownButton({
      ...testTreePayload,
      refInfo: {...testTreePayload.refInfo, canEdit: false},
    })

    expect(screen.queryByText('Add file')).not.toBeInTheDocument()
  })

  it('sends correct analytics events', async () => {
    const {user} = renderAddFileDropdownButton(testTreePayload)
    await waitFor(() => expect(screen.getAllByText('Add file')[0]).toBeInTheDocument())

    await user.click(screen.getByText('Add file', {selector: ':not(.sr-only)'}))
    expect(screen.getByText('Create new file')).toBeInTheDocument()

    await clickWithoutNavigation(user, screen.getByText('Create new file'))
    await clickWithoutNavigation(user, screen.getByText('Upload files'))

    expectAnalyticsEvents<RepositoryClickTarget>(
      {
        type: 'repository.click',
        target: 'NEW_FILE_BUTTON',
      },
      {
        type: 'repository.click',
        target: 'UPLOAD_FILES_BUTTON',
      },
    )
  })
})

async function clickWithoutNavigation(user: User, el: HTMLElement) {
  el.addEventListener('click', e => e.preventDefault())
  await user.click(el)
}
