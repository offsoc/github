import {useMemo} from 'react'
import type {Row} from 'react-table'

import type {Iteration} from '../../api/columns/contracts/iteration'
import {MemexColumnDataType, SystemColumnId} from '../../api/columns/contracts/memex-column'
import type {NumericValue} from '../../api/columns/contracts/number'
import type {SingleSelectValue} from '../../api/columns/contracts/single-select'
import type {DateValue, TitleValueWithContentType} from '../../api/columns/contracts/storage'
import type {EnrichedText} from '../../api/columns/contracts/text'
import type {Progress} from '../../api/columns/contracts/tracks'
import type {
  ExtendedRepository,
  IssueType,
  Label,
  LinkedPullRequest,
  Milestone,
  ParentIssue,
  SubIssuesProgress,
} from '../../api/common-contracts'
import {ItemType} from '../../api/memex-items/item-type'
import {
  buildGroupingConfiguration,
  type GroupingConfigurationByColumnDataType,
} from '../../features/grouping/grouping-metadata-configurations'
import {getInitialState} from '../../helpers/initial-state'
import {getAllIterations} from '../../helpers/iterations'
import {asCustomDateValue, asCustomNumberValue, asCustomTextValue, asSingleSelectValue} from '../../helpers/parsing'
import {useIsColumnLoaded} from '../../hooks/common/use-is-column-loaded'
import type {ColumnModel} from '../../models/column-model'
import {isIterationColumnModel} from '../../models/column-model/guards'
import {type ColumnValue, EmptyValue, LoadingValue, withValue} from '../../models/column-value'
import type {MemexItemModel} from '../../models/memex-item-model'
import {Resources} from '../../strings'
import {itemFromAssignee, itemFromReview, type UserGroupItem} from './cells/user-group'
import {
  AssigneesEditor,
  IssueTypeEditor,
  LabelsEditor,
  MilestoneEditor,
  NumberEditor,
  ParentIssueEditor,
  TextEditor,
  TitleEditor,
} from './editors'
import {DateEditor} from './editors/date-editor'
import {IterationEditor} from './editors/iteration-editor'
import {RepositoryEditor} from './editors/repository-editor'
import {SingleSelectEditor} from './editors/single-select-editor'
import {
  AssigneesRenderer,
  DateRenderer,
  IssueTypeRenderer,
  LabelsRenderer,
  LoadingAssigneesCell,
  LoadingDateCell,
  LoadingIssueTypeCell,
  LoadingLabelsCell,
  LoadingMilestoneCell,
  LoadingNumberCell,
  LoadingRepositoryCell,
  LoadingSingleSelectCell,
  LoadingTextCell,
  LoadingTitleCell,
  LoadingTracksCell,
  MilestoneRenderer,
  NumberRenderer,
  RepositoryRenderer,
  SingleSelectRenderer,
  TextRenderer,
  TitleRenderer,
  TracksRenderer,
} from './renderers'
import {IterationRenderer, LoadingIterationCell} from './renderers/iteration-renderer'
import {LinkedPullRequestsRenderer, LoadingLinkedPullRequestsCell} from './renderers/linked-pull-requests-renderer'
import {LoadingParentIssueCell, ParentIssueRenderer} from './renderers/parent-issue-renderer'
import {LoadingReviewersCell, ReviewersRenderer} from './renderers/reviewers-renderer'
import {LoadingSubIssuesProgressCell, SubIssuesProgressRenderer} from './renderers/sub-issues-progress-renderer'
import {LoadingTrackedByCell, TrackedByRenderer} from './renderers/tracked-by-renderer'
import type {ReactTableColumnBehavior} from './state-providers/table-columns/types'
import type {TableDataType} from './table-data-type'

type ReactTableColumnBehaviorLookup = {[P in MemexColumnDataType]: ReactTableColumnBehavior}

