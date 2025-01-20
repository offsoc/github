import type {
  SuggestionsContextType,
  SuggestionsStableContextType,
} from '../../../client/state-providers/suggestions/suggestions-state-provider'

export function createSuggestionsStableContext(
  mocks?: Partial<SuggestionsStableContextType>,
): SuggestionsStableContextType {
  return {
    setSuggestedAssigneesForItem: jest.fn(),
    setSuggestedLabelsForItem: jest.fn(),
    setSuggestedMilestonesForItem: jest.fn(),
    setSuggestedIssueTypesForItem: jest.fn(),
    removeSuggestions: jest.fn(),
    ...mocks,
  }
}

export function createSuggestionsContext(mocks?: Partial<SuggestionsContextType>): SuggestionsContextType {
  return {
    getSuggestedAssigneesForItem: jest.fn(),
    getSuggestedLabelsForItem: jest.fn(),
    getSuggestedMilestonesForItem: jest.fn(),
    getSuggestedIssueTypesForItem: jest.fn(),
    setSuggestedAssigneesForItem: jest.fn(),
    setSuggestedLabelsForItem: jest.fn(),
    setSuggestedMilestonesForItem: jest.fn(),
    setSuggestedIssueTypesForItem: jest.fn(),
    removeSuggestions: jest.fn(),
    ...mocks,
  }
}
