import {testIdProps} from '@github-ui/test-id-props'
import {
  ArrowBothIcon,
  CalendarIcon,
  ColumnsIcon,
  NoteIcon,
  NumberIcon,
  RowsIcon,
  ZoomInIcon,
} from '@primer/octicons-react'
import {Octicon} from '@primer/react'

import {useHorizontalGroupedBy} from '../../features/grouping/hooks/use-horizontal-grouped-by'
import {useVerticalGroupedBy} from '../../features/grouping/hooks/use-vertical-grouped-by'
import {useSliceBy} from '../../features/slicing/hooks/use-slice-by'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {useAggregationSettings} from '../../hooks/use-aggregation-settings'
import {useRoadmapSettings} from '../../hooks/use-roadmap-settings'
import {useSortedBy} from '../../hooks/use-sorted-by'
import {useVisibleFields} from '../../hooks/use-visible-fields'
import {PotentiallyDirty} from '../potentially-dirty'
import {SlicerIcon} from '../slice-by-menu'

export function VisibleFieldsLeadingVisual() {
  const {isVisibleFieldsDirty} = useVisibleFields()
  const {hasWritePermissions} = ViewerPrivileges()
  return (
    <PotentiallyDirty isDirty={isVisibleFieldsDirty} hideDirtyState={!hasWritePermissions}>
      <NoteIcon />
    </PotentiallyDirty>
  )
}

export function GroupLeadingVisual() {
  const {isGroupedByDirty} = useHorizontalGroupedBy()
  const {hasWritePermissions} = ViewerPrivileges()
  return (
    <PotentiallyDirty isDirty={isGroupedByDirty} hideDirtyState={!hasWritePermissions}>
      <RowsIcon />
    </PotentiallyDirty>
  )
}

export function VerticalGroupLeadingVisual() {
  const {isGroupedByDirty} = useVerticalGroupedBy()
  const {hasWritePermissions} = ViewerPrivileges()
  return (
    <PotentiallyDirty isDirty={isGroupedByDirty} hideDirtyState={!hasWritePermissions}>
      <ColumnsIcon />
    </PotentiallyDirty>
  )
}

export function SortLeadingVisual() {
  const {isSortedByDirty} = useSortedBy()
  const {hasWritePermissions} = ViewerPrivileges()

  return (
    <PotentiallyDirty isDirty={isSortedByDirty} hideDirtyState={!hasWritePermissions}>
      <Octicon icon={ArrowBothIcon} sx={{transform: 'rotate(90deg)'}} />
    </PotentiallyDirty>
  )
}

export function AggregationLeadingVisual() {
  const {isAggregationSettingsDirty} = useAggregationSettings()
  const {hasWritePermissions} = ViewerPrivileges()
  return (
    <PotentiallyDirty
      isDirty={isAggregationSettingsDirty}
      hideDirtyState={!hasWritePermissions}
      {...testIdProps('aggregation-settings-dirty')}
    >
      <NumberIcon />
    </PotentiallyDirty>
  )
}

export const RoadmapDateFieldsDirtyIcon = () => {
  const {hasWritePermissions} = ViewerPrivileges()
  const {isRoadmapDateFieldsDirty} = useRoadmapSettings()
  return (
    <PotentiallyDirty
      isDirty={isRoadmapDateFieldsDirty}
      hideDirtyState={!hasWritePermissions}
      {...testIdProps('roadmap-date-fields-dirty')}
    >
      <CalendarIcon />
    </PotentiallyDirty>
  )
}

export const RoadmapZoomLevelIcon = () => {
  const {hasWritePermissions} = ViewerPrivileges()
  const {isRoadmapZoomLevelDirty} = useRoadmapSettings()
  return (
    <PotentiallyDirty
      isDirty={isRoadmapZoomLevelDirty}
      hideDirtyState={!hasWritePermissions}
      {...testIdProps('roadmap-zoom-level-dirty')}
    >
      <ZoomInIcon />
    </PotentiallyDirty>
  )
}

export function SlicerLeadingVisual() {
  const {isSliceByDirty} = useSliceBy()

  const {hasWritePermissions} = ViewerPrivileges()
  return (
    <PotentiallyDirty isDirty={isSliceByDirty} hideDirtyState={!hasWritePermissions}>
      <SlicerIcon />
    </PotentiallyDirty>
  )
}
