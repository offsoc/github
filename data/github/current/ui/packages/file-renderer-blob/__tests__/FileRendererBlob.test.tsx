import {RenderState, useFileRenderer} from '../use-file-renderer'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import FileRendererBlob from '../FileRendererBlob'

jest.mock('@github-ui/file-renderer-blob/use-file-renderer')

jest.mock('react', () => {
  const React = jest.requireActual('react')
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.Suspense = ({children}: {children: any}) => children
  return React
})
const mockedUseFilesPageInfo = jest.mocked(useFileRenderer)

beforeEach(() => {
  mockedUseFilesPageInfo.mockReturnValue({
    renderState: RenderState.LOADING,
    errorMsg: null,
    iFrameRef: {current: null},
    containerRef: {current: null},
  })
})

test('Renders file renderer content', async () => {
  const sampleProps = {
    identityUuid: '00000000-0000-0000-0000-000000000000',
    type: 'pdf',
    size: 1,
    url: 'https://www.github.com',
  }

  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(() => {
    render(<FileRendererBlob {...sampleProps} />)
  })

  expect(screen.getByTitle('File display')).toBeInTheDocument()
})

test('Renderer shows warning if the blob is over 200MB', async () => {
  const sampleProps = {
    identityUuid: '00000000-0000-0000-0000-000000000000',
    type: 'pdf',
    size: 200_000_001,
    url: 'https://www.github.com',
  }

  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(() => {
    render(<FileRendererBlob {...sampleProps} />)
  })

  expect(screen.getByText('Sorry, this is too big to display.')).toBeInTheDocument()
})

test('Rendered notebooks have a limit of 30MB', async () => {
  const sampleProps = {
    identityUuid: '00000000-0000-0000-0000-000000000000',
    type: 'ipynb',
    size: 30_000_001,
    url: 'https://www.github.com',
  }

  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(() => {
    render(<FileRendererBlob {...sampleProps} />)
  })

  expect(screen.getByText('Sorry, this is too big to display.')).toBeInTheDocument()
})

test('Renders error message if that is the state of the file renderer', async () => {
  const sampleProps = {
    identityUuid: '00000000-0000-0000-0000-000000000000',
    type: 'pdf',
    size: 1,
    url: 'https://www.github.com',
  }

  mockedUseFilesPageInfo.mockClear()
  mockedUseFilesPageInfo.mockReturnValue({
    renderState: RenderState.ERROR,
    errorMsg: 'Test Error',
    iFrameRef: {current: null},
    containerRef: {current: null},
  })

  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(() => {
    render(<FileRendererBlob {...sampleProps} />)
  })

  expect(screen.getByText('Error rendering embedded code')).toBeInTheDocument()
  expect(screen.getByText('Test Error')).toBeInTheDocument()

  mockedUseFilesPageInfo.mockClear()
})

test('Renders error if that is the state of the file renderer without a message', async () => {
  const sampleProps = {
    identityUuid: '00000000-0000-0000-0000-000000000000',
    type: 'pdf',
    size: 1,
    url: 'https://www.github.com',
  }

  mockedUseFilesPageInfo.mockClear()
  mockedUseFilesPageInfo.mockReturnValue({
    renderState: RenderState.ERROR,
    errorMsg: null,
    iFrameRef: {current: null},
    containerRef: {current: null},
  })

  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(() => {
    render(<FileRendererBlob {...sampleProps} />)
  })

  expect(screen.getByText('Unable to render code block')).toBeInTheDocument()

  mockedUseFilesPageInfo.mockClear()
})

test('Renders iframe in the ready state', async () => {
  const sampleProps = {
    identityUuid: '00000000-0000-0000-0000-000000000000',
    type: 'pdf',
    size: 1,
    url: 'https://www.github.com',
  }

  mockedUseFilesPageInfo.mockClear()
  mockedUseFilesPageInfo.mockReturnValue({
    renderState: RenderState.READY,
    errorMsg: null,
    iFrameRef: {current: null},
    containerRef: {current: null},
  })

  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(() => {
    render(<FileRendererBlob {...sampleProps} />)
  })

  expect(screen.getByTitle('File display')).toBeInTheDocument()
})
