import {mockFetch} from '@github-ui/mock-fetch'
import {act, screen, within} from '@testing-library/react'

import {Commit} from '../../../routes/Commit'
import {asyncCommentThreadData, fileTreePayload} from '../../../test-utils/commit-mock-data'
import {renderCommit} from '../../../test-utils/Render'

beforeEach(() => {
  jest.clearAllMocks()
  // jests querySelector doesn't like focus-within so we have to mock it
  jest.spyOn(document, 'querySelector').mockImplementation(() => {
    return null
  })
})

test('Commit renders the file tree', async () => {
  renderCommit(<Commit />, fileTreePayload)

  expect(screen.getByText('File tree')).toBeInTheDocument()

  expect(screen.getByText('src')).toBeInTheDocument()
  expect(screen.getByText('index.js')).toBeInTheDocument()
  expect(screen.getByText('components')).toBeInTheDocument()
  expect(screen.getByText('Component.js')).toBeInTheDocument()
  expect(screen.getByText('Component.test.js')).toBeInTheDocument()
  expect(screen.getByText('Component.css')).toBeInTheDocument()
})

test('Commit renders the file tree with comment counts async', async () => {
  renderCommit(<Commit />, fileTreePayload)

  expect(screen.queryByText('5')).not.toBeInTheDocument()
  expect(screen.queryByText('9+')).not.toBeInTheDocument()
  expect(screen.queryByText('2')).not.toBeInTheDocument()

  await act(() =>
    mockFetch.resolvePendingRequest(
      `/monalisa/smile/commit/${fileTreePayload.commit.oid}/deferred_comment_data`,
      asyncCommentThreadData,
    ),
  )

  const fileTree = screen.getByRole('tree', {name: 'File Tree'})

  expect(await within(fileTree).findByText('5')).toBeInTheDocument()
  expect(await within(fileTree).findByText('9+')).toBeInTheDocument()
  expect(await within(fileTree).findByText('2')).toBeInTheDocument()
})

test('Can filter by file name', async () => {
  const {user} = renderCommit(<Commit />, fileTreePayload)

  expect(screen.getByText('src')).toBeInTheDocument()
  expect(screen.getByText('index.js')).toBeInTheDocument()
  expect(screen.getByText('components')).toBeInTheDocument()

  const input = screen.getByLabelText('Filter files…')

  expect(input).toBeInTheDocument()

  await act(async () => {
    await user.click(input)
    await user.paste('component')
    // Wait for debounce
    await new Promise(r => setTimeout(r, 500))
  })

  expect(screen.getByText('src/components')).toBeInTheDocument()
  expect(screen.queryByText('index.js')).not.toBeInTheDocument()
  expect(screen.queryByText('src')).not.toBeInTheDocument()
  expect(screen.queryByText('components')).not.toBeInTheDocument()
  expect(screen.getByText('Component.test.js')).toBeInTheDocument()
  expect(screen.getByText('Component.css')).toBeInTheDocument()
})

test('Can filter by file extension', async () => {
  const {user} = renderCommit(<Commit />, fileTreePayload)

  expect(screen.getByText('src')).toBeInTheDocument()
  expect(screen.getByText('index.js')).toBeInTheDocument()
  expect(screen.getByText('components')).toBeInTheDocument()

  const button = screen.getByRole('button', {name: 'Filter'})
  await user.click(button)

  // Unselect .css and remove them from list
  const jsItem = screen.getByRole('menuitemcheckbox', {name: '.css'})

  await act(async () => {
    await user.click(jsItem)
    // Wait for debounce
    await new Promise(r => setTimeout(r, 500))
  })

  expect(screen.getByText('src')).toBeInTheDocument()
  expect(screen.getByText('index.js')).toBeInTheDocument()
  expect(screen.getByText('components')).toBeInTheDocument()
  expect(screen.getByText('Component.js')).toBeInTheDocument()
  expect(screen.getByText('Component.test.js')).toBeInTheDocument()
  expect(screen.queryByText('Component.css')).not.toBeInTheDocument()
})
