import {render} from '@testing-library/react'

import {Filter} from '../../Filter'
import {
  BaseFilterProvider,
  HeadFilterProvider,
  InBodyFilterProvider,
  InCommentsFilterProvider,
  InTitleFilterProvider,
  ShaFilterProvider,
} from '../../providers/key-only'
import {updateFilterValue} from '../../test-utils'
import {expectSuggestionsToBeEmpty, setupAsyncErrorHandler} from '../utils/helpers'

describe('KeyOnlyFilterProvider', () => {
  setupAsyncErrorHandler()

  it('should render and validate BaseFilterProvider', async () => {
    const filterProviders = [new BaseFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('base:')

    await expectSuggestionsToBeEmpty()
  })

  it('should render and validate HeadFilterProvider', async () => {
    const filterProviders = [new HeadFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('header:')

    await expectSuggestionsToBeEmpty()
  })

  it('should render and validate InBodyFilterProvider', async () => {
    const filterProviders = [new InBodyFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('in-body:')

    await expectSuggestionsToBeEmpty()
  })

  // InCommentsFilterProvider
  it('should render and validate InCommentsFilterProvider', async () => {
    const filterProviders = [new InCommentsFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('in-comments:')

    await expectSuggestionsToBeEmpty()
  })

  // InTitleFilterProvider
  it('should render and validate InTitleFilterProvider', async () => {
    const filterProviders = [new InTitleFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('in-title:')

    await expectSuggestionsToBeEmpty()
  })

  // ShaFilterProvider
  it('should render and validate ShaFilterProvider', async () => {
    const filterProviders = [new ShaFilterProvider()]
    render(<Filter id="test-filter-bar" label="Filter" providers={filterProviders} />)

    await updateFilterValue('sha:')

    await expectSuggestionsToBeEmpty()
  })
})
