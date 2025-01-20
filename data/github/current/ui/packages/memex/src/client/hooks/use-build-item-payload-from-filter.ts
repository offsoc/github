import {useCallback} from 'react'

import {omit} from '../../utils/omit'
import type {UpdateColumnValueAction} from '../api/columns/contracts/domain'
import {MemexColumnDataType, SystemColumnId} from '../api/columns/contracts/memex-column'
import type {IAssignee, Label, Milestone} from '../api/common-contracts'
import type {SuggestedAssignee, SuggestedLabel, SuggestedMilestone} from '../api/memex-items/contracts'
import {filterMatches} from '../components/filter-bar/helpers/search-filter'
import type {DraftIssueModel, IssueModel, PullRequestModel} from '../models/memex-item-model'
import {useFetchSuggestedAssignees} from '../state-providers/suggestions/use-fetch-suggested-assignees'
import {useFetchSuggestedLabels} from '../state-providers/suggestions/use-fetch-suggested-labels'
import {useFetchSuggestedMilestones} from '../state-providers/suggestions/use-fetch-suggested-milestones'

/**
 * If a repo level field exists in a filter, we make sure that the user has permission to update this
 * field on the item that has just been created,
 *
 * If the user has permission to update the field, we search the list of suggested labels/assignees/milestones for
 * that repository for a label/milestone/assignee that matches the filter query for that field.
 *
 * If such a match is found, we make a call to update the recently created item with the correct repository level field
 * value
 * @param model - {@link MemexItemModel} the item model of the item that was just created
 * @param columnId - the id of the column for which to fetch suggestions
 * @param filterValue - the filter value for this field extracted from the search query
 */
export const useBuildItemPayloadFromFilter = () => {
  const {fetchSuggestedAssignees} = useFetchSuggestedAssignees()
  const {fetchSuggestedLabels} = useFetchSuggestedLabels()
  const {fetchSuggestedMilestones} = useFetchSuggestedMilestones()

  return useCallback(
    async (
      model: DraftIssueModel | IssueModel | PullRequestModel,
      columnId:
        | typeof SystemColumnId.Assignees
        | typeof SystemColumnId.Labels
        | typeof SystemColumnId.Milestone
        | typeof SystemColumnId.TrackedBy,
      filterValue: string,
    ): Promise<UpdateColumnValueAction | undefined> => {
      switch (columnId) {
        case SystemColumnId.Assignees: {
          const suggestions = await fetchSuggestedAssignees(model)
          const value = await getAssigneesColumnValueFromSuggestions(suggestions, filterValue)
          if (!value) return
          return {
            dataType: MemexColumnDataType.Assignees,
            value,
          }
        }
        case SystemColumnId.Labels: {
          const suggestions = await fetchSuggestedLabels(model)
          const value = await getLabelsColumnValueFromSuggestions(suggestions, filterValue)
          if (!value) return
          return {
            dataType: MemexColumnDataType.Labels,
            value,
          }
        }
        case SystemColumnId.Milestone: {
          const suggestions = await fetchSuggestedMilestones(model)
          const value = await getMilestoneColumnValueFromSuggestions(suggestions, filterValue)
          if (!value) return
          return {
            dataType: MemexColumnDataType.Milestone,
            value,
          }
        }
      }
    },
    [fetchSuggestedAssignees, fetchSuggestedLabels, fetchSuggestedMilestones],
  )
}

/**
 * Builds the Assignees column value, which the newly created item can be updated with
 *
 * It searches the `suggestedAssignees` to find a User
 * that matches the name of the label present in the search query. It includes this
 * label + all previously selected labels for this item in the result, so that a
 * new label, if any, is appended to the list of existing labels
 * @param suggestions - the list of suggested assignees for this repo returned by the suggestions request
 * @param filterValue - the filter value for the assignees field extracted from the filter query
 * @returns - the assignees to update the item with
 */
const getAssigneesColumnValueFromSuggestions = async (
  suggestions: Array<SuggestedAssignee> | Error | undefined,
  filterValue: string | undefined,
): Promise<Array<IAssignee> | null> => {
  if (suggestions instanceof Error) throw suggestions
  if (!suggestions) return null

  const suggestedAssignees = suggestions
  const assigneeValues = suggestedAssignees.filter(
    suggestedAssignee =>
      (filterValue && filterMatches([filterValue], suggestedAssignee.login)) || suggestedAssignee.selected,
  )

  return assigneeValues.map((assigneeValue: SuggestedAssignee) => omit(assigneeValue, ['selected']))
}

/**
 * Builds the Labels column value, which the newly created item can be updated with
 *
 * It searches the `suggestedLabels` to find a Label
 * that matches the name of the label present in the search query. It includes this
 * label + all previously selected labels for this item in the result, so that a
 * new label, if any, is appended to the list of existing labels
 * @param suggestions - the list of suggested labels for this repo returned by the suggestions request
 * @param filterValue - the filter value for the labels field extracted from the filter query
 * @returns - the labels to update the item with
 */
const getLabelsColumnValueFromSuggestions = async (
  suggestions: Array<SuggestedLabel> | Error | undefined,
  filterValue: string,
): Promise<Array<Label> | null> => {
  if (suggestions instanceof Error) throw suggestions
  if (!suggestions) return null

  const suggestedLabels = suggestions
  const labelValues = suggestedLabels.filter(
    suggestedLabel => (filterValue && filterMatches([filterValue], suggestedLabel.name)) || suggestedLabel.selected,
  )

  return labelValues.map((labelValue: SuggestedLabel) => omit(labelValue, ['selected']))
}

/**
 * Builds a milestone column value, which the newly created item can be updated with
 *
 * It searches the `suggestedMilestones` to find a Milestone
 * that matches the title of the milestone present in the search query
 * @param suggestedMilestones - the list of suggested milestones for this repo returned by the API call
 * @param filterValue - the filter value for the milestone field extracted from the search query
 * @returns the milestone to update the item with
 */
const getMilestoneColumnValueFromSuggestions = async (
  suggestions: Array<SuggestedMilestone> | Error | undefined,
  filterValue: string,
): Promise<Milestone | null> => {
  if (suggestions instanceof Error) throw suggestions
  if (!suggestions) return null

  const suggestedMilestones = suggestions
  const milestoneValue = suggestedMilestones.find(
    suggestedMilestone => filterValue && filterMatches([filterValue], suggestedMilestone.title),
  )

  if (!milestoneValue) return null
  return omit(milestoneValue, ['selected'])
}
