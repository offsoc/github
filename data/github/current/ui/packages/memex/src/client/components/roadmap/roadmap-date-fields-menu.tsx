import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {PlusIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu} from '@primer/react'
import {memo, useCallback, useMemo, useState} from 'react'
import {flushSync} from 'react-dom'

import {MemexColumnDataType, type SystemColumnId} from '../../api/columns/contracts/memex-column'
import {RoadmapDateFieldSelected} from '../../api/stats/contracts'
import {RoadmapDateFieldNone} from '../../api/view/contracts'
import {isRoadmapColumnModel, type RoadmapColumn} from '../../helpers/roadmap-helpers'
import {onSubMenuMultiSelection, sortColumnsDeterministically} from '../../helpers/util'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useMemexProjectViewRootHeight} from '../../hooks/use-memex-app-root-height'
import {useRoadmapSettings} from '../../hooks/use-roadmap-settings'
import {useViewOptionsStatsUiKey} from '../../hooks/use-view-options-stats-ui-key'
import {useViews} from '../../hooks/use-views'
import type {ColumnModel} from '../../models/column-model'
import {isDateColumnModel, isIterationColumnModel} from '../../models/column-model/guards'
import {useAllColumns} from '../../state-providers/columns/use-all-columns'
import {RoadmapResources} from '../../strings'
import {getColumnIcon} from '../column-detail-helpers'
import {AddColumnModal} from '../react_table/add-column-modal'

type MenuProps = {
  open: boolean
  setOpen: (open: boolean) => void
  anchorRef: React.RefObject<HTMLElement>
  id?: string
}

/**
 * The control used in the roadmap/roadmap view to specify the fields that are used to
 * specify the durations of items in the view.
 */
export const RoadmapDateFieldsMenu = memo<MenuProps>(function RoadmapDateFieldsMenu({id, open, setOpen, anchorRef}) {
  const [addFieldOpen, setAddFieldOpen] = useState(false)
  const {clientHeight} = useMemexProjectViewRootHeight({
    onResize: () => {
      if (open) {
        flushSync(() => {
          setOpen(false)
        })
        setOpen(true)
      }
    },
  })

  const {dateFields, setDateFields} = useRoadmapSettings()
  const {currentView} = useViews()

  // Update the start or end fields with the new field if not already set.
  const onSaveNewField = useCallback(
    (newField: ColumnModel) => {
      if (!currentView || !isRoadmapColumnModel(newField)) return

      const [start = RoadmapDateFieldNone, end = RoadmapDateFieldNone] = dateFields
      if (start === RoadmapDateFieldNone || end === RoadmapDateFieldNone) {
        let nextFields: Array<RoadmapColumn> = []

        if (start === RoadmapDateFieldNone) {
          nextFields =
            isIterationColumnModel(newField) && end === RoadmapDateFieldNone ? [newField, newField] : [newField, end]
        } else {
          nextFields = [start, newField]
        }
        setDateFields(currentView.number, nextFields)
      }
      setOpen(true)
    },
    [currentView, dateFields, setDateFields, setOpen],
  )

  return (
    <>
      <ActionMenu open={open} anchorRef={anchorRef} onOpenChange={noop}>
        <ActionMenu.Overlay
          sx={{maxHeight: clientHeight, overflow: 'auto'}}
          role="dialog"
          aria-label="Select date fields"
          {...testIdProps('roadmap-date-fields-menu')}
          onEscape={() => setOpen(false)}
          onClickOutside={() => setOpen(false)}
        >
          <MenuOptions id={id} key={String(open)} setOpen={setOpen} setAddFieldOpen={setAddFieldOpen} />
        </ActionMenu.Overlay>
      </ActionMenu>

      <AddColumnModal
        isOpen={!open && addFieldOpen}
        setOpen={setAddFieldOpen}
        anchorRef={anchorRef}
        onSave={onSaveNewField}
        limitedTypes={[MemexColumnDataType.Date, MemexColumnDataType.Iteration]}
      />
    </>
  )
})

type DateFieldsProps = {
  dateFields: Array<ColumnModel>
  currentValue?: number | SystemColumnId | RoadmapDateFieldNone
  onSelect: (field: ColumnModel, variant: 'start' | 'end') => void
  variant: 'start' | 'end'
}

const DateFields = ({dateFields, currentValue, onSelect, variant}: DateFieldsProps) => {
  return (
    <>
      {dateFields.map(dateField => {
        const Icon = getColumnIcon(dateField.dataType)
        return (
          <ActionList.Item
            key={dateField.id}
            selected={dateField.id === currentValue}
            onSelect={e => {
              e.preventDefault()
              onSelect(dateField, variant)
            }}
            {...testIdProps(`date-field-${variant}-${dateField.name}`)}
          >
            <ActionList.LeadingVisual>
              <Icon />
            </ActionList.LeadingVisual>
            {`${dateField.name} ${isIterationColumnModel(dateField) ? RoadmapResources.iterationSuffix(variant) : ''}`}
          </ActionList.Item>
        )
      })}
    </>
  )
}