// groupingConfiguration values are assigned below
const reactTableColumnBehaviorWithoutGrouping: Omit<ReactTableColumnBehaviorLookup, 'groupingConfiguration'> = {
  title: {
    typeToEditEnabled: false,
    Placeholder: <LoadingTitleCell />,
    Cell(props) {
      const columnId = SystemColumnId.Title

      const columnData = props.row.original.columns[columnId]

      const isLoaded = useIsColumnLoaded(columnId)

      const currentValue = useMemo<ColumnValue<TitleValueWithContentType>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          return withValue(columnData)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return <TitleRenderer currentValue={currentValue} model={props.row.original} isDisabled={props.isDisabled} />
    },
    CellEditor(props) {
      const item = props.row.original
      const {replaceContents} = props

      const columnId = SystemColumnId.Title

      const columnData = props.row.original.columns[columnId]

      const isLoaded = useIsColumnLoaded(columnId)

      const currentValue = useMemo<ColumnValue<TitleValueWithContentType>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          return withValue(columnData)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return <TitleEditor model={item} replaceContents={replaceContents} currentValue={currentValue} />
    },
  },
  text: {
    Placeholder: <LoadingTextCell />,
    Cell(props) {
      const columnId = props.column.columnModel?.id || -1

      const columnData = props.row.original.columns[columnId]

      const isLoaded = useIsColumnLoaded(columnId)

      const currentValue = useMemo<ColumnValue<EnrichedText>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        const value = asCustomTextValue(columnData)

        if (value) {
          return withValue(value)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return <TextRenderer currentValue={currentValue} model={props.row.original} isDisabled={props.isDisabled} />
    },
    CellEditor(props) {
      const item = props.row.original

      if (!props.column.columnModel || !props.column.columnModel.userDefined) {
        throw Error(`${Resources.textEditor} ${Resources.requiresCustomColumn}`)
      }

      const {replaceContents} = props

      const columnId = props.column.columnModel.id

      const columnData = props.row.original.columns[columnId]

      const isLoaded = useIsColumnLoaded(columnId)

      const currentValue = useMemo<ColumnValue<EnrichedText>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        const value = asCustomTextValue(columnData)

        if (value) {
          return withValue(value)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return (
        <TextEditor
          currentValue={currentValue}
          model={item}
          replaceContents={replaceContents}
          columnId={columnId}
          rowId={props.row.id}
        />
      )
    },
  },
  number: {
    Placeholder: <LoadingNumberCell />,
    Cell(props) {
      const columnId = props.column.columnModel?.id || -1

      const columnData = props.row.original.columns[columnId]

      const isLoaded = useIsColumnLoaded(columnId)

      const currentValue = useMemo<ColumnValue<string>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        const value = asCustomNumberValue(columnData)

        if (value) {
          return withValue(value.value.toString())
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return <NumberRenderer currentValue={currentValue} model={props.row.original} isDisabled={props.isDisabled} />
    },
    CellEditor(props) {
      const item = props.row.original
      const {replaceContents} = props

      if (!props.column.columnModel || !props.column.columnModel.userDefined) {
        throw Error(`${Resources.numberEditor} ${Resources.requiresCustomColumn}`)
      }

      const columnId = props.column.columnModel.id

      const columnData = props.row.original.columns[columnId]

      const isLoaded = useIsColumnLoaded(columnId)

      const currentValue = useMemo<ColumnValue<NumericValue>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        const value = asCustomNumberValue(columnData)

        if (value) {
          return withValue(value)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return (
        <NumberEditor
          currentValue={currentValue}
          model={item}
          replaceContents={replaceContents}
          rowId={props.row.id}
          columnId={columnId}
        />
      )
    },
  },
  singleSelect: {
    Placeholder: <LoadingSingleSelectCell />,
    Cell(props) {
      const columnId = props.column.columnModel?.id || -1
      const columnData = props.row.original.columns[columnId]
      const isLoaded = useIsColumnLoaded(columnId)
      const currentValue = useMemo<ColumnValue<SingleSelectValue>>(() => {
        if (!isLoaded) return LoadingValue

        const value = asSingleSelectValue(columnData)
        if (value) return withValue(value)

        return EmptyValue
      }, [columnData, isLoaded])

      if (props.column.columnModel?.dataType !== MemexColumnDataType.SingleSelect) {
        throw new Error(Resources.singleSelectCustomModelError)
      }

      return (
        <SingleSelectRenderer
          currentValue={currentValue}
          model={props.row.original}
          options={props.column.columnModel.settings.options}
          columnId={props.column.id}
          dropdownRef={props.dropdownRef}
          isDisabled={props.isDisabled}
        />
      )
    },
    CellEditor(props) {
      const item = props.row.original
      const columnId = props.column.columnModel?.id || -1
      const columnData = props.row.original.columns[columnId]
      const isLoaded = useIsColumnLoaded(columnId)
      const currentValue = useMemo<ColumnValue<SingleSelectValue>>(() => {
        if (!isLoaded) return LoadingValue

        const value = asSingleSelectValue(columnData)
        if (value) return withValue(value)

        return EmptyValue
      }, [columnData, isLoaded])

      if (item.contentType === ItemType.RedactedItem) return null

      if (props.column.columnModel?.dataType !== MemexColumnDataType.SingleSelect) {
        throw Error(Resources.singleSelectCustomModelError)
      }

      return (
        <SingleSelectEditor
          currentValue={currentValue}
          model={item}
          rowIndex={props.row.index}
          columnModel={props.column.columnModel}
          columnId={props.column.id}
        />
      )
    },
  },
  date: {
    Placeholder: <LoadingDateCell />,
    Cell(props) {
      const columnId = props.column.columnModel?.id || -1

      const columnData = props.row.original.columns[columnId]

      const isLoaded = useIsColumnLoaded(columnId)

      const currentValue = useMemo<ColumnValue<DateValue>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        const value = asCustomDateValue(columnData)

        if (value) {
          return withValue(value)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return <DateRenderer currentValue={currentValue} model={props.row.original} isDisabled={props.isDisabled} />
    },
    CellEditor(props) {
      const item = props.row.original
      const {replaceContents} = props

      if (!props.column.columnModel || !props.column.columnModel.userDefined) {
        throw Error(`${Resources.dateEditor} ${Resources.requiresCustomColumn}`)
      }

      const columnId = props.column.columnModel.id

      const columnData = props.row.original.columns[columnId]

      const isLoaded = useIsColumnLoaded(columnId)

      const currentValue = useMemo<ColumnValue<DateValue>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        const value = asCustomDateValue(columnData)

        if (value) {
          return withValue(value)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return (
        <DateEditor
          currentValue={currentValue}
          model={item}
          replaceContents={replaceContents}
          rowIndex={props.row.index}
          columnId={props.column.columnModel.id}
        />
      )
    },
  },
  assignees: {
    Placeholder: <LoadingAssigneesCell />,
    Cell(props) {
      const columnId = SystemColumnId.Assignees

      const isLoaded = useIsColumnLoaded(columnId)

      const columnData = props.row.original.columns[columnId]

      const currentValue = useMemo<ColumnValue<Array<UserGroupItem>>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          return withValue(columnData.map(itemFromAssignee))
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return (
        <AssigneesRenderer
          currentValue={currentValue}
          model={props.row.original}
          dropdownRef={props.dropdownRef}
          isDisabled={props.isDisabled}
        />
      )
    },
    CellEditor(props) {
      const item = props.row.original

      const columnId = SystemColumnId.Assignees

      const isLoaded = useIsColumnLoaded(columnId)

      const columnData = props.row.original.columns[columnId]

      const currentValue = useMemo<ColumnValue<Array<UserGroupItem>>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          return withValue(columnData.map(itemFromAssignee))
        }

        return EmptyValue
      }, [columnData, isLoaded])

      if (item.contentType === ItemType.RedactedItem) {
        return null
      }

      return (
        <AssigneesEditor
          currentValue={currentValue}
          model={item}
          rowIndex={props.row.index}
          columnId={props.column.id}
        />
      )
    },
  },
  iteration: {
    Placeholder: <LoadingIterationCell />,
    Cell(props) {
      const columnId = props.column.columnModel?.id || -1

      const columnData = props.row.original.columns[columnId]

      const isLoaded = useIsColumnLoaded(columnId)

      const currentValue = useMemo<ColumnValue<Iteration>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        const value = asSingleSelectValue(columnData)

        if (!value) {
          return EmptyValue
        }

        const iterations = isIterationColumnModel(props.column.columnModel)
          ? getAllIterations(props.column.columnModel)
          : []
        const matchingOption = iterations.find(o => o.id === value.id)

        if (matchingOption) {
          return withValue(matchingOption)
        }

        return EmptyValue
      }, [columnData, isLoaded, props.column.columnModel])

      return (
        <IterationRenderer
          currentValue={currentValue}
          model={props.row.original}
          columnId={props.column.id}
          dropdownRef={props.dropdownRef}
          isDisabled={props.isDisabled}
        />
      )
    },
    CellEditor(props) {
      const item = props.row.original

      const columnId = props.column.columnModel?.id || -1

      const columnData = props.row.original.columns[columnId]

      const isLoaded = useIsColumnLoaded(columnId)

      const currentValue = useMemo<ColumnValue<Iteration>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        const value = asSingleSelectValue(columnData)

        if (!value) {
          return EmptyValue
        }

        const iterations = isIterationColumnModel(props.column.columnModel)
          ? getAllIterations(props.column.columnModel)
          : []
        const matchingOption = iterations.find(o => o.id === value.id)

        if (matchingOption) {
          return withValue(matchingOption)
        }

        return EmptyValue
      }, [columnData, isLoaded, props.column.columnModel])

      if (item.contentType === ItemType.RedactedItem) {
        return null
      }

      if (props.column.columnModel?.dataType !== MemexColumnDataType.Iteration) {
        throw Error(Resources.iterationCustomModelError)
      }

      return (
        <IterationEditor
          currentValue={currentValue}
          model={item}
          rowIndex={props.row.index}
          columnModel={props.column.columnModel}
          columnId={props.column.id}
        />
      )
    },
  },
  milestone: {
    Placeholder: <LoadingMilestoneCell />,
    Cell(props) {
      const columnId = SystemColumnId.Milestone

      const columnData = props.row.original.columns[columnId]

      const isLoaded = useIsColumnLoaded(columnId)

      const currentValue = useMemo<ColumnValue<Milestone>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          return withValue(columnData)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return (
        <MilestoneRenderer
          currentValue={currentValue}
          model={props.row.original}
          dropdownRef={props.dropdownRef}
          isDisabled={props.isDisabled}
        />
      )
    },
    CellEditor(props) {
      const item = props.row.original

      const columnId = SystemColumnId.Milestone

      const columnData = props.row.original.columns[columnId]

      const isLoaded = useIsColumnLoaded(columnId)

      const currentValue = useMemo<ColumnValue<Milestone>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          return withValue(columnData)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      if (item.contentType === ItemType.RedactedItem) {
        return null
      }

      return (
        <MilestoneEditor
          currentValue={currentValue}
          model={item}
          rowIndex={props.row.index}
          columnId={props.column.id}
        />
      )
    },
  },
  labels: {
    Placeholder: <LoadingLabelsCell />,
    Cell(props) {
      const columnId = SystemColumnId.Labels

      const isLoaded = useIsColumnLoaded(columnId)

      const columnData = props.row.original.columns[columnId]

      const currentValue = useMemo<ColumnValue<Array<Label>>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          return withValue(columnData)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return (
        <LabelsRenderer
          currentValue={currentValue}
          model={props.row.original}
          dropdownRef={props.dropdownRef}
          isDisabled={props.isDisabled}
        />
      )
    },
    CellEditor(props) {
      const item = props.row.original

      const columnId = SystemColumnId.Labels

      const isLoaded = useIsColumnLoaded(columnId)

      const columnData = props.row.original.columns[columnId]

      const currentValue = useMemo<ColumnValue<Array<Label>>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          return withValue(columnData)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      if (item.contentType === ItemType.RedactedItem) {
        return null
      }

      return (
        <LabelsEditor currentValue={currentValue} model={item} rowIndex={props.row.index} columnId={props.column.id} />
      )
    },
  },
  repository: {
    Placeholder: <LoadingRepositoryCell />,
    Cell(props) {
      const columnId = SystemColumnId.Repository

      const isLoaded = useIsColumnLoaded(columnId)

      const columnData = props.row.original.columns[columnId]

      const currentValue = useMemo<ColumnValue<ExtendedRepository>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          return withValue(columnData)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return (
        <RepositoryRenderer
          currentValue={currentValue}
          dropdownRef={props.dropdownRef}
          model={props.row.original}
          isDisabled={props.isDisabled}
        />
      )
    },
    CellEditor(props) {
      const item = props.row.original
      if (item.contentType === ItemType.DraftIssue) {
        return <RepositoryEditor model={item} rowIndex={props.row.index} columnId={props.column.id} />
      }
      return null
    },
  },
  linkedPullRequests: {
    Placeholder: <LoadingLinkedPullRequestsCell />,
    Cell(props) {
      const columnId = SystemColumnId.LinkedPullRequests

      const isLoaded = useIsColumnLoaded(columnId)

      const columnData = props.row.original.columns[columnId]

      const currentValue = useMemo<ColumnValue<Array<LinkedPullRequest>>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          return withValue(columnData)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return <LinkedPullRequestsRenderer model={props.row.original} currentValue={currentValue} />
    },
    CellEditor() {
      return null
    },
  },
  reviewers: {
    Placeholder: <LoadingReviewersCell />,
    Cell(props) {
      const columnId = SystemColumnId.Reviewers

      const isLoaded = useIsColumnLoaded(columnId)

      const columnData = props.row.original.columns[columnId]

      const currentValue = useMemo<ColumnValue<Array<UserGroupItem>>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          const users = columnData.map(itemFromReview)
          return withValue(users)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return <ReviewersRenderer model={props.row.original} currentValue={currentValue} />
    },
    CellEditor() {
      return null
    },
  },
  tracks: {
    Placeholder: <LoadingTracksCell />,
    Cell(props) {
      const columnId = SystemColumnId.Tracks

      const isLoaded = useIsColumnLoaded(columnId)

      const columnData = props.row.original.columns[columnId]

      const currentValue = useMemo<ColumnValue<Progress>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          return withValue(columnData)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return <TracksRenderer model={props.row.original} currentValue={currentValue} />
    },
    CellEditor() {
      return null
    },
  },
  trackedBy: {
    Placeholder: <LoadingTrackedByCell />,
    Cell(props) {
      const columnId = SystemColumnId.TrackedBy
      const isLoaded = useIsColumnLoaded(columnId)
      const columnData = props.row.original.columns[columnId]
      const {projectOwner} = getInitialState()

      const currentValue = useMemo(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          return withValue(columnData)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return <TrackedByRenderer model={props.row.original} currentValue={currentValue} projectOwner={projectOwner} />
    },
    CellEditor() {
      return null
    },
  },
  issueType: {
    Placeholder: <LoadingIssueTypeCell />,
    Cell(props) {
      const columnId = SystemColumnId.IssueType

      const isLoaded = useIsColumnLoaded(columnId)

      const columnData = props.row.original.columns[columnId]

      const currentValue = useMemo<ColumnValue<IssueType>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          return withValue(columnData)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return (
        <IssueTypeRenderer
          model={props.row.original}
          currentValue={currentValue}
          dropdownRef={props.dropdownRef}
          isDisabled={props.isDisabled}
        />
      )
    },
    CellEditor(props) {
      const item = props.row.original

      const columnId = SystemColumnId.IssueType

      const isLoaded = useIsColumnLoaded(columnId)

      const columnData = props.row.original.columns[columnId]

      const currentValue = useMemo<ColumnValue<IssueType>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          return withValue(columnData)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      if (item.contentType === ItemType.DraftIssue || item.contentType === ItemType.Issue) {
        return (
          <IssueTypeEditor
            currentValue={currentValue}
            model={item}
            rowIndex={props.row.index}
            columnId={props.column.id}
          />
        )
      }
      return null
    },
  },
  parentIssue: {
    Placeholder: <LoadingParentIssueCell />,
    Cell(props) {
      const columnId = SystemColumnId.ParentIssue

      const isLoaded = useIsColumnLoaded(columnId)

      const columnData = props.row.original.columns[columnId]

      const currentValue = useMemo<ColumnValue<ParentIssue>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          return withValue(columnData)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return (
        <ParentIssueRenderer
          model={props.row.original}
          currentValue={currentValue}
          dropdownRef={props.dropdownRef}
          isDisabled={props.isDisabled}
        />
      )
    },
    CellEditor(props) {
      const item = props.row.original

      const columnId = SystemColumnId.ParentIssue

      const isLoaded = useIsColumnLoaded(columnId)

      const columnData = props.row.original.columns[columnId]

      const currentValue = useMemo<ColumnValue<ParentIssue>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          return withValue(columnData)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      if (item.contentType !== ItemType.Issue) return null

      return (
        <ParentIssueEditor
          currentValue={currentValue}
          model={item}
          rowIndex={props.row.index}
          columnId={props.column.id}
        />
      )
    },
  },
  subIssuesProgress: {
    Placeholder: <LoadingSubIssuesProgressCell />,
    Cell(props) {
      const columnId = SystemColumnId.SubIssuesProgress

      const isLoaded = useIsColumnLoaded(columnId)

      const columnData = props.row.original.columns[columnId]

      const currentValue = useMemo<ColumnValue<SubIssuesProgress>>(() => {
        if (!isLoaded) {
          return LoadingValue
        }

        if (columnData) {
          return withValue(columnData)
        }

        return EmptyValue
      }, [columnData, isLoaded])

      return <SubIssuesProgressRenderer model={props.row.original} currentValue={currentValue} />
    },
    CellEditor() {
      return null
    },
  },
}

