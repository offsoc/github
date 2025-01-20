import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {OpenClosedTabs} from '../OpenClosedTabs'

jest.mock('@github-ui/react-core/use-app-payload')

jest.mock('@github-ui/ssr-utils', () => ({
  get ssrSafeLocation() {
    const ssrSafeLocationMock = jest.fn().mockImplementation(() => ({pathname: `/some/repo/issues`}))
    return ssrSafeLocationMock()
  },
}))

type TestComponentProps = {
  query: string
  nameWithOwner: string
}

jest.mock('react-relay', () => {
  const originalModule = jest.requireActual('react-relay')

  return {
    __esModule: true,
    ...originalModule,
    useLazyLoadQuery: jest.fn(() => ({search: {openIssueCount: 1, closedIssueCount: 2}})),
  }
})
let localQuery = ''
jest.mock('../../../../contexts/QueryContext', () => {
  const originalModule = jest.requireActual('../../../../contexts/QueryContext')

  return {
    __esModule: true,
    ...originalModule,
    useQueryContext: jest.fn(() => ({activeSearchQuery: localQuery})),
  }
})

const TestComponent = ({query = '', nameWithOwner = ''}: TestComponentProps = {query: '', nameWithOwner: ''}) => {
  localQuery = query
  const [owner, name] = nameWithOwner.split('/')
  if (!owner?.trim() || !name?.trim()) throw new Error('nameWithOwner is required')

  return OpenClosedTabs({}) as never as JSX.Element
}

test('renders link to view open issues with the default query', async () => {
  render(<TestComponent query="is:issue state:open" nameWithOwner="some/repo" />)

  const link = screen.getAllByTestId('list-view-section-filter-link')[0]
  expect(link).toBeInTheDocument()
  expect(link).toHaveTextContent('Open1')
  expect(link).toHaveAttribute('href', '/some/repo/issues')
})

test('renders link to view open issues with a custom query', async () => {
  render(<TestComponent query="is:issue state:closed assignee:someone" nameWithOwner="some/repo" />)

  const link = screen.getAllByTestId('list-view-section-filter-link')[0]
  expect(link).toBeInTheDocument()
  expect(link).toHaveTextContent('Open')
  expect(link).toHaveAttribute('href', '/some/repo/issues?q=is%3Aissue%20state%3Aopen%20assignee%3Asomeone')
})

test('renders link to view closed issues with the default query', async () => {
  render(<TestComponent query="is:issue state:open" nameWithOwner="some/repo" />)

  const link = screen.getAllByTestId('list-view-section-filter-link')[1]
  expect(link).toBeInTheDocument()
  expect(link).toHaveTextContent('Closed')
  expect(link).toHaveAttribute('href', '/some/repo/issues?q=is%3Aissue%20state%3Aclosed')
})

test('renders link to view closed issues with a custom query', async () => {
  render(<TestComponent query="is:issue state:closed assignee:someone" nameWithOwner="some/repo" />)

  const link = screen.getAllByTestId('list-view-section-filter-link')[1]
  expect(link).toBeInTheDocument()
  expect(link).toHaveTextContent('Closed')
  expect(link).toHaveAttribute('href', '/some/repo/issues?q=is%3Aissue%20state%3Aclosed%20assignee%3Asomeone')
})
