import '../../test-utils/mocks'

import {render} from '@github-ui/react-core/test-utils'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {screen} from '@testing-library/react'
import {useRef, useState} from 'react'

import {getCopilotTaskCodeEditorPayload} from '../../test-utils/mock-data'
import type {CodeEditorPayload} from '../../utilities/copilot-task-types'
import {FilesContextProvider, useFilesContext} from '../FilesContext'

function TestComponent() {
  const {addFile, editFile, getFileStatuses, renameFile, resetFiles} = useFilesContext()
  const renderCount = useRef(0)
  renderCount.current++
  const {path} = useRoutePayload<CodeEditorPayload>()
  const fileStatuses = getFileStatuses()
  const [renameValue, setRenameValue] = useState('')
  const [currentPath, setCurrentPath] = useState(path)
  return (
    <div>
      <button onClick={() => addFile('newfile')}>Add file</button>
      <button onClick={resetFiles}>Reset files</button>
      <input aria-label="Rename input" onChange={e => setRenameValue(e.target.value)} />
      <button
        onClick={() => {
          renameFile({oldFilePath: currentPath, newFilePath: renameValue, originalContent: ''})
          setCurrentPath(renameValue)
        }}
      >
        Rename file
      </button>
      <input aria-label="File input" onChange={e => editFile({filePath: path, newFileContent: e.target.value})} />
      <div>render count: {renderCount.current}</div>
      {Object.keys(fileStatuses).map(statusPath => (
        <div key={statusPath}>
          {statusPath}: {fileStatuses[statusPath]}
        </div>
      ))}
    </div>
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

test('FilesContext does not cause re-renders from basic file edits', async () => {
  const {user} = render(
    <FilesContextProvider>
      <TestComponent />
    </FilesContextProvider>,
    {routePayload: getCopilotTaskCodeEditorPayload()},
  )

  const input = screen.getByLabelText('File input')

  // initial change should trigger re-render due to file status changing
  await user.type(input, 'a')
  expect(screen.getByText('render count: 2')).toBeInTheDocument()

  // subsequent changes should not trigger re-renders
  await user.type(input, 'a')
  expect(screen.getByText('render count: 2')).toBeInTheDocument()
  await user.type(input, 'a')
  expect(screen.getByText('render count: 2')).toBeInTheDocument()

  expect(screen.getByText('readme: M')).toBeInTheDocument()
})

test('adding file to store updates status', async () => {
  const {user} = render(
    <FilesContextProvider>
      <TestComponent />
    </FilesContextProvider>,
    {routePayload: getCopilotTaskCodeEditorPayload()},
  )

  const addFileButton = screen.getByText('Add file')

  // initial change should trigger re-render due to file status changing
  await user.click(addFileButton)

  expect(screen.getByText('newfile: A')).toBeInTheDocument()
})

test('resetting files updates status', async () => {
  const {user} = render(
    <FilesContextProvider>
      <TestComponent />
    </FilesContextProvider>,
    {routePayload: getCopilotTaskCodeEditorPayload()},
  )

  const addFileButton = screen.getByText('Add file')
  await user.click(addFileButton)

  expect(screen.getByText('newfile: A')).toBeVisible()

  const resetFilesButton = screen.getByText('Reset files')
  await user.click(resetFilesButton)

  expect(screen.queryByText('newfile: A')).not.toBeInTheDocument()
})

test('renaming file updates status', async () => {
  const {user} = render(
    <FilesContextProvider>
      <TestComponent />
    </FilesContextProvider>,
    {routePayload: getCopilotTaskCodeEditorPayload()},
  )

  const renameInput = screen.getByLabelText('Rename input')
  await user.type(renameInput, 'newfile2')
  const renameFileButton = screen.getByText('Rename file')
  await user.click(renameFileButton)

  expect(screen.getByText('newfile2: A')).toBeInTheDocument()
  expect(screen.getByText('readme: D')).toBeInTheDocument()
})

test('renaming file multiple times updates status correctly', async () => {
  const {user} = render(
    <FilesContextProvider>
      <TestComponent />
    </FilesContextProvider>,
    {routePayload: getCopilotTaskCodeEditorPayload()},
  )

  const renameInput = screen.getByLabelText('Rename input')
  const renameFileButton = screen.getByText('Rename file')

  // update the file name
  await user.type(renameInput, 'newfile2')
  await user.click(renameFileButton)

  // update the file name again
  await user.clear(renameInput)
  await user.type(renameInput, 'abc.txt')
  await user.click(renameFileButton)

  // ensure the intermediary file is no longer present
  expect(screen.getByText('abc.txt: A')).toBeInTheDocument()
  expect(screen.getByText('readme: D')).toBeInTheDocument()
  expect(screen.queryByText('newfile2: A')).not.toBeInTheDocument()
  expect(screen.queryByText('newfile2: D')).not.toBeInTheDocument()
})

test('manually reverting file to server state is reflected in status and storage', async () => {
  const {user} = render(
    <FilesContextProvider>
      <TestComponent />
    </FilesContextProvider>,
    {routePayload: getCopilotTaskCodeEditorPayload()},
  )

  const input = screen.getByLabelText('File input')
  await user.type(input, 'abc')
  expect(screen.getByText('readme: M')).toBeInTheDocument()

  // back out some changes, file should still be marked as modified
  await user.type(input, '{backspace}{backspace}')
  expect(screen.getByText('readme: M')).toBeInTheDocument()

  // back out final change, file should no longer be marked as modified
  await user.type(input, '{backspace}')
  expect(screen.queryByText('readme: M')).not.toBeInTheDocument()
})
