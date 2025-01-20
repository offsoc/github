import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type {RepositoryItem, SuggestedRepository} from '../../client/api/repository/contracts'
import {OmnibarInput} from '../../client/components/omnibar/omnibar'
import type {RepoSearcherProps} from '../../client/components/react_table/repo-searcher'
import type {SuggestionsForRepositoryProps} from '../../client/components/suggestions-for-repository'
import {
  RepositoriesContext,
  type RepositoriesContextType,
} from '../../client/state-providers/repositories/repositories-state-provider'
import {createMockEnvironment} from '../create-mock-environment'

// Mock required hook to decouple OmnibarInput
// component from context providers
const mockUseAddMemexItemResponse = () => Promise.resolve()

jest.mock('../../client/hooks/use-add-memex-item', () => ({
  useAddMemexItem: () => mockUseAddMemexItemResponse,
}))

const stubbedRepositoriesContext: RepositoriesContextType = {
  clearCachedSuggestions: jest.fn(),
  suggestRepositories: jest.fn(),
  repositoriesCache: {current: {}},
}

const getWrapperWithStubbedRepositoryContext = (repositoriesContext = stubbedRepositoriesContext) => {
  createMockEnvironment()
  const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => (
    <RepositoriesContext.Provider value={repositoriesContext}>
      <div id="portal-root">
        <div id="__omnibarPortalRoot__" />
      </div>
      {children}
    </RepositoriesContext.Provider>
  )
  return wrapper
}

// Mock SuggestionsForRepository to isolate onItemSelected behavior
jest.mock('../../client/components/suggestions-for-repository', () => ({
  SuggestionsForRepository: (props: SuggestionsForRepositoryProps) => {
    const onClick = () => {
      void props.onItemSelected({} as RepositoryItem)
    }
    return <button onClick={onClick}>Select Item</button>
  },
}))

jest.mock('../../client/components/react_table/repo-searcher', () => ({
  RepoSearcher: (props: RepoSearcherProps) => {
    const onClick = () => {
      void props.onRepositorySelected({} as SuggestedRepository)
    }
    return <button onClick={onClick}>Select Repo</button>
  },
}))

describe('OmnibarInput', () => {
  it('calling wrappedOnItemSelected invalidates the suggested repository cache', async () => {
    const user = userEvent.setup()
    // Create a reference to clearCachedSuggestions to spy on
    const mockClearCachedSuggestions = jest.fn()
    const wrapper = getWrapperWithStubbedRepositoryContext({
      ...stubbedRepositoriesContext,
      clearCachedSuggestions: mockClearCachedSuggestions,
    })

    render(
      <OmnibarInput
        onAddItem={() => Promise.resolve(null)}
        onAddDraftItem={() => Promise.resolve(null)}
        defaultPlaceholder="placeholder"
        isFocused
      />,
      {wrapper},
    )

    await user.click(screen.getByText('Select Repo'))

    // Before selecting an item, clearCachedSuggestions has not been called
    expect(mockClearCachedSuggestions).toHaveBeenCalledTimes(0)
    // Select an item, firing wrappedOnItemSelected
    await user.click(screen.getByText('Select Item'))
    // After selecting an item, clearCachedSuggestions has been called
    expect(mockClearCachedSuggestions).toHaveBeenCalledTimes(1)
  })
})
