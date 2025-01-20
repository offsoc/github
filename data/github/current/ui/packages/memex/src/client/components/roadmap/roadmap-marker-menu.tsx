import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {LocationIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu} from '@primer/react'
import {memo, useCallback, useMemo} from 'react'
import {flushSync} from 'react-dom'

import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import {RoadmapMarkerHide, RoadmapMarkerShow} from '../../api/stats/contracts'
import {onSubMenuMultiSelection, sortColumnsDeterministically} from '../../helpers/util'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useMemexRootHeight} from '../../hooks/use-memex-root-height'
import {useRoadmapSettings} from '../../hooks/use-roadmap-settings'
import {useViewOptionsStatsUiKey} from '../../hooks/use-view-options-stats-ui-key'
import {useViews} from '../../hooks/use-views'
import type {ColumnModel} from '../../models/column-model'
import {useAllColumns} from '../../state-providers/columns/use-all-columns'
import {getColumnIcon} from '../column-detail-helpers'
import {PotentiallyDirty} from '../potentially-dirty'

const MarkerFields = new Set<MemexColumnDataType>([
  MemexColumnDataType.Iteration,
  MemexColumnDataType.Milestone,
  MemexColumnDataType.Date,
])
function isMarkerField(field: ColumnModel) {
  return MarkerFields.has(field.dataType)
}

/**
 * Return all date fields, milestone and iteration fields
 */
const useEligibleMarkerFields = () => {
  const {allColumns} = useAllColumns()

  return useMemo(() => {
    return allColumns.filter(isMarkerField).sort(sortColumnsDeterministically)
  }, [allColumns])
}

export const MarkerDirtyIcon = () => {
  const {isRoadmapMarkerFieldsDirty} = useRoadmapSettings()
  const {hasWritePermissions} = ViewerPrivileges()
  return (
    <PotentiallyDirty isDirty={isRoadmapMarkerFieldsDirty} hideDirtyState={!hasWritePermissions}>
      <LocationIcon />
    </PotentiallyDirty>
  )
}

export function RoadmapMarkerMenu({id}: React.ComponentProps<typeof ActionList>) {
  const {currentView} = useViews()
  const eligibleMarkerFields = useEligibleMarkerFields()
  const {markerFields, toggleMarkerField} = useRoadmapSettings()
  const markerFieldset = useMemo(() => new Set(markerFields), [markerFields])
  const {postStats} = usePostStats()
  const statsUiKey = useViewOptionsStatsUiKey()

  const handleSelect = useCallback(
    (field: ColumnModel) => {
      if (!currentView) return
      const selected = markerFieldset.has(field)
      toggleMarkerField(currentView.number, field)

      postStats({
        name: selected ? RoadmapMarkerHide : RoadmapMarkerShow,
        ui: statsUiKey,
        memexProjectColumnId: field.id,
      })
    },
    [currentView, markerFieldset, toggleMarkerField, postStats, statsUiKey],
  )

  return (
    <ActionList {...testIdProps('roadmap-markers-menu')} id={id} selectionVariant="multiple">
      <ActionList.Group>
        <ActionList.GroupHeading>Markers</ActionList.GroupHeading>
        {eligibleMarkerFields.map(field => {
          const Icon = getColumnIcon(field.dataType)
          return (
            <ActionList.Item
              key={field.id}
              selected={markerFieldset.has(field)}
              onSelect={e => {
                onSubMenuMultiSelection(e)
                handleSelect(field)
              }}
            >
              <ActionList.LeadingVisual>
                <Icon />
              </ActionList.LeadingVisual>
              {field.name}
            </ActionList.Item>
          )
        })}
      </ActionList.Group>
    </ActionList>
  )
}

export const MarkerColumnMenu = memo(function MarkerColumnMenu({
  id,
  open,
  setOpen,
  anchorRef,
}: {
  id?: string
  open: boolean
  setOpen: (open: boolean) => void
  anchorRef: React.RefObject<HTMLElement>
}) {
  const {clientHeight} = useMemexRootHeight({
    onResize: () => {
      if (open) {
        flushSync(() => {
          setOpen(false)
        })

        setOpen(true)
      }
    },
  })
  return (
    <ActionMenu open={open} anchorRef={anchorRef} onOpenChange={noop}>
      <ActionMenu.Overlay
        sx={{maxHeight: clientHeight, overflow: 'auto'}}
        {...testIdProps('column-marker-menu')}
        role="dialog"
        onEscape={() => setOpen(false)}
        onClickOutside={() => setOpen(false)}
        aria-label="Configure vertical markers to display on roadmap"
      >
        <RoadmapMarkerMenu id={id} />
      </ActionMenu.Overlay>
    </ActionMenu>
  )
})
