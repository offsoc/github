import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'

import {getCopilotChatProviderProps, getDefaultReducerState} from '../../test-utils/mock-data'
import {CopilotChatProvider} from '../../utils/CopilotChatContext'
import {ThreadListView} from '../ThreadListView'

test('Renders the proper dialog box when the trash icon is clicked', () => {
  const threads = new Map([
    [
      '1',
      {
        id: '1',
        name: 'Thread 1',
        currentReferences: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    [
      '2',
      {
        id: '2',
        name: 'Thread 2',
        currentReferences: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  ])

  render(
    <CopilotChatProvider
      {...getCopilotChatProviderProps()}
      testReducerState={{...getDefaultReducerState('2', undefined, 'immersive'), threads}}
    >
      <ThreadListView />
    </CopilotChatProvider>,
  )

  let firstDeleteDialog = screen.queryByTestId('delete-thread-dialog-1')
  let secondDeleteDialog = screen.queryByTestId('delete-thread-dialog-2')
  expect(firstDeleteDialog).not.toBeInTheDocument()
  expect(secondDeleteDialog).not.toBeInTheDocument()

  const button = screen.queryByTestId('delete-thread-button-1') as HTMLButtonElement
  expect(button).toBeInTheDocument()

  fireEvent.click(button)

  firstDeleteDialog = screen.queryByTestId('delete-thread-dialog-1')
  secondDeleteDialog = screen.queryByTestId('delete-thread-dialog-2')
  expect(firstDeleteDialog).toBeInTheDocument()
  expect(secondDeleteDialog).not.toBeInTheDocument()
})
