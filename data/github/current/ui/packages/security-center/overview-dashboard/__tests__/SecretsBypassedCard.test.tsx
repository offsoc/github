import {screen, waitFor} from '@testing-library/react'

import type {CustomProperty} from '../../common/filter-providers/types'
import {JSON_HEADER} from '../../common/utils/fetch-json'
import {render} from '../../test-utils/Render'
import {SecretsBypassedCard} from '../components/SecretsBypassedCard'

describe('SecretsBypassedCard', () => {
  const query = 'archived: false'
  const customProperties: CustomProperty[] = [
    {name: 'foo', type: 'string'},
    {name: 'bar', type: 'single_select'},
    {name: 'baz', type: 'multi_select'},
    {name: 'qux', type: 'true_false'},
  ]
  const startDate = '2024-01-01'
  const endDate = '2024-01-31'

  it('renders the component with the correct props', () => {
    render(
      <SecretsBypassedCard query={query} customProperties={customProperties} startDate={startDate} endDate={endDate} />,
    )

    expect(screen.getByText('Secrets bypassed')).toBeInTheDocument()
    expect(screen.queryByTestId('data-card-action-link')).not.toBeInTheDocument()
  })

  it('renders the component with no data experience for invalidate date inputs', () => {
    render(
      <SecretsBypassedCard
        query={query}
        customProperties={customProperties}
        startDate="2023-01-01"
        endDate="2023-01-31"
      />,
    )

    expect(screen.getByText('No data exists for this metric with the given filters.')).toBeInTheDocument()
    expect(screen.queryByTestId('data-card-action-link')).not.toBeInTheDocument()
  })

  it('renders the component with fetched data', async () => {
    const mockData = {
      totalBlocksCount: 1337,
      successfulBlocksCount: 7331,
      bypassedAlertsCount: 1234,
    }

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => mockData,
      ok: true,
      headers: new Headers(JSON_HEADER),
    } as Response)

    render(
      <SecretsBypassedCard query={query} customProperties={customProperties} startDate={startDate} endDate={endDate} />,
    )

    expect(await screen.findByText(`1,234`)).toBeInTheDocument()
    expect(await screen.findByText(`/ 1,337`)).toBeInTheDocument()
    expect(await screen.findByText(`7,331 secrets blocked successfully`)).toBeInTheDocument()
    expect(await screen.findByTestId('data-card-action-link')).toBeInTheDocument()
  })

  it('displays a no data state on error', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => {},
      ok: false,
      headers: new Headers(JSON_HEADER),
    } as Response)

    render(
      <SecretsBypassedCard query={query} customProperties={customProperties} startDate={startDate} endDate={endDate} />,
    )

    expect(await screen.findByText('Data could not be loaded right now')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByTestId('data-card-action-link')).not.toBeInTheDocument())
  })

  it('displays error state when html is returned from server instead of json', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      text: async () => '<DOCUMENT',
      ok: true,
      headers: new Headers({'Content-Type': 'text/html'}),
    } as Response)

    render(
      <SecretsBypassedCard query={query} customProperties={customProperties} startDate={startDate} endDate={endDate} />,
    )

    expect(await screen.findByText('Data could not be loaded right now')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByTestId('data-card-action-link')).not.toBeInTheDocument())
  })

  describe('renders action link', () => {
    it('with only supported query filters', async () => {
      const mockData = {
        totalBlocksCount: 1337,
        successfulBlocksCount: 7331,
        bypassedAlertsCount: 1234,
      }

      const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => mockData,
        ok: true,
        headers: new Headers(JSON_HEADER),
      } as Response)

      render(
        <SecretsBypassedCard
          query="archived:false tool:github secret-scanning.provider:test secret-scanning.bypassed:true severity:critical props.woof:123"
          customProperties={customProperties}
          startDate={startDate}
          endDate={endDate}
        />,
      )

      const expectedUrl =
        '/orgs/my-org/security/overview/secrets-bypassed?startDate=2024-01-01&endDate=2024-01-31&query=archived%3Afalse+tool%3Agithub+secret-scanning.provider%3Atest+secret-scanning.bypassed%3Atrue+severity%3Acritical+props.woof%3A123'
      await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expectedUrl, expect.anything()))

      expect(await screen.findByTestId('data-card-action-link')).toBeInTheDocument()
      const expectedHref =
        '/orgs/my-org/security/metrics/secret-scanning?startDate=2024-01-01&endDate=2024-01-31&query=archived%3Afalse+provider%3Atest'
      expect(await screen.findByTestId('data-card-action-link')).toHaveAttribute('href', expectedHref)
    })

    it('with date period if provided', async () => {
      const mockData = {
        totalBlocksCount: 1337,
        successfulBlocksCount: 7331,
        bypassedAlertsCount: 1234,
      }

      const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => mockData,
        ok: true,
        headers: new Headers(JSON_HEADER),
      } as Response)

      render(
        <SecretsBypassedCard
          query="archived:false tool:github secret-scanning.provider:test secret-scanning.bypassed:true severity:critical props.woof:123"
          customProperties={customProperties}
          startDate={startDate}
          endDate={endDate}
          datePeriod={{period: 'last14days'}}
        />,
      )

      const expectedUrl =
        '/orgs/my-org/security/overview/secrets-bypassed?startDate=2024-01-01&endDate=2024-01-31&query=archived%3Afalse+tool%3Agithub+secret-scanning.provider%3Atest+secret-scanning.bypassed%3Atrue+severity%3Acritical+props.woof%3A123'
      await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expectedUrl, expect.anything()))

      expect(await screen.findByTestId('data-card-action-link')).toBeInTheDocument()
      const expectedHref =
        '/orgs/my-org/security/metrics/secret-scanning?period=last14days&query=archived%3Afalse+provider%3Atest'
      expect(await screen.findByTestId('data-card-action-link')).toHaveAttribute('href', expectedHref)
    })

    it('without date span param if provided date period is the same as default', async () => {
      const mockData = {
        totalBlocksCount: 1337,
        successfulBlocksCount: 7331,
        bypassedAlertsCount: 1234,
      }

      const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => mockData,
        ok: true,
        headers: new Headers(JSON_HEADER),
      } as Response)

      render(
        <SecretsBypassedCard
          query="archived:false tool:github secret-scanning.provider:test secret-scanning.bypassed:true severity:critical props.woof:123"
          customProperties={customProperties}
          startDate={startDate}
          endDate={endDate}
          datePeriod={{period: 'last30days'}}
        />,
      )

      const expectedUrl =
        '/orgs/my-org/security/overview/secrets-bypassed?startDate=2024-01-01&endDate=2024-01-31&query=archived%3Afalse+tool%3Agithub+secret-scanning.provider%3Atest+secret-scanning.bypassed%3Atrue+severity%3Acritical+props.woof%3A123'
      await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expectedUrl, expect.anything()))

      expect(await screen.findByTestId('data-card-action-link')).toBeInTheDocument()
      const expectedHref = '/orgs/my-org/security/metrics/secret-scanning?query=archived%3Afalse+provider%3Atest'
      expect(await screen.findByTestId('data-card-action-link')).toHaveAttribute('href', expectedHref)
    })
  })
})
