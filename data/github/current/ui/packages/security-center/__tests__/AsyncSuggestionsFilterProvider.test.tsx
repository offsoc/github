import {BlockType, type FilterBlock, type FilterKey, FilterOperator} from '@github-ui/filter'
import {RepoIcon} from '@primer/octicons-react'

import AsyncSuggestionsFilterProvider from '../common/filter-providers/AsyncSuggestionsFilterProvider'

describe('fetchSuggestions', () => {
  it('queries using the correct endpoint', async () => {
    const endpoint = 'https://github.com/options?options-type=repo'
    const filterProvider = new AsyncSuggestionsFilterProvider(
      {
        displayName: 'Repository',
        key: 'repo',
        priority: 1,
        icon: RepoIcon,
        description: 'Find alerts for the selected repositories',
      } as FilterKey,
      endpoint,
    )

    const fetchDataSpy = jest.spyOn(filterProvider, 'fetchData')

    //Check that the fetchData method is called with the correct endpoint
    fetchDataSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response)

    const filterBlock: FilterBlock = {
      id: 1,
      type: BlockType.Filter,
      raw: 'repo',
      key: {value: 'repo'},
      provider: filterProvider,
      operator: FilterOperator.EqualTo,
      value: {
        raw: '',
        values: [{value: ''}],
      },
    }

    const expected = await filterProvider.fetchSuggestions('test', filterBlock)

    expect(fetchDataSpy).toHaveBeenCalledWith(`${endpoint}&limit=8&selected_values=&value=test`, expect.anything())
    expect(expected).toEqual([])
  })
})
