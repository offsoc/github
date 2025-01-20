import {render} from '@github-ui/react-core/test-utils'
import {KeyIcon, RepoIcon} from '@primer/octicons-react'
import {screen} from '@testing-library/react'

import {AggregateMetricsList} from '../components/AggregateMetricsList'
import {
  AggregateCountType,
  type BypassReasonCount,
  type RepositoryCount,
  type TokenTypeCount,
} from '../types/push-protection-metrics'

describe('AggregateMetricsList', () => {
  it('renders loading skeleton', () => {
    render(<AggregateMetricsList title="Loading list" loading={true} aggregateCounts={[]} icon={KeyIcon} />)

    expect(screen.getByText('Loading list')).toBeInTheDocument()
    expect(screen.getByTestId('metrics-list-loading-skeleton')).toBeInTheDocument()
  })

  it('renders blankslate when empty counts data is provided', () => {
    render(<AggregateMetricsList title="Empty list" aggregateCounts={[]} icon={KeyIcon} />)

    expect(screen.getByText('Empty list')).toBeInTheDocument()
    expect(screen.getByTestId('empty-metrics-list-blankslate')).toBeInTheDocument()
    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.getByText('Try modifying your filters or clear your search.')).toBeInTheDocument()
  })

  it('renders with token type counts', () => {
    renderComponentWithTokenTypeCounts({baseActionUrl: undefined})

    expect(screen.getByText('List with secret types')).toBeInTheDocument()
    expect(screen.getByText(/Clojars Deploy Token/)).toBeInTheDocument()
    expect(screen.getByText('234')).toBeInTheDocument()
    expect(screen.getByText(/Adafruit IO Key/)).toBeInTheDocument()
    expect(screen.getByText('894')).toBeInTheDocument()
    expect(screen.getByText(/hello world \(custom pattern\)/)).toBeInTheDocument()
    expect(screen.getByText('425')).toBeInTheDocument()
    expect(screen.getByText('TOKEN_WITH_NO_METADATA')).toBeInTheDocument()
    expect(screen.getByText('347')).toBeInTheDocument()
  })

  it('renders token type counts with action links', () => {
    renderComponentWithTokenTypeCounts({
      baseActionUrl: '/orgs/github/security/alerts/secret-scanning?query=bypassed%3Atrue',
    })

    expect(screen.getByText('List with secret types')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: /Clojars Deploy Token/})).toHaveAttribute(
      'href',
      '/orgs/github/security/alerts/secret-scanning?query=bypassed%3Atrue+secret-type%3Aclojars_deploy_token',
    )
    expect(screen.getByText('234')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: /Adafruit IO Key/})).toHaveAttribute(
      'href',
      '/orgs/github/security/alerts/secret-scanning?query=bypassed%3Atrue+secret-type%3Aadafruit_io_key',
    )
    expect(screen.getByText('894')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: /hello world \(custom pattern\)/})).toHaveAttribute(
      'href',
      '/orgs/github/security/alerts/secret-scanning?query=bypassed%3Atrue+secret-type%3Ahello_world',
    )
    expect(screen.getByText('425')).toBeInTheDocument()
    expect(screen.queryByRole('link', {name: /TOKEN_WITH_NO_METADATA/})).not.toBeInTheDocument()
    expect(screen.getByText('TOKEN_WITH_NO_METADATA')).toBeInTheDocument()
    expect(screen.getByText('347')).toBeInTheDocument()
  })

  it('renders with repository counts', () => {
    renderComponentWithRepositoryCounts({baseActionUrl: undefined})

    expect(screen.getByText('List with repositories')).toBeInTheDocument()
    expect(screen.getByText(/secret-scanning/)).toBeInTheDocument()
    expect(screen.getByText('114')).toBeInTheDocument()
    expect(screen.getByText(/token-scanning-service/)).toBeInTheDocument()
    expect(screen.getByText('654')).toBeInTheDocument()
  })

  it('renders repository counts with action links', () => {
    renderComponentWithRepositoryCounts({
      baseActionUrl: '/orgs/github/security/alerts/secret-scanning?query=bypassed%3Atrue',
    })

    expect(screen.getByText('List with repositories')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: /secret-scanning/})).toHaveAttribute(
      'href',
      '/orgs/github/security/alerts/secret-scanning?query=bypassed%3Atrue+repo%3Asecret-scanning',
    )
    expect(screen.getByText('114')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: /token-scanning-service/})).toHaveAttribute(
      'href',
      '/orgs/github/security/alerts/secret-scanning?query=bypassed%3Atrue+repo%3Atoken-scanning-service',
    )
    expect(screen.getByText('654')).toBeInTheDocument()
  })

  it('renders with bypasses reason counts', () => {
    renderComponentWithBypassesReasonCounts()

    expect(screen.getByText('Bypass reason distribution')).toBeInTheDocument()
    expect(screen.getByText('False positives')).toBeInTheDocument()
    expect(screen.getByText('15 (75%)')).toBeInTheDocument()

    expect(screen.getByText('Used in tests')).toBeInTheDocument()
    expect(screen.getByText('5 (25%)')).toBeInTheDocument()

    expect(screen.getByText('Fix later')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('does not render see all button when row count is less than maximum', () => {
    const counts: TokenTypeCount[] = [
      {
        type: AggregateCountType.TokenType,
        name: 'Clojars Deploy Token',
        slug: 'clojars_deploy_token',
        count: 234,
        isCustomPattern: false,
        hasMetadata: true,
      },
      {
        type: AggregateCountType.TokenType,
        name: 'Adafruit IO Key',
        slug: 'adafruit_io_key',
        count: 894,
        isCustomPattern: false,
        hasMetadata: true,
      },
      {
        type: AggregateCountType.TokenType,
        name: 'hello world',
        slug: 'hello_world',
        count: 425,
        isCustomPattern: true,
        hasMetadata: true,
      },
    ]

    render(
      <AggregateMetricsList
        title="List with secret types"
        aggregateCounts={counts}
        icon={KeyIcon}
        seeAllButton={<p>See all button</p>}
      />,
    )
    expect(screen.queryByText('See all button')).not.toBeInTheDocument()
  })

  it('renders see all button when row count is maximum', () => {
    const counts: TokenTypeCount[] = [
      {
        type: AggregateCountType.TokenType,
        name: 'Clojars Deploy Token',
        slug: 'clojars_deploy_token',
        count: 234,
        isCustomPattern: false,
        hasMetadata: true,
      },
      {
        type: AggregateCountType.TokenType,
        name: 'Adafruit IO Key',
        slug: 'adafruit_io_key',
        count: 894,
        isCustomPattern: false,
        hasMetadata: true,
      },
      {
        type: AggregateCountType.TokenType,
        name: 'hello world',
        slug: 'hello_world',
        count: 425,
        isCustomPattern: true,
        hasMetadata: true,
      },
      {
        type: AggregateCountType.TokenType,
        name: 'TOKEN_WITH_NO_METADATA',
        slug: '',
        count: 347,
        isCustomPattern: false,
        hasMetadata: false,
      },
    ]

    render(
      <AggregateMetricsList
        title="List with secret types"
        aggregateCounts={counts}
        icon={KeyIcon}
        seeAllButton={<p>See all button</p>}
      />,
    )
    expect(screen.getByText('See all button')).toBeInTheDocument()
  })
})

function renderComponentWithTokenTypeCounts({baseActionUrl}: {baseActionUrl?: string}): void {
  const counts: TokenTypeCount[] = [
    {
      type: AggregateCountType.TokenType,
      name: 'Clojars Deploy Token',
      slug: 'clojars_deploy_token',
      count: 234,
      isCustomPattern: false,
      hasMetadata: true,
    },
    {
      type: AggregateCountType.TokenType,
      name: 'Adafruit IO Key',
      slug: 'adafruit_io_key',
      count: 894,
      isCustomPattern: false,
      hasMetadata: true,
    },
    {
      type: AggregateCountType.TokenType,
      name: 'hello world',
      slug: 'hello_world',
      count: 425,
      isCustomPattern: true,
      hasMetadata: true,
    },
    {
      type: AggregateCountType.TokenType,
      name: 'TOKEN_WITH_NO_METADATA',
      slug: '',
      count: 347,
      isCustomPattern: false,
      hasMetadata: false,
    },
  ]

  render(
    <AggregateMetricsList
      title="List with secret types"
      aggregateCounts={counts}
      icon={KeyIcon}
      baseIndexLink={baseActionUrl}
      seeAllButton={<p>See all button</p>}
    />,
  )
}

function renderComponentWithRepositoryCounts({baseActionUrl}: {baseActionUrl?: string}): void {
  const counts: RepositoryCount[] = [
    {
      type: AggregateCountType.Repository,
      name: 'secret-scanning',
      count: 114,
    },
    {
      type: AggregateCountType.Repository,
      name: 'token-scanning-service',
      count: 654,
    },
  ]

  render(
    <AggregateMetricsList
      title="List with repositories"
      aggregateCounts={counts}
      icon={RepoIcon}
      baseIndexLink={baseActionUrl}
      seeAllButton={<p>See all button</p>}
    />,
  )
}

function renderComponentWithBypassesReasonCounts(): void {
  const counts: BypassReasonCount[] = [
    {
      type: AggregateCountType.BypassReason,
      name: 'False positives',
      count: 15,
      percent: 75,
    },
    {
      type: AggregateCountType.BypassReason,
      name: 'Fix later',
      count: 0,
      percent: 0,
    },
    {
      type: AggregateCountType.BypassReason,
      name: 'Used in tests',
      count: 5,
      percent: 25,
    },
  ]

  render(<AggregateMetricsList title="Bypass reason distribution" aggregateCounts={counts} />)
}
