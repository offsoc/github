import type {IssuePickerItem} from '@github-ui/item-picker/IssuePicker'
import {RepositoryAndIssuePicker} from '@github-ui/sub-issues/RepositoryAndIssuePicker'
import {memo, useCallback, useEffect, useState} from 'react'

import type {IssueStateReason as ParentIssueStateReason, ParentIssue} from '../../../api/common-contracts'
import {useParentIssueEditor} from '../../../hooks/editors/use-parent-issue-editor'
import {type ColumnValue, hasValue} from '../../../models/column-value'
import type {IssueModel} from '../../../models/memex-item-model'
import {FocusType} from '../../../navigation/types'
import {CELL_HEIGHT} from '../constants'
import {moveTableFocus, useStableTableNavigation} from '../navigation'
import {useRecordCellEditor} from '../performance-measurements'
import {ParentIssueRenderer} from '../renderers'
import type {TSelectPanelEditorProps} from './select-panel-editor'

type AdditionalProps = {
  currentValue: ColumnValue<ParentIssue>
  model: IssueModel
}

export const convertGraphIssueToMemexIssue = (issue: IssuePickerItem): ParentIssue | undefined => {
  const {databaseId: id, state, stateReason, title, number, id: globalRelayId} = issue

  if (!id) return

  // only id, title, number, state, and stateReason are needed for the optimistic update so the rest of the fields can have default values
  return {
    id,
    globalRelayId,
    number,
    state: state === 'CLOSED' ? 'closed' : 'open',
    stateReason:
      typeof stateReason === 'string' && ['COMPLETED', 'NOT_PLANNED', 'REOPENED'].includes(stateReason)
        ? (stateReason.toLocaleLowerCase() as ParentIssueStateReason)
        : undefined,
    title,
    url: '',
    repository: '',
    owner: '',
    nwoReference: '',
    subIssueList: {total: 0, completed: 0, percentCompleted: 0},
  }
}

const ParentIssueEditorFunc: React.FC<TSelectPanelEditorProps & AdditionalProps> = ({currentValue, model}) => {
  useRecordCellEditor('ParentIssueEditor', model.id)
  const {navigationDispatch} = useStableTableNavigation()

  const {saveSelected} = useParentIssueEditor({model})

  const [pickerType, setPickerType] = useState<'Issue' | 'Repository' | null>('Issue')

  useEffect(() => {
    navigationDispatch(moveTableFocus({focusType: FocusType.Suspended}))
  }, [model.contentType, navigationDispatch])

  const onIssueSelection = useCallback(
    async (selectedIssues: Array<IssuePickerItem>) => {
      if (!selectedIssues[0]) {
        await saveSelected(undefined)
      } else {
        const parentIssue = convertGraphIssueToMemexIssue(selectedIssues[0])
        await saveSelected(parentIssue)
      }
    },
    [saveSelected],
  )

  const onPickerTypeChange = useCallback(
    (t: 'Issue' | 'Repository' | null) => {
      setPickerType(t)
      if (!t) {
        navigationDispatch(moveTableFocus({focusType: FocusType.Focus}))
      }
    },
    [setPickerType, navigationDispatch],
  )

  const renderButton = useCallback(() => {
    return <ParentIssueRenderer currentValue={currentValue} model={model} />
  }, [currentValue, model])

  const repoInfo = model.getExtendedRepository()

  if (!repoInfo) return null

  const {nameWithOwner} = repoInfo
  const orgName = nameWithOwner.split('/')[0] || ''

  const selectedParentId = hasValue(currentValue) ? [currentValue.value.globalRelayId] : []
  const hiddenIssueIds = model.content.globalRelayId ? [model.content.globalRelayId] : []

  return (
    <RepositoryAndIssuePicker
      onPickerTypeChange={onPickerTypeChange}
      onIssueSelection={onIssueSelection}
      selectedIssueIds={selectedParentId}
      hiddenIssueIds={hiddenIssueIds}
      defaultRepositoryNameWithOwner={nameWithOwner}
      organization={orgName}
      pickerType={pickerType}
      anchorElement={props => (
        <summary style={{height: CELL_HEIGHT - 1, outline: 'none', listStyle: 'none'}} role="button" {...props}>
          {renderButton()}
        </summary>
      )}
    />
  )
}

export const ParentIssueEditor = memo(ParentIssueEditorFunc)
