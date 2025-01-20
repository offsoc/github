import {testIdProps} from '@github-ui/test-id-props'
import {Box, Token} from '@primer/react'
import {Tooltip} from '@primer/react/drafts'
import {memo, type ReactNode, useCallback} from 'react'

import type {Iteration} from '../../../api/columns/contracts/iteration'
import {MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'
import type {PersistedOption} from '../../../api/columns/contracts/single-select'
import type {ColumnData} from '../../../api/columns/contracts/storage'
import type {Progress} from '../../../api/columns/contracts/tracks'
import type {
  ExtendedRepository,
  IssueType,
  Label as LabelInterface,
  Milestone,
  Owner,
  ParentIssue,
  SubIssuesProgress,
} from '../../../api/common-contracts'
import type {TrackedByItem} from '../../../api/issues-graph/contracts'
import {ItemType} from '../../../api/memex-items/item-type'
import {useClickToFilter} from '../../../features/filtering/hooks/use-click-to-filter'
import {getInitialState} from '../../../helpers/initial-state'
import {getAllIterations, intervalDatesDescription} from '../../../helpers/iterations'
import {
  asCustomDateString,
  formatISODateString,
  isDateColumnValue,
  isNumericColumnValue,
  isSingleSelectOrIterationColumnValue,
  isTextColumnValue,
  parseTextFromHtmlStr,
} from '../../../helpers/parsing'
import {fullDisplayName} from '../../../helpers/tracked-by-formatter'
import {useBoardSidePanel} from '../../../hooks/use-side-panel'
import type {ColumnModel} from '../../../models/column-model'
import {SubIssuesProgressColumnModel} from '../../../models/column-model/system/sub-issues-progress'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {useFindColumn} from '../../../state-providers/columns/use-find-column'
import {Resources} from '../../../strings'
import {SanitizedHtml} from '../../dom/sanitized-html'
import {IssueTypeToken} from '../../fields/issue-type-token'
import {IterationToken} from '../../fields/iteration/iteration-token'
import {LabelToken} from '../../fields/label-token'
import {LinkedPullRequestToken} from '../../fields/linked-pr-token'
import {MilestoneToken} from '../../fields/milestone-token'
import {ParentIssueToken} from '../../fields/parent-issue-token'
import {ProgressBar, ProgressBarVariants} from '../../fields/progress-bar'
import {RepositoryToken} from '../../fields/repository/repository-token'
import {ReviewersToken} from '../../fields/reviewers-token'
import {SingleSelectToken} from '../../fields/single-select/single-select-token'
import {TrackedByToken} from '../../fields/tracked-by-token'
import {TracksToken} from '../../fields/tracks/tracks-token'
import styles from './card-label.module.css'

type CardLabelProps = {
  field: ColumnModel
  columnData: ColumnData
  item: MemexItemModel
}

const TooltipLabel = ({label, children}: {label: string; children: ReactNode}) => (
  <li className={styles.cardLabel}>
    <Tooltip type="label" text={label} direction="n" className={styles.tooltip}>
      {children}
    </Tooltip>
  </li>
)

const CustomFieldLabel = ({
  content,
  fieldName,
  filterValue,
}: {
  content: string
  fieldName: string
  filterValue: string
}) => {
  return (
    <TooltipLabel label={`${fieldName}: ${parseTextFromHtmlStr(content.toString())}`}>
      <Token
        onClick={useClickToFilter(fieldName, filterValue)}
        as="button"
        text={<SanitizedHtml>{content}</SanitizedHtml>}
        {...testIdProps(`custom-label-${fieldName}`)}
      />
    </TooltipLabel>
  )
}

const MilestoneLabel = ({fieldName, milestone}: {fieldName: string; milestone: Milestone}) => {
  return (
    <TooltipLabel label={`${fieldName}: ${milestone.title}`}>
      <MilestoneToken milestone={milestone} onClick={useClickToFilter(fieldName, milestone.title)} as="button" />
    </TooltipLabel>
  )
}

const IterationLabel = ({fieldName, iteration}: {fieldName: string; iteration: Iteration}) => {
  return (
    <TooltipLabel label={`${fieldName}: ${iteration.title} (${intervalDatesDescription(iteration)})`}>
      <IterationToken iteration={iteration} onClick={useClickToFilter(fieldName, iteration.title)} as="button" />
    </TooltipLabel>
  )
}

const TracksLabel = ({progress, item}: {progress: Progress; item: MemexItemModel}) => {
  const {openPane} = useBoardSidePanel()

  const handleTracksClick = useCallback(() => {
    if (!item || item.contentType !== ItemType.Issue) return
    openPane(item)
  }, [item, openPane])

  if (progress.total === 0) return null

  return (
    <TooltipLabel
      label={`Progress: ${progress.completed} of ${progress.total} (${Resources.progressPercentCount(
        progress.percent,
      )})`}
    >
      <TracksToken
        as="button"
        constantWidth
        progress={progress}
        onClick={handleTracksClick}
        {...testIdProps('tracks-label')}
      />
    </TooltipLabel>
  )
}

const TrackedByLabel = ({
  trackedByItem,
  issueId,
  projectOwner,
}: {
  trackedByItem: TrackedByItem
  issueId: number
  projectOwner?: Owner
}) => {
  return (
    <li className={styles.cardLabel}>
      <TrackedByToken
        {...testIdProps(`tracked-by-label-${trackedByItem.key.itemId}`)}
        as="button"
        onClick={useClickToFilter('tracked-by', fullDisplayName(trackedByItem))}
        trackedBy={trackedByItem}
        issueId={issueId}
        projectOwner={projectOwner}
      />
    </li>
  )
}

const ParentIssueLabel = ({fieldName, parentIssue}: {fieldName: string; parentIssue: ParentIssue}) => {
  return (
    <li className={styles.cardLabel}>
      <ParentIssueToken
        as="button"
        parentIssue={parentIssue}
        onClick={useClickToFilter(fieldName, parentIssue.nwoReference)}
        aria-label={`${fieldName}: ${parentIssue.title} #${parentIssue.number}`}
        aria-describedby={undefined}
      />
    </li>
  )
}

const LabelLabel = ({fieldName, label}: {fieldName: string; label: LabelInterface}) => (
  <li className={styles.cardLabel}>
    <LabelToken
      label={label}
      as="button"
      onClick={useClickToFilter(fieldName, label.name)}
      aria-label={`Label: ${label.name}`}
      {...testIdProps('issue-label')}
    />
  </li>
)

function SingleSelectLabel({field, option}: {field: ColumnModel; option: PersistedOption}) {
  return (
    <TooltipLabel label={`${field.name}: ${option.name}`}>
      <SingleSelectToken option={option} onClick={useClickToFilter(field.name, option.name)} as="button" />
    </TooltipLabel>
  )
}

function IssueTypeLabel({fieldName, issueType}: {fieldName: string; issueType: IssueType}) {
  return (
    <TooltipLabel label={`${fieldName}: ${issueType.name}`}>
      <IssueTypeToken issueType={issueType} onClick={useClickToFilter(fieldName, issueType.name)} as="button" />
    </TooltipLabel>
  )
}

function RepositoryLabel({fieldName, repository}: {fieldName: string; repository: ExtendedRepository}) {
  return (
    <TooltipLabel label={`${fieldName}: ${repository.nameWithOwner}`}>
      <RepositoryToken
        withOwner
        repository={repository}
        onClick={useClickToFilter(fieldName, repository.nameWithOwner)}
        as="button"
        {...testIdProps('repository-label')}
      />
    </TooltipLabel>
  )
}

function SubIssuesProgressLabel({progress, parentIssue}: {progress: SubIssuesProgress; parentIssue: MemexItemModel}) {
  const itemIdentifier = parentIssue.getItemIdentifier()
  const filterValue = itemIdentifier ? `${itemIdentifier.owner}/${itemIdentifier.repo}#${itemIdentifier.number}` : ''
  const filterByParent = useClickToFilter('parent-issue', filterValue)
  const {findColumn} = useFindColumn()
  const column = findColumn(SystemColumnId.SubIssuesProgress)
  let progressConfiguration
  if (column instanceof SubIssuesProgressColumnModel) {
    progressConfiguration = column.settings.progressConfiguration
  }
  const progressStyle = {background: 'none', border: 'none', padding: 0}
  const bottomProgressStyle = {...progressStyle, marginTop: 2, width: '100%'}

  return (
    <Box
      as="button"
      sx={progressConfiguration?.variant === ProgressBarVariants.RING ? progressStyle : bottomProgressStyle}
      onClick={e => {
        if (!itemIdentifier) return
        filterByParent(e)
      }}
    >
      <ProgressBar
        completed={progress.completed}
        consistentContentSizing
        name="Sub-issues progress"
        percentCompleted={progress.percentCompleted}
        total={progress.total}
        variant={progressConfiguration?.variant ?? ProgressBarVariants.SOLID}
        color={progressConfiguration?.color}
      />
    </Box>
  )
}

const MAX_ITEM_LABEL_LENGTH = 10

export const CardLabel = memo(({field, columnData, item}: CardLabelProps) => {
  const {projectOwner} = getInitialState()

  let content: React.ReactNode = null

  switch (field.dataType) {
    case MemexColumnDataType.Labels:
      content = columnData[SystemColumnId.Labels]?.map(label => (
        <LabelLabel key={label.id} fieldName={field.name} label={label} />
      ))
      break

    case MemexColumnDataType.LinkedPullRequests:
      content = columnData[SystemColumnId.LinkedPullRequests]
        ?.slice(0, MAX_ITEM_LABEL_LENGTH)
        .map(linkedPullRequest => (
          <li
            className={styles.cardLabel}
            aria-label={`Linked pull request: #${linkedPullRequest.number}`}
            key={linkedPullRequest.id}
          >
            <LinkedPullRequestToken linkedPullRequest={linkedPullRequest} />
          </li>
        ))
      break

    case MemexColumnDataType.Reviewers: {
      const reviews = columnData[SystemColumnId.Reviewers]
      content = reviews && reviews.length > 0 && (
        <li className={styles.cardLabel}>
          <ReviewersToken reviews={reviews} sx={{bg: 'canvas.default'}} />
        </li>
      )
      break
    }

    case MemexColumnDataType.Milestone: {
      const milestone = columnData[SystemColumnId.Milestone]
      content = milestone && <MilestoneLabel milestone={milestone} fieldName={field.name} />
      break
    }

    case MemexColumnDataType.Iteration: {
      const iterationValue = columnData[field.id]

      const iteration =
        iterationValue && isSingleSelectOrIterationColumnValue(iterationValue)
          ? getAllIterations(field).find(o => o.id === iterationValue.id)
          : undefined

      content = iteration && <IterationLabel iteration={iteration} fieldName={field.name} />
      break
    }

    case MemexColumnDataType.Tracks: {
      const progress = columnData[SystemColumnId.Tracks]
      content = progress && <TracksLabel progress={progress} item={item} />
      break
    }

    case MemexColumnDataType.ParentIssue: {
      const parentIssue = columnData[SystemColumnId.ParentIssue]
      content = parentIssue && <ParentIssueLabel fieldName={field.name} parentIssue={parentIssue} />
      break
    }

    case MemexColumnDataType.TrackedBy:
      content = columnData[SystemColumnId.TrackedBy]
        ?.slice(0, MAX_ITEM_LABEL_LENGTH)
        .map(trackedByItem => (
          <TrackedByLabel
            key={trackedByItem.key.itemId}
            issueId={item.itemId()}
            trackedByItem={trackedByItem}
            projectOwner={projectOwner}
          />
        ))
      break

    case MemexColumnDataType.SingleSelect: {
      const optionValue = columnData[field.id]

      const option =
        optionValue && isSingleSelectOrIterationColumnValue(optionValue)
          ? field.settings.options?.find(o => o.id === optionValue.id)
          : undefined

      content = option && <SingleSelectLabel option={option} field={field} />
      break
    }

    case MemexColumnDataType.Date: {
      const dateValue = columnData[field.id]

      if (dateValue && isDateColumnValue(dateValue)) {
        const dateStr = asCustomDateString(dateValue)
        const filterValue = formatISODateString(new Date(dateValue.value))

        content = dateStr && <CustomFieldLabel content={dateStr} fieldName={field.name} filterValue={filterValue} />
      }
      break
    }

    case MemexColumnDataType.Number: {
      const numberValue = columnData[field.id]

      content = numberValue && isNumericColumnValue(numberValue) && (
        <CustomFieldLabel
          content={numberValue.value.toString()}
          fieldName={field.name}
          filterValue={numberValue.value.toString()}
        />
      )
      break
    }

    case MemexColumnDataType.Text: {
      const textValue = columnData[field.id]

      content = textValue && isTextColumnValue(textValue) && (
        <CustomFieldLabel content={textValue.raw} fieldName={field.name} filterValue={textValue.raw} />
      )
      break
    }

    case MemexColumnDataType.Repository: {
      const repository = columnData[SystemColumnId.Repository]

      content = repository && <RepositoryLabel fieldName={field.name} repository={repository} />
      break
    }

    case MemexColumnDataType.IssueType: {
      const issueType = columnData[SystemColumnId.IssueType]

      content = issueType && <IssueTypeLabel fieldName={field.name} issueType={issueType} />
      break
    }

    case MemexColumnDataType.SubIssuesProgress: {
      const progress = columnData[SystemColumnId.SubIssuesProgress]

      content = progress && progress.total > 0 && <SubIssuesProgressLabel progress={progress} parentIssue={item} />
      break
    }

    case MemexColumnDataType.Assignees:
    case MemexColumnDataType.Title:
      break

    default:
      // Ensure that we account for every possible field type as new ones are added
      ensureUnreachable(field)
  }

  return <>{content}</>
})
CardLabel.displayName = 'CardLabel'

function ensureUnreachable(_: never) {
  /*noop*/
}
