import '../test-utils/mocks'

import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {App} from '../App'
import {CopilotTask} from '../routes/CopilotTask'
import {getCopilotTaskCodeEditorPayload, getCopilotTaskRoutePayload} from '../test-utils/mock-data'

const terminateMock = jest.fn()

// Web workers are not supported on jsdom, so we mock the minimum we need for this test,
// which will call onmessage once per each postMessage with a fixed resultset.
window.Worker = class {
  // onmessage will be replaced by the caller to handle responses
  onmessage = (data: unknown) => data
  postMessage() {
    this.onmessage({data: {query: 'any', list: ['contra', 'transport', 'ter/rain'], startTime: 20, baseCount: 4}})
  }
  terminate = terminateMock
} as unknown as typeof Worker

jest.useFakeTimers()

window.performance.mark = jest.fn()
window.performance.clearResourceTimings = jest.fn()

// Mock useNavigate
const navigateFn = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  const actual = jest.requireActual('@github-ui/use-navigate')
  return {
    ...actual,
    useNavigate: () => navigateFn,
  }
})

beforeEach(() => {
  jest.clearAllMocks()
  window.localStorage.clear()
})

test('Renders the CopilotTask landing view', () => {
  const routePayload = getCopilotTaskRoutePayload()
  render(
    <App>
      <CopilotTask />
    </App>,
    {
      pathname: '/owner/repo/pull/1/edit',
      routePayload,
    },
  )
  expect(screen.getByText(routePayload.fileTree['']!.items[0]!.name)).toBeInTheDocument()
})

test('Renders the CopilotTask file edit view', () => {
  const routePayload = {...getCopilotTaskRoutePayload(), path: 'path/to/file.txt'}
  render(
    <App>
      <CopilotTask />
    </App>,
    {
      pathname: '/monalisa/smile/pull/1/edit/file/path/to/file.txt',
      routePayload,
    },
  )

  expect(screen.getByText(routePayload.fileTree['']!.items[0]!.name)).toBeInTheDocument()
  expect(screen.getByText('path/to/file.txt')).toBeInTheDocument()
})

test('Renders the CopilotTask new file view', () => {
  const routePayload = getCopilotTaskRoutePayload()
  render(
    <App>
      <CopilotTask />
    </App>,
    {
      pathname: '/monalisa/smile/pull/1/edit/new',
      routePayload,
    },
  )

  expect(screen.getByText('readme')).toBeInTheDocument()
  expect(screen.getByPlaceholderText('Name your file...')).toBeInTheDocument()
  expect(screen.getByText('Save')).toBeInTheDocument()
})

describe('adding new files', () => {
  test('updates commit panel', async () => {
    const routePayload = getCopilotTaskRoutePayload()
    const {user} = render(
      <App>
        <CopilotTask />
      </App>,
      {
        pathname: '/monalisa/smile/pull/1/edit/new',
        routePayload,
      },
    )

    // save a file
    await user.type(screen.getByPlaceholderText('Name your file...'), 'new-file.txt')
    await user.click(screen.getByText('Save'))
    await user.click(screen.getByRole('button', {name: 'Commit changes'}))

    // confirm that the commit changes dialog gets the updated file
    expect(screen.getByRole('heading', {name: 'Commit changes'})).toBeInTheDocument()
    expect(screen.getByText('Commit message')).toBeInTheDocument()
    expect(screen.getByRole<HTMLInputElement>('checkbox').value).toBe('new-file.txt')
  })

  test('updates file tree when adding new file', async () => {
    const routePayload = getCopilotTaskRoutePayload()
    const {user} = render(
      <App>
        <CopilotTask />
      </App>,
      {
        pathname: '/monalisa/smile/pull/1/edit/new',
        routePayload,
      },
    )

    // save a file
    await user.type(screen.getByPlaceholderText('Name your file...'), 'new-file.txt')
    await user.click(screen.getByText('Save'))

    // confirm that the file tree gets the updated file
    expect(
      screen.getByText('new-file.txt', {selector: '.PRIVATE_TreeView-item-content-text > span'}),
    ).toBeInTheDocument()
  })

  test('updates file tree when adding new directories', async () => {
    const routePayload = getCopilotTaskRoutePayload()
    const {user} = render(
      <App>
        <CopilotTask />
      </App>,
      {
        pathname: '/monalisa/smile/pull/1/edit/new',
        routePayload,
      },
    )

    // save a file
    await user.type(screen.getByPlaceholderText('Name your file...'), 'my/new/file.txt')
    await user.click(screen.getByText('Save'))

    // confirm that the file tree gets the updated file
    expect(screen.getByText('file.txt', {selector: '.PRIVATE_TreeView-item-content-text > span'})).toBeInTheDocument()
    expect(screen.getByText('my/new', {selector: '.PRIVATE_TreeView-item-content-text > span'})).toBeInTheDocument()
  })
})

test('renaming file updates file tree', async () => {
  const routePayload = getCopilotTaskCodeEditorPayload()
  const {user} = render(
    <App>
      <CopilotTask />
    </App>,
    {
      pathname: '/monalisa/smile/pull/1/edit/file/readme',
      routePayload,
    },
  )

  // rename a file
  await user.click(screen.getByLabelText('More file options'))
  await user.click(screen.getByText('Rename'))
  const renameInput = screen.getByPlaceholderText('Name your file...')
  await user.clear(renameInput)
  await user.type(renameInput, 'new-file.txt')
  await user.click(screen.getByText('Save'))

  // confirm that the file tree gets the updated file
  expect(screen.getByText('new-file.txt', {selector: '.PRIVATE_TreeView-item-content-text > span'})).toBeInTheDocument()
  // and the old file remains as a deleted file
  expect(screen.getByText('readme', {selector: '.PRIVATE_TreeView-item-content-text > span'})).toBeInTheDocument()
  expect(navigateFn).toHaveBeenCalledWith('/monalisa/smile/pull/1/edit/file/new-file.txt')
  expect(navigateFn).toHaveBeenCalledTimes(1)
})
