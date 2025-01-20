import {createContext, memo, useCallback, useMemo, useState} from 'react'

import {omit} from '../../../utils/omit'
import type {
  SuggestedAssignee,
  SuggestedIssueType,
  SuggestedLabel,
  SuggestedMilestone,
} from '../../api/memex-items/contracts'
import {ApiError} from '../../platform/api-error'

export type SuggestionsContextType = {
  /** Get the currently cached suggested assignees for a given item (will not trigger a fetch). */
  getSuggestedAssigneesForItem: (suggestionId: string) => Array<SuggestedAssignee> | Error | undefined

  /** Get the currently cached suggested labels for a given item (will not trigger a fetch). */
  getSuggestedLabelsForItem: (suggestionId: string) => Array<SuggestedLabel> | Error | undefined

  /** Get the currently cached suggested milestones for a given item (will not trigger a fetch). */
  getSuggestedMilestonesForItem: (suggestionId: string) => Array<SuggestedMilestone> | Error | undefined

  /** Get the currently cached suggested issue types for a given item (will not trigger a fetch). */
  getSuggestedIssueTypesForItem: (suggestionId: string) => Array<SuggestedIssueType> | Error | undefined

  /** Set the array of suggested assignees for a given item. */
  setSuggestedAssigneesForItem: (
    suggestionId: string,
    suggestions: Array<SuggestedAssignee> | Error | undefined,
  ) => void

  /** Set the array of suggested labels for a given item. */
  setSuggestedLabelsForItem: (suggestionId: string, suggestions: Array<SuggestedLabel> | Error | undefined) => void

  /** Set the array of suggested milestones for a given item. */
  setSuggestedMilestonesForItem: (
    suggestionId: string,
    suggestions: Array<SuggestedMilestone> | Error | undefined,
  ) => void

  /** Set the array of suggested issue types for a given item. */
  setSuggestedIssueTypesForItem: (
    suggestionId: string,
    suggestions: Array<SuggestedIssueType> | Error | undefined,
  ) => void

  /** Deletes all the cached suggestions for the given items. */
  removeSuggestions: (suggestionIds: Array<string>) => void
}

export type SuggestionsStableContextType = Pick<
  SuggestionsContextType,
  | 'setSuggestedAssigneesForItem'
  | 'setSuggestedLabelsForItem'
  | 'setSuggestedMilestonesForItem'
  | 'setSuggestedIssueTypesForItem'
  | 'removeSuggestions'
>

/**
 * This context manages state related suggested assignees, labels
 * and milestones, per item, fetched from the server. Because this particular
 * context contains the state object itself, whenever the state changes, components that
 * consume this context (either directly with a `useContext` or indirectly with a hook) that
 * consumes this context), will be re-rendered.
 *
 * If a component should not be re-rendered when the state changes, consider consuming the
 * `SuggestionsStableContext` instead.
 */
export const SuggestionsContext = createContext<SuggestionsContextType | null>(null)

/**
 * This context allows consumers remove cached suggested assignees, labels and milestones.
 * Because this particular context only contains a reference to the state, as well as a remove
 * function, the context value will be stable (i.e. the same object) for the lifetime of the
 * context. A component (or hook) which consumes this context will _not_ be re-rendered when
 * the state changes.
 *
 * If a component should be re-rendered when the state changes, consider consuming the
 * `ColumnsContext` instead.
 */
export const SuggestionsStableContext = createContext<SuggestionsStableContextType | null>(null)

type MaybeSuggestions<T> = Array<T> | Error | undefined
type SuggestionsState<T> = {[suggestionId: string]: MaybeSuggestions<T>}

