import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'

import {FilterProvider} from '../../contexts/FilterContext'
import {generateCommitGroups} from '../../shared/test-helpers'
import {useLoadDeferredCommitData} from '../../shared/use-load-deferred-commit-data'
import {deferredData, getCommitsRoutePayload} from '../../test-utils/mock-data'
import type {CommitGroup, CommitsPayload} from '../../types/commits-types'
import {CommitList} from '../Commits/CommitList'

jest.mock('react', () => {
  const React = jest.requireActual('react')
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.Suspense = ({children}: {children: any}) => children
  return React
})

jest.mock('../../shared/use-load-deferred-commit-data')
const mockedUseLoadDeferredCommitData = jest.mocked(useLoadDeferredCommitData)

beforeEach(() => {
  jest.clearAllMocks()
  mockedUseLoadDeferredCommitData.mockReturnValue(deferredData)
})

const renderCommitList = (
  commitGroups: CommitGroup[],
  filters: CommitsPayload['filters'] = getCommitsRoutePayload().filters,
) => {
  const routePayload = getCommitsRoutePayload()
  const {repo, metadata} = routePayload

  return render(
    <CurrentRepositoryProvider repository={repo}>
      <FilterProvider filters={filters}>
        <CommitList commitGroups={commitGroups} deferredDataUrl={metadata.deferredDataUrl} softNavToCommit={false} />
      </FilterProvider>
    </CurrentRepositoryProvider>,
    {
      routePayload: {
        ...routePayload,
        filters,
      },
      appPayload: {
        helpUrl: 'help.biz',
      },
    },
  )
}

test('renders commit groups properly when there is more than one group', async () => {
  const commitGroups = generateCommitGroups(2, 2)

  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    renderCommitList(commitGroups)
  })

  const commitGroupElements = screen.getAllByTestId('commit-group-title')
  expect(commitGroupElements).toHaveLength(2)
  expect(screen.getAllByTestId('commit-row-item')).toHaveLength(4)
}, 10000)

describe('rename history functionality', () => {
  test('should render rename history when there is rename history', async () => {
    const {filters} = getCommitsRoutePayload()
    filters.pagination.hasNextPage = false

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      renderCommitList(generateCommitGroups(1, 1), filters)
    })

    expect(screen.getByTestId('commit-note-title')).toBeInTheDocument()
    expect(screen.getByTestId('commit-note-title').textContent).toBe('Renamed from this_is_the_old_name.py')
    const link = screen.getByText('(Browse History)')
    expect(link).toHaveAttribute('href', 'https://github.localhost/repos-org/maximum-effort/commits/blah.py')
  }, 5000)

  test('should render previous rename history when there is previous rename history', async () => {
    const {filters} = getCommitsRoutePayload()
    filters.pagination.hasNextPage = false
    filters.newPath = 'hereIsNewPath.py'
    filters.originalBranch = 'originalBranch'

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      renderCommitList(generateCommitGroups(1, 1), filters)
    })

    const allListNotes = screen.getAllByTestId('commit-note-title')
    expect(allListNotes).toHaveLength(2)
    expect(allListNotes[0]!.textContent).toBe('Renamed to hereIsNewPath.py')
    const links = screen.getAllByText('(Browse History)')
    expect(links[0]).toHaveAttribute('href', '/monalisa/smile/commits/originalBranch/hereIsNewPath.py')
  }, 5000)

  test('should not render renamed from history when there is rename history but not viewing the last page', async () => {
    const {filters} = getCommitsRoutePayload()
    filters.pagination.hasNextPage = true

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      renderCommitList(generateCommitGroups(1, 1), filters)
    })

    expect(screen.queryByText('Renamed from this_is_the_old_name.py')).not.toBeInTheDocument()
  })

  test('should not render renamed from history when there is rename history but we are viewing not a file view', async () => {
    const {filters} = getCommitsRoutePayload()
    filters.pagination.hasNextPage = false
    filters.currentBlobPath = ''

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      renderCommitList(generateCommitGroups(1, 1), filters)
    })

    expect(screen.queryByText('Renamed from this_is_the_old_name.py')).not.toBeInTheDocument()
  })
})
