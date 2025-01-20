import {ListView} from '@github-ui/list-view'
import {mockFetch} from '@github-ui/mock-fetch'
import {render} from '@github-ui/react-core/test-utils'
import type {RepositoryItem} from '@github-ui/repos-list-shared'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {screen} from '@testing-library/react'

import type {ListViewVariant} from '../components/ReposList'
import {ReposListItem} from '../components/ReposListItem'

// In order to fetch the sparkline, we need to simulate that the component is visible
// by immediately calling the callback with isIntersecting = true in the observer.
jest.mock('@github-ui/use-sticky-header/useIntersectionObserver', () => ({
  useIntersectionObserver: (callback: (entries: IntersectionObserverEntry[]) => void) => {
    callback([{isIntersecting: true} as IntersectionObserverEntry])
    return [jest.fn(), jest.fn()]
  },
}))

const repo: RepositoryItem = {
  name: 'test-repo',
  type: 'Public',
  owner: 'monalisa',
  description: 'describe me' as SafeHTMLString,
  allTopics: [
    'planes',
    'trains',
    'automobiles',
    'buses',
    'boats',
    'jets',
    'bicycles',
    'skateboards',
    'scooters',
    'motorcycles',
    'subways',
  ],
  primaryLanguage: {name: 'Ruby', color: '#701516'},
  pullRequestCount: 6000,
  issueCount: 20,
  starsCount: 10,
  forksCount: 30,
  license: 'MIT License',
  lastUpdated: {hasBeenPushedTo: true, timestamp: '2020-01-01T00:00:00.000Z'},
  participation: [1, 2, 3, 4, 5, 6, 7, 8],
  isFork: false,
}

function renderReposListItem(item: JSX.Element, variant: ListViewVariant = 'default') {
  return render(
    <ListView variant={variant} title="Sample repositories">
      {item}
    </ListView>,
  )
}

describe('ReposListItem', () => {
  it('renders all expected elements', () => {
    renderReposListItem(<ReposListItem repo={repo} />)

    expect(screen.getByText('test-repo')).toBeInTheDocument()
    expect(screen.getByText('Public')).toBeInTheDocument()
    expect(screen.getByText('describe me', {exact: false})).toBeInTheDocument()
    expect(screen.getByText('Updated', {exact: false})).toBeInTheDocument()
    expect(screen.getByText('planes')).toBeInTheDocument()
    expect(screen.getByText('trains')).toBeInTheDocument()
    expect(screen.getByText('automobiles')).toBeInTheDocument()
    expect(screen.getByText('+ 1')).toBeInTheDocument()

    expect(screen.getByText('MIT License')).toBeInTheDocument()

    const forksListLink = screen.getByLabelText('30 forks')
    expect(forksListLink.getAttribute('href')).toBe('/monalisa/test-repo/forks')

    const starsLink = screen.getByLabelText('10 stars')
    expect(starsLink.getAttribute('href')).toBe('/monalisa/test-repo/stargazers')

    const issuesLink = screen.getByLabelText('20 issues')
    expect(issuesLink.getAttribute('href')).toBe('/monalisa/test-repo/issues')

    const pullRequestsLink = screen.getByLabelText('6k pull requests')
    expect(pullRequestsLink.getAttribute('href')).toBe('/monalisa/test-repo/pulls')

    const trainsTopicLink = screen.getByTestId('trains-topic-link')
    expect(trainsTopicLink.getAttribute('href')).toBe('/search?q=topic%3Atrains+org%3Amonalisa&type=Repositories')

    expect(screen.getByTestId('test-repo-sparkline')).toBeInTheDocument()
  })

  it('distinguishes between created and updated', () => {
    renderReposListItem(
      <ReposListItem
        repo={{
          ...repo,
          lastUpdated: {hasBeenPushedTo: false, timestamp: '2020-01-01T00:00:00.000Z'},
        }}
      />,
    )

    expect(screen.getByText('Created', {exact: false})).toBeInTheDocument()
  })

  it('hides pull request and issue icons if they are null in the payload', () => {
    renderReposListItem(<ReposListItem repo={{...repo, pullRequestCount: null, issueCount: null}} />)

    expect(screen.queryByTestId('issue-count')).not.toBeInTheDocument()
    expect(screen.queryByTestId('pull-request-count')).not.toBeInTheDocument()
  })

  it('fetches participation if not present on the payload', async () => {
    renderReposListItem(<ReposListItem repo={{...repo, participation: undefined}} />)

    expect(screen.queryByTestId('test-repo-sparkline')).not.toBeInTheDocument()

    mockFetch.resolvePendingRequest('/monalisa/test-repo/graphs/participation', undefined, {
      json: async () => [1, 2, 3, 2, 1],
      text: async () => '[1, 2, 3, 2, 1]',
    })

    await screen.findByTestId('test-repo-sparkline')
  })

  it('handles empty response for empty repo when fetching participation', async () => {
    renderReposListItem(<ReposListItem repo={{...repo, participation: undefined}} />)

    expect(screen.queryByTestId('sparkline')).not.toBeInTheDocument()

    mockFetch.resolvePendingRequest('/monalisa/test-repo/graphs/participation', undefined, {
      json: async () => {
        throw new Error('Cannot parse JSON')
      },
      text: async () => '',
    })

    await screen.findByTestId('empty-repo-sparkline')
  })

  it('renders all expected elements in compact mode', () => {
    renderReposListItem(<ReposListItem repo={repo} />, 'compact')

    expect(screen.getByText('test-repo')).toBeInTheDocument()

    const [narrowForksListLink, wideForksListLink] = screen.getAllByLabelText('30 forks')

    expect(narrowForksListLink!.getAttribute('href')).toBe('/monalisa/test-repo/forks')
    expect(narrowForksListLink).toBeVisible()

    expect(wideForksListLink!.getAttribute('href')).toBe('/monalisa/test-repo/forks')
    // Tests don't have a viewport width. So the narrow version is rendered
    expect(wideForksListLink).not.toBeVisible()

    const starsLink = screen.getByRole('link', {name: '10 stars'})
    expect(starsLink.getAttribute('href')).toBe('/monalisa/test-repo/stargazers')
  })
})