export const SuggestionsStateProvider = memo(function SuggestionsStateProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [suggestedLabels, setSuggestedLabels] = useState<SuggestionsState<SuggestedLabel>>({})
  const [suggestedAssignees, setSuggestedAssignees] = useState<SuggestionsState<SuggestedAssignee>>({})
  const [suggestedMilestones, setSuggestedMilestones] = useState<SuggestionsState<SuggestedMilestone>>({})
  const [suggestedIssueTypes, setSuggestedIssueTypes] = useState<SuggestionsState<SuggestedIssueType>>({})

  const getSuggestedAssigneesForItem = useCallback(
    (suggestionId: string) => suggestedAssignees[suggestionId],
    [suggestedAssignees],
  )

  const getSuggestedLabelsForItem = useCallback(
    (suggestionId: string) => suggestedLabels[suggestionId],
    [suggestedLabels],
  )

  const getSuggestedMilestonesForItem = useCallback(
    (suggestionId: string) => suggestedMilestones[suggestionId],
    [suggestedMilestones],
  )

  const getSuggestedIssueTypesForItem = useCallback(
    (suggestionId: string) => suggestedIssueTypes[suggestionId],
    [suggestedIssueTypes],
  )

  const setSuggestedAssigneesForItem = useCallback(
    (suggestionId: string, suggestions: Array<SuggestedAssignee> | Error | undefined) => {
      setSuggestedAssignees(prevState => ({
        ...prevState,
        [suggestionId]: suggestions,
      }))
    },
    [setSuggestedAssignees],
  )

  const setSuggestedLabelsForItem = useCallback(
    (suggestionId: string, suggestions: Array<SuggestedLabel> | Error | undefined) => {
      setSuggestedLabels(prevState => ({
        ...prevState,
        [suggestionId]: suggestions,
      }))
    },
    [setSuggestedLabels],
  )

  const setSuggestedMilestonesForItem = useCallback(
    (suggestionId: string, suggestions: Array<SuggestedMilestone> | Error | undefined) => {
      setSuggestedMilestones(prevState => ({
        ...prevState,
        [suggestionId]: suggestions,
      }))
    },
    [setSuggestedMilestones],
  )

  const setSuggestedIssueTypesForItem = useCallback(
    (suggestionId: string, suggestions: Array<SuggestedIssueType> | Error | undefined) => {
      setSuggestedIssueTypes(prevState => ({
        ...prevState,
        [suggestionId]: suggestions,
      }))
    },
    [setSuggestedIssueTypes],
  )

  const removeSuggestions = useCallback((suggestionIds: Array<string>) => {
    setSuggestedAssignees(prevState => omit(prevState, suggestionIds))
    setSuggestedLabels(prevState => omit(prevState, suggestionIds))
    setSuggestedMilestones(prevState => omit(prevState, suggestionIds))
    setSuggestedIssueTypes(prevState => omit(prevState, suggestionIds))
  }, [])

  const contextValue: SuggestionsContextType = useMemo(() => {
    return {
      getSuggestedAssigneesForItem,
      getSuggestedLabelsForItem,
      getSuggestedMilestonesForItem,
      getSuggestedIssueTypesForItem,
      setSuggestedAssigneesForItem,
      setSuggestedLabelsForItem,
      setSuggestedMilestonesForItem,
      setSuggestedIssueTypesForItem,
      removeSuggestions,
    }
  }, [
    getSuggestedAssigneesForItem,
    getSuggestedLabelsForItem,
    getSuggestedMilestonesForItem,
    getSuggestedIssueTypesForItem,
    setSuggestedAssigneesForItem,
    setSuggestedLabelsForItem,
    setSuggestedMilestonesForItem,
    setSuggestedIssueTypesForItem,
    removeSuggestions,
  ])

  const stableContextValue: SuggestionsStableContextType = useMemo(
    () => ({
      setSuggestedAssigneesForItem,
      setSuggestedLabelsForItem,
      setSuggestedMilestonesForItem,
      setSuggestedIssueTypesForItem,
      removeSuggestions,
    }),
    [
      setSuggestedAssigneesForItem,
      setSuggestedLabelsForItem,
      setSuggestedMilestonesForItem,
      setSuggestedIssueTypesForItem,
      removeSuggestions,
    ],
  )

  return (
    <SuggestionsContext.Provider value={contextValue}>
      <SuggestionsStableContext.Provider value={stableContextValue}>{children}</SuggestionsStableContext.Provider>
    </SuggestionsContext.Provider>
  )
})

export async function makeApiCall<Type>(
  call: () => Promise<Type | undefined>,
): Promise<{response: Type | undefined; error: Error | undefined}> {
  let error: Error | undefined = undefined
  let response: Type | undefined

  try {
    response = await call()
  } catch (e) {
    if (e instanceof Error) {
      error = new Error(e.message)
      if (e instanceof ApiError) {
        if (e.code) {
          error.name = e.code
        }
      }
    }
  }

  return {response, error}
}
