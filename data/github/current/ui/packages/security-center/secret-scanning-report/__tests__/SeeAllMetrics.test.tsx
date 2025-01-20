import {act, screen} from '@testing-library/react'

import {JSON_HEADER} from '../../common/utils/fetch-json'
import {render} from '../../test-utils/Render'
import {type CountsPage, SeeAllMetricsButton} from '../components/SeeAllMetrics'
import {AggregateCountType} from '../types/push-protection-metrics'

describe('SeeAllMetricsButton', () => {
  const payload: CountsPage = {
    counts: [{type: AggregateCountType.Repository, name: 'MyRepo', count: 1}],
  }

  it('shows and hides dialog on click', () => {
    renderComponent({openDialog: false})
    expect(screen.getByText('See all metrics')).toBeInTheDocument()
    expect(screen.queryByText('Dialog Header')).not.toBeInTheDocument()

    act(() => screen.getByText('See all metrics')?.click())
    expect(screen.getByText('Dialog Header')).toBeInTheDocument()

    act(() => screen.getByLabelText('Close')?.click())
    expect(screen.queryByText('Dialog Header')).not.toBeInTheDocument()
  })

  it('only fetches and renders data when dialog is open', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({payload}),
      ok: true,
      headers: new Headers(JSON_HEADER),
    } as Response)

    renderComponent({openDialog: false})
    expect(fetch).not.toHaveBeenCalled()

    act(() => screen.getByText('See all metrics')?.click())

    act(() => expect(fetch).toHaveBeenCalled())
    expect(await screen.findByText('MyRepo')).toBeInTheDocument()
  })

  it('renders error if fetch request fails', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({error: 'something'}),
      ok: false,
      headers: new Headers(JSON_HEADER),
    } as Response)

    renderComponent({openDialog: true})

    expect(await screen.findByTestId('page-push-protection-metrics-request-error-blankslate')).toBeInTheDocument()
    expect(await screen.findByText('Secret scanning data could not be loaded right now')).toBeInTheDocument()
  })

  it('renders error if fetch returns no data', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => null,
      ok: true,
      headers: new Headers(JSON_HEADER),
    } as Response)

    renderComponent({openDialog: true})

    expect(await screen.findByTestId('page-push-protection-metrics-request-error-blankslate')).toBeInTheDocument()
    expect(await screen.findByText('Secret scanning data could not be loaded right now')).toBeInTheDocument()
  })

  it('renders error if fetch returns no payload', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({payload: null}),
      ok: true,
      headers: new Headers(JSON_HEADER),
    } as Response)

    renderComponent({openDialog: true})

    expect(await screen.findByTestId('page-push-protection-metrics-request-error-blankslate')).toBeInTheDocument()
    expect(await screen.findByText('Secret scanning data could not be loaded right now')).toBeInTheDocument()
  })
})

function renderComponent({openDialog}: {openDialog: boolean}): void {
  render(<SeeAllMetricsButton label="See all metrics" header="Dialog Header" href="/test" />)

  if (openDialog) {
    act(() => screen.getByText('See all metrics')?.click())
  }
}
