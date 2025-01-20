import {screen} from '@testing-library/react'

import {JSON_HEADER} from '../../common/utils/fetch-json'
import {render} from '../../test-utils/Render'
import {AutofixSuggestionsCard} from '../components/AutofixSuggestionsCard'

describe('AutofixSuggestionsCard', () => {
  const query = 'archived: false'
  const startDate = '2022-01-01'
  const endDate = '2023-01-31'

  it('renders the component with the correct props', () => {
    render(<AutofixSuggestionsCard query={query} startDate={startDate} endDate={endDate} />)

    expect(screen.getByText('Copilot Autofix suggestions')).toBeInTheDocument()
  })

  it('fetches and displays the correct data', async () => {
    const mockData = {
      suggestionCount: 1337,
    }

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => mockData,
      ok: true,
      headers: new Headers(JSON_HEADER),
    } as Response)

    render(<AutofixSuggestionsCard query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByText('1,337')).toBeInTheDocument()
    expect(
      await screen.findByText('Total autofix suggestions by CodeQL in open and closed pull requests'),
    ).toBeInTheDocument()
  })

  it('displays a no data state on error', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => {},
      ok: false,
      headers: new Headers(JSON_HEADER),
    } as Response)

    render(<AutofixSuggestionsCard query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByText('Data could not be loaded right now')).toBeInTheDocument()
  })

  it('displays error state when html is returned from server instead of json', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      text: async () => '<DOCUMENT',
      ok: true,
      headers: new Headers({'Content-Type': 'text/html'}),
    } as Response)

    render(<AutofixSuggestionsCard query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByText('Data could not be loaded right now')).toBeInTheDocument()
  })
})
