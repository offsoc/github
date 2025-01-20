import {render, screen} from '@testing-library/react'

import {MemexColumnDataType} from '../../../client/api/columns/contracts/memex-column'
import {type ExtendedRepository, MilestoneState, type ParentIssue} from '../../../client/api/common-contracts'
import type {TrackedByItem} from '../../../client/api/issues-graph/contracts'
import type {SuggestedIssueType, SuggestedMilestone} from '../../../client/api/memex-items/contracts'
import type {RegroupValidationAlertResult} from '../../../client/features/grouping/get-group-update-validation'
import {
  getUpdateGroupValidation,
  RegroupValidationStatus,
} from '../../../client/features/grouping/get-group-update-validation'
import {createUpdateForGroup} from '../../../client/features/grouping/helpers'
import type {
  IssueTypeGrouping,
  MilestoneGrouping,
  ParentIssueGrouping,
  RepositoryGrouping,
  TrackedByGrouping,
} from '../../../client/features/grouping/types'
import {createMemexItemModel} from '../../../client/models/memex-item-model'
import {ApiError} from '../../../client/platform/api-error'
import {ItemUpdateValidationResources} from '../../../client/strings'
import {columnValueFactory} from '../../factories/column-values/column-value-factory'
import {draftIssueFactory} from '../../factories/memex-items/draft-issue-factory'
import {issueFactory} from '../../factories/memex-items/issue-factory'
import {pullRequestFactory} from '../../factories/memex-items/pull-request-factory'
import {
  stubGetSuggestedIssueTypes,
  stubGetSuggestedIssueTypesWithError,
  stubGetSuggestedMilestones,
} from '../../mocks/api/memex-items'