// The grouping configuration is shared between the roadmap and the table.
// This reduce call will iterate over that shared configuration, and assign
// the appropriate groupingConfiguration value for each column type to the
// reactTableColumnBehavior object.
const groupingMetadataConfigurations = buildGroupingConfiguration((row: Row<TableDataType>) => row.original.columns, {
  useDistinctAssigneesGrouping: false,
})

// Grouping config where each assignee is a distinct group, vs. groups of assignees.
const distinctGroupingMetadataConfigurations = buildGroupingConfiguration(
  (row: Row<TableDataType>) => row.original.columns,
  {useDistinctAssigneesGrouping: true},
)

function makeColumnBehaviorWithGrouping(config: GroupingConfigurationByColumnDataType<Row<MemexItemModel>>) {
  return (Object.keys(reactTableColumnBehaviorWithoutGrouping) as Array<keyof ReactTableColumnBehaviorLookup>).reduce(
    (columnBehaviorLookup, columnType) => {
      columnBehaviorLookup[columnType] = {
        ...columnBehaviorLookup[columnType],
        groupingConfiguration: config[columnType],
      }
      return columnBehaviorLookup
    },
    {...reactTableColumnBehaviorWithoutGrouping},
  )
}

const reactTableColumnBehavior = makeColumnBehaviorWithGrouping(groupingMetadataConfigurations)
const reactTableColumnBehaviorWithDistinctGrouping = makeColumnBehaviorWithGrouping(
  distinctGroupingMetadataConfigurations,
)

export function getColumnBehaviors(
  column: ColumnModel,
  {useDistinctAssigneesGrouping}: {useDistinctAssigneesGrouping: boolean},
) {
  return useDistinctAssigneesGrouping
    ? reactTableColumnBehaviorWithDistinctGrouping[column.dataType]
    : reactTableColumnBehavior[column.dataType]
}
