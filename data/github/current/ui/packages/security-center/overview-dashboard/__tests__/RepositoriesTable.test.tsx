import {screen} from '@testing-library/react'

import {JSON_HEADER} from '../../common/utils/fetch-json'
import {render} from '../../test-utils/Render'
import {RepositoriesTable} from '../components/RepositoriesTable'

describe('RepositoriesTable', () => {
  const query = 'archived: false'
  const startDate = '2022-01-01'
  const endDate = '2023-01-31'

  it('renders the component with the correct props', () => {
    render(<RepositoriesTable query={query} startDate={startDate} endDate={endDate} />)

    expect(screen.getByText('Repository')).toBeInTheDocument()
    expect(screen.getByText('Open alerts')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('fetches and displays the correct data', async () => {
    const mockData = {
      repositories: [
        {
          id: 1,
          repository: 'my-repo',
          ownerType: 'ORGANIZATION',
          total: 1337,
          critical: 7331,
          high: 3173,
          medium: 3371,
          low: 1733,
        },
      ],
      urlInfo: {
        1: 'http://foo',
      },
    }

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => mockData,
      ok: true,
      headers: new Headers(JSON_HEADER),
    } as Response)

    render(<RepositoriesTable query={query} startDate={startDate} endDate={endDate} />)

    const repoLink = await screen.findByText('my-repo')
    expect(repoLink).toBeInTheDocument()
    expect(repoLink).toHaveAttribute('href', 'http://foo')
    expect(screen.getByText('1,337')).toBeInTheDocument()
    expect(screen.getByText('7,331')).toBeInTheDocument()
    expect(screen.getByText('3,173')).toBeInTheDocument()
    expect(screen.getByText('3,371')).toBeInTheDocument()
    expect(screen.getByText('1,733')).toBeInTheDocument()
  })

  it('fetches and displays the correct data for user-owned repository', async () => {
    const mockData = {
      repositories: [
        {
          id: 1,
          repository: 'my-repo',
          ownerType: 'USER',
        },
      ],
      urlInfo: {
        1: 'http://foo',
      },
    }

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => mockData,
      ok: true,
      headers: new Headers(JSON_HEADER),
    } as Response)

    render(<RepositoriesTable query={query} startDate={startDate} endDate={endDate} />)

    const repoLink = await screen.findByText('my-repo')
    expect(repoLink).toBeInTheDocument()
    expect(repoLink).toHaveAttribute('href', '/orgs/my-org/security/alerts/secret-scanning?query=repo%3Amy-repo')
  })

  it('displays N/A for null counts', async () => {
    const mockData = {
      repositories: [
        {
          id: 1,
          repository: 'my-repo',
          ownerType: 'ORGANIZATION',
          total: 1337,
          critical: 7331,
          high: null,
          medium: 3371,
          low: 1733,
        },
      ],
      urlInfo: {
        1: 'http://foo',
      },
    }

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => mockData,
      ok: true,
      headers: new Headers(JSON_HEADER),
    } as Response)

    render(<RepositoriesTable query={query} startDate={startDate} endDate={endDate} />)

    const repoLink = await screen.findByText('my-repo')
    expect(repoLink).toBeInTheDocument()
    expect(repoLink).toHaveAttribute('href', 'http://foo')
    expect(screen.getByText('1,337')).toBeInTheDocument()
    expect(screen.getByText('7,331')).toBeInTheDocument()
    expect(screen.getByText('N/A')).toBeInTheDocument()
    expect(screen.getByText('3,371')).toBeInTheDocument()
    expect(screen.getByText('1,733')).toBeInTheDocument()
  })

  it('displays a no data state on error', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => {},
      ok: false,
      headers: new Headers(JSON_HEADER),
    } as Response)

    render(<RepositoriesTable query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByTestId('error')).toBeInTheDocument()
  })

  it('displays error state when html is returned from server instead of json', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      text: async () => '<DOCUMENT',
      ok: true,
      headers: new Headers({'Content-Type': 'text/html'}),
    } as Response)

    render(<RepositoriesTable query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByTestId('error')).toBeInTheDocument()
  })
})