describe('getUpdateGroupValidation', () => {
  const originalRepo = {
    name: 'github',
    nameWithOwner: 'github/github',
    id: 1112,
    url: 'https://github.com/github/github',
    isForked: false,
    isPublic: false,
    isArchived: false,
    hasIssues: true,
  } as ExtendedRepository

  const updateRepo = {
    name: 'memex',
    nameWithOwner: 'github/memex',
    id: 1111,
    url: 'https://github.com/github/memex',
    isForked: false,
    isPublic: false,
    isArchived: false,
    hasIssues: true,
  } as ExtendedRepository

  describe('repositories', () => {
    const updateMeta = {
      dataType: MemexColumnDataType.Repository,
      kind: 'group',
      value: updateRepo,
    } as RepositoryGrouping

    const originalMeta = {
      dataType: MemexColumnDataType.Repository,
      kind: 'group',
      value: originalRepo,
    } as RepositoryGrouping

    it('does not allow transfering issues between repos with different owners', async () => {
      const repo = columnValueFactory.repository(originalRepo).build()
      const item = createMemexItemModel(issueFactory.withColumnValues([repo]).build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = await getUpdateGroupValidation(item, updateColumnAction)

      expect(result.status).toEqual(RegroupValidationStatus.Failure)
    })

    it('does not allow transfering pull requests', async () => {
      const repo = columnValueFactory.repository(originalRepo).build()
      const item = createMemexItemModel(pullRequestFactory.withColumnValues([repo]).build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = await getUpdateGroupValidation(item, updateColumnAction)

      expect(result.status).toEqual(RegroupValidationStatus.Failure)
    })

    it('does not allow transfering draft issues', async () => {
      const item = createMemexItemModel(draftIssueFactory.build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = await getUpdateGroupValidation(item, updateColumnAction)

      expect(result.status).toEqual(RegroupValidationStatus.Failure)
    })
  })

  describe('milestones', () => {
    const originalMilestone = {
      title: 'Milestone 1',
      id: 1,
      state: MilestoneState.Open,
      url: '',
      repoNameWithOwner: 'github/memex',
    }

    const updateMilestone = {
      title: 'Milestone 2',
      id: 2,
      state: MilestoneState.Open,
      url: '',
      repoNameWithOwner: 'github/memex',
    }

    const originalMeta = {
      dataType: MemexColumnDataType.Milestone,
      kind: 'group',
      value: originalMilestone,
    } as MilestoneGrouping

    const updateMeta = {
      dataType: MemexColumnDataType.Milestone,
      kind: 'group',
      value: updateMilestone,
    } as MilestoneGrouping

    it('does not allow transferring draft issues', async () => {
      const item = createMemexItemModel(draftIssueFactory.build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = await getUpdateGroupValidation(item, updateColumnAction)

      expect(result.status).toEqual(RegroupValidationStatus.Failure)
    })

    it('allows moving items within the same milestone', async () => {
      const milestone = columnValueFactory.milestone(originalMilestone).build()
      const item = createMemexItemModel(pullRequestFactory.withColumnValues([milestone]).build())

      const updateColumnAction = createUpdateForGroup(originalMeta, item.columns, {}, originalMeta)
      const result = await getUpdateGroupValidation(item, updateColumnAction)

      expect(result.status).toEqual(RegroupValidationStatus.Success)
    })

    it('does not allow moving items between milestones if not suggested', async () => {
      stubGetSuggestedMilestones([originalMilestone] as Array<SuggestedMilestone>)
      const milestone = columnValueFactory.milestone(originalMilestone).build()
      const repo = columnValueFactory.repository(originalRepo).build()
      const item = createMemexItemModel(pullRequestFactory.withColumnValues([milestone, repo]).build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = await getUpdateGroupValidation(item, updateColumnAction)

      expect(result.status).toEqual(RegroupValidationStatus.Failure)
    })

    it('allows moving items between suggested milestones', async () => {
      stubGetSuggestedMilestones([originalMilestone, updateMilestone] as Array<SuggestedMilestone>)
      const milestone = columnValueFactory.milestone(originalMilestone).build()
      const item = createMemexItemModel(pullRequestFactory.withColumnValues([milestone]).build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = await getUpdateGroupValidation(item, updateColumnAction)

      expect(result.status).toEqual(RegroupValidationStatus.Success)
      expect(result.updateColumnActionOverride).toEqual({
        dataType: MemexColumnDataType.Milestone,
        value: updateMilestone,
      })
    })
  })

  describe('issue types', () => {
    const originalIssueType = {
      name: 'Bug',
      id: 1,
      description: '',
    }

    const updateIssueType = {
      name: 'Enhancement',
      id: 2,
      description: '',
    }

    const originalMeta = {
      dataType: MemexColumnDataType.IssueType,
      kind: 'group',
      value: originalIssueType,
    } as IssueTypeGrouping

    const updateMeta = {
      dataType: MemexColumnDataType.IssueType,
      kind: 'group',
      value: updateIssueType,
    } as IssueTypeGrouping

    it('does not allow assigning issue type to drafts', async () => {
      const item = createMemexItemModel(draftIssueFactory.build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = (await getUpdateGroupValidation(item, updateColumnAction)) as RegroupValidationAlertResult

      expect(result.status).toEqual(RegroupValidationStatus.Failure)
      expect(result.alertOptions.content).toEqual(
        ItemUpdateValidationResources.IssueType.Alerts.NeedsConversion.content,
      )
    })

    it('does not allow assigning issue type to pull requests', async () => {
      const item = createMemexItemModel(pullRequestFactory.build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = (await getUpdateGroupValidation(item, updateColumnAction)) as RegroupValidationAlertResult

      expect(result.status).toEqual(RegroupValidationStatus.Failure)
      expect(result.alertOptions.content).toEqual(
        ItemUpdateValidationResources.IssueType.Alerts.CannotAssignPulls.content,
      )
    })

    it('allows moving items within the same issue type', async () => {
      const issueType = columnValueFactory.issueType(originalIssueType).build()
      const item = createMemexItemModel(issueFactory.withColumnValues([issueType]).build())

      const updateColumnAction = createUpdateForGroup(originalMeta, item.columns, {}, originalMeta)
      const result = await getUpdateGroupValidation(item, updateColumnAction)

      expect(result.status).toEqual(RegroupValidationStatus.Success)
    })

    it('does not allow moving items between issue types if suggested issue types are empty', async () => {
      stubGetSuggestedIssueTypes([])
      const issueType = columnValueFactory.issueType(originalIssueType).build()
      const repo = columnValueFactory.repository(originalRepo).build()
      const item = createMemexItemModel(issueFactory.withColumnValues([issueType, repo]).build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = (await getUpdateGroupValidation(item, updateColumnAction)) as RegroupValidationAlertResult

      expect(result.status).toEqual(RegroupValidationStatus.Failure)
      expect(result.alertOptions.content).toEqual(ItemUpdateValidationResources.IssueType.Alerts.NoTypesForRepo.content)
    })

    it('does not allow moving items between issue types if suggestions returns an error', async () => {
      const errorMessage = 'Repo is user-owned'

      stubGetSuggestedIssueTypesWithError(new ApiError(errorMessage))
      const issueType = columnValueFactory.issueType(originalIssueType).build()
      const repo = columnValueFactory.repository(originalRepo).build()
      const item = createMemexItemModel(issueFactory.withColumnValues([issueType, repo]).build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = (await getUpdateGroupValidation(item, updateColumnAction)) as RegroupValidationAlertResult

      expect(result.status).toEqual(RegroupValidationStatus.Failure)
      expect(result.alertOptions.content).toEqual(errorMessage)
    })

    it('does not allow moving items between issue types if suggested issue type is not available', async () => {
      stubGetSuggestedIssueTypes([originalIssueType] as Array<SuggestedIssueType>)
      const issueType = columnValueFactory.issueType(originalIssueType).build()
      const repo = columnValueFactory.repository(originalRepo).build()
      const item = createMemexItemModel(issueFactory.withColumnValues([issueType, repo]).build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = (await getUpdateGroupValidation(item, updateColumnAction)) as RegroupValidationAlertResult

      expect(result.status).toEqual(RegroupValidationStatus.Failure)
      render(result.alertOptions.content as React.ReactElement)
      expect(screen.getByText('Enhancement')).toBeInTheDocument()

      const link = screen.getByRole('link', {name: 'github'})
      expect(link).toHaveAttribute('href', 'https://github.com/github')
    })

    it('allows moving items between suggested issue types', async () => {
      stubGetSuggestedIssueTypes([originalIssueType, updateIssueType] as Array<SuggestedIssueType>)
      const issueType = columnValueFactory.issueType(originalIssueType).build()
      const item = createMemexItemModel(issueFactory.withColumnValues([issueType]).build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = await getUpdateGroupValidation(item, updateColumnAction)

      expect(result.status).toEqual(RegroupValidationStatus.Success)
      expect(result.updateColumnActionOverride).toEqual({
        dataType: MemexColumnDataType.IssueType,
        value: updateIssueType,
      })
    })
  })

  describe('tracked by', () => {
    const originalTrackedBy = {
      title: 'Tracked By 1',
      key: {
        itemId: 1,
      },
    } as TrackedByItem

    const updateTrackedBy = {
      title: 'Tracked By 2',
      key: {
        itemId: 2,
      },
    } as TrackedByItem

    const originalMeta = {
      dataType: MemexColumnDataType.TrackedBy,
      kind: 'group',
      value: originalTrackedBy,
    } as TrackedByGrouping

    const updateMeta = {
      dataType: MemexColumnDataType.TrackedBy,
      kind: 'group',
      value: updateTrackedBy,
    } as TrackedByGrouping

    it('does not allow transferring draft issues', async () => {
      const item = createMemexItemModel(draftIssueFactory.build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = await getUpdateGroupValidation(item, updateColumnAction)

      expect(result.status).toEqual(RegroupValidationStatus.Failure)
    })

    it('does not allow transferring pull requests', async () => {
      const item = createMemexItemModel(pullRequestFactory.build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = await getUpdateGroupValidation(item, updateColumnAction)

      expect(result.status).toEqual(RegroupValidationStatus.Failure)
    })

    it('requires confirmation when removing if item is tracked by 2 parent issues', async () => {
      const trackedBy = columnValueFactory.trackedBy([originalTrackedBy, updateTrackedBy]).build()
      const item = createMemexItemModel(issueFactory.withColumnValues([trackedBy]).build())

      const emptyMeta = {
        dataType: MemexColumnDataType.TrackedBy,
        kind: 'empty',
        value: {
          titleHtml: 'No Tracked By',
        },
      } as TrackedByGrouping

      const updateColumnAction = createUpdateForGroup(emptyMeta, item.columns, {}, originalMeta)
      const result = await getUpdateGroupValidation(item, updateColumnAction)

      expect(result.status).toEqual(RegroupValidationStatus.Pending)
    })

    it('allows conversion between groups for items', async () => {
      const trackedBy = columnValueFactory.trackedBy([originalTrackedBy]).build()
      const item = createMemexItemModel(issueFactory.withColumnValues([trackedBy]).build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = await getUpdateGroupValidation(item, updateColumnAction)

      expect(result.status).toEqual(RegroupValidationStatus.Success)
    })
  })

  describe('Parent issue', () => {
    const originalParentIssue = {
      title: 'Parent One',
      id: 1,
      nwoReference: 'github/github#123',
    } as ParentIssue

    const updateParentIssue = {
      title: 'Parent Two',
      id: 2,
      nwoReference: 'github/github#456',
    } as ParentIssue

    const originalMeta = {
      dataType: MemexColumnDataType.ParentIssue,
      kind: 'group',
      value: originalParentIssue,
    } as ParentIssueGrouping

    const updateMeta = {
      dataType: MemexColumnDataType.ParentIssue,
      kind: 'group',
      value: updateParentIssue,
    } as ParentIssueGrouping

    it('does not allow transferring draft issues', async () => {
      const item = createMemexItemModel(draftIssueFactory.build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = await getUpdateGroupValidation(item, updateColumnAction)

      expect(result.status).toEqual(RegroupValidationStatus.Failure)
    })

    it('does not allow transferring pull requests', async () => {
      const item = createMemexItemModel(pullRequestFactory.build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = await getUpdateGroupValidation(item, updateColumnAction)

      expect(result.status).toEqual(RegroupValidationStatus.Failure)
    })

    it('allows conversion between groups for items', async () => {
      const parentIssue = columnValueFactory.parentIssue(originalParentIssue).build()
      const item = createMemexItemModel(issueFactory.withColumnValues([parentIssue]).build())

      const updateColumnAction = createUpdateForGroup(updateMeta, item.columns, {}, originalMeta)
      const result = await getUpdateGroupValidation(item, updateColumnAction)

      expect(result.status).toEqual(RegroupValidationStatus.Success)
    })
  })
})