// Prevent duplicate date columns from being selected, while allowing duplicate iterations or "none"
function isSameDateField(field1: RoadmapColumn, field2: RoadmapColumn) {
  return (
    isRoadmapColumnModel(field1) && isRoadmapColumnModel(field2) && field1.id === field2.id && isDateColumnModel(field1)
  )
}

const MenuOptions = memo(function MenuOptions({
  id,
  setOpen,
  setAddFieldOpen,
}: Pick<MenuProps, 'setOpen' | 'id'> & {setAddFieldOpen: (open: boolean) => void}) {
  const {currentView} = useViews()
  const {allColumns} = useAllColumns()

  const compatibleFields = useMemo(
    () => allColumns.filter(f => isRoadmapColumnModel(f)).sort(sortColumnsDeterministically),
    [allColumns],
  )
  const {hasWritePermissions} = ViewerPrivileges()
  const {postStats} = usePostStats()
  const statsUiKey = useViewOptionsStatsUiKey()

  const onClickNewField = useCallback(
    (event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
      setAddFieldOpen(true)
      setOpen(false)
      event.stopPropagation()
    },
    [setAddFieldOpen, setOpen],
  )
  const {dateFields, setDateFields} = useRoadmapSettings()
  const [start = RoadmapDateFieldNone, end = RoadmapDateFieldNone] = dateFields

  const handleSelect = useCallback(
    (dateField: RoadmapColumn, variant: 'start' | 'end') => {
      if (!currentView) return

      const nextFields: Array<RoadmapColumn> = []

      if (variant === 'start') {
        // Preselect matching iteration end if no value has been selected, and start is an iteration
        const defaultEnd =
          isRoadmapColumnModel(dateField) && isIterationColumnModel(dateField) ? dateField : RoadmapDateFieldNone
        const isDuplicateDate = isSameDateField(dateField, end)
        nextFields.push(dateField, !isDuplicateDate ? end : defaultEnd)
      } else {
        const isDuplicateDate = isSameDateField(dateField, start)
        nextFields.push(!isDuplicateDate ? start : RoadmapDateFieldNone, dateField)
      }

      postStats({
        name: RoadmapDateFieldSelected,
        ui: statsUiKey,
        context: variant === 'start' ? 'start' : 'target',
        ...(isRoadmapColumnModel(dateField) ? {memexProjectColumnId: dateField.databaseId} : {}),
      })

      setDateFields(currentView.number, nextFields)
    },
    [currentView, postStats, statsUiKey, setDateFields, end, start],
  )

  return (
    <ActionList id={id}>
      <ActionList.Group>
        <ActionList.Item
          key={'new-field'}
          disabled={!hasWritePermissions}
          onSelect={e => {
            onSubMenuMultiSelection(e)
            onClickNewField(e)
          }}
          {...testIdProps('roadmap-new-field-button')}
        >
          <ActionList.LeadingVisual>
            <PlusIcon />
          </ActionList.LeadingVisual>
          New field
        </ActionList.Item>
      </ActionList.Group>
      <ActionList.Divider />

      <ActionList.Group selectionVariant="single">
        <ActionList.GroupHeading>{RoadmapResources.startDate}</ActionList.GroupHeading>
        <DateFields
          dateFields={compatibleFields}
          currentValue={start === RoadmapDateFieldNone ? start : start?.id}
          onSelect={handleSelect}
          variant="start"
        />
        <ActionList.Item
          key="none"
          selected={start === RoadmapDateFieldNone}
          onSelect={e => {
            e.preventDefault()
            handleSelect(RoadmapDateFieldNone, 'start')
          }}
          {...testIdProps('date-field-no-start')}
        >
          {RoadmapResources.noStartDate}
        </ActionList.Item>
      </ActionList.Group>
      <ActionList.Group selectionVariant="single">
        <ActionList.GroupHeading>{RoadmapResources.endDate}</ActionList.GroupHeading>
        <DateFields
          dateFields={compatibleFields}
          currentValue={end === RoadmapDateFieldNone ? end : end?.id}
          onSelect={handleSelect}
          variant="end"
        />
        <ActionList.Item
          key="none"
          disabled={!compatibleFields}
          selected={end === RoadmapDateFieldNone}
          onSelect={e => {
            e.preventDefault()
            handleSelect(RoadmapDateFieldNone, 'end')
          }}
          {...testIdProps('date-field-no-end')}
        >
          {RoadmapResources.noEndDate}
        </ActionList.Item>
      </ActionList.Group>
    </ActionList>
  )
})
