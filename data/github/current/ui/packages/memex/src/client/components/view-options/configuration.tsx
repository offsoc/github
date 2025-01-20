import {Text} from '@primer/react'
import {Fragment} from 'react'

import type {EnabledFeaturesMap} from '../../api/enabled-features/contracts'
import {useHorizontalGroupedBy} from '../../features/grouping/hooks/use-horizontal-grouped-by'
import {useVerticalGroupedBy} from '../../features/grouping/hooks/use-vertical-grouped-by'
import {useSliceBy} from '../../features/slicing/hooks/use-slice-by'
import {joinOxford} from '../../helpers/join-oxford'
import {isRoadmapColumnModel} from '../../helpers/roadmap-helpers'
import {ViewType} from '../../helpers/view-type'
import {useAggregationSettings} from '../../hooks/use-aggregation-settings'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {useRoadmapSettings, useRoadmapZoomLevel} from '../../hooks/use-roadmap-settings'
import {useSortedBy} from '../../hooks/use-sorted-by'
import type {CurrentView} from '../../hooks/use-view-state-reducer/types'
import {useViewType} from '../../hooks/use-view-type'
import {useVisibleFields} from '../../hooks/use-visible-fields'
import {RoadmapResources} from '../../strings'
import {AddColumnMenu} from '../add-column-menu'
import {ColumnSortIcon} from '../common/column-sort-icon'
import {FieldSumMenu} from '../field-sum-menu'
import {HorizontalGroupByMenu} from '../horizontal-group-by-menu'
import {RoadmapDateFieldsMenu} from '../roadmap/roadmap-date-fields-menu'
import {RoadmapGroupByMenu} from '../roadmap/roadmap-group-by-menu'
import {MarkerColumnMenu, MarkerDirtyIcon} from '../roadmap/roadmap-marker-menu'
import {RoadmapZoomLevelMenu} from '../roadmap/roadmap-zoom-level-menu'
import {SliceByMenu} from '../slice-by-menu'
import {SortByMenu} from '../sort-by-menu'
import {VerticalGroupByMenu} from '../vertical-group-by-menu'
import {
  AggregationLeadingVisual,
  GroupLeadingVisual,
  RoadmapDateFieldsDirtyIcon,
  RoadmapZoomLevelIcon,
  SlicerLeadingVisual,
  SortLeadingVisual,
  VerticalGroupLeadingVisual,
  VisibleFieldsLeadingVisual,
} from './icons'

export type ConfigurationOptionComponentProps = Omit<ViewMenuConfigurationOption, 'Component'>
type HideIfFn = (opts: {currentView?: CurrentView; enabledFeatures?: EnabledFeaturesMap}) => boolean
export type ConfigurationOption = {
  icon: () => JSX.Element
  title:
    | 'Fields'
    | 'Group by'
    | 'Sort by'
    | 'Field sum'
    | 'Column by'
    | 'Marker fields'
    | 'Dates'
    | 'Zoom level'
    | 'Slice by'
  MenuComponent: React.ComponentType<{
    setOpen: (next: boolean) => void
    open: boolean
    anchorRef: React.RefObject<HTMLElement>
    id?: string | undefined
  }>
  testId: string
  hideIf?: HideIfFn
  TextContent: React.ComponentType
  useHasValue: () => boolean
}

type ViewMenuConfigurationOption = ConfigurationOption & {
  hideIf: HideIfFn
}

function createViewMenuConfigOption(opts: ConfigurationOption): ViewMenuConfigurationOption {
  const optsWithDefaults = {
    hideIf: () => false,
    ...opts,
  }

  return optsWithDefaults
}

export const sliceByToolbarItem = createViewMenuConfigOption({
  icon: SlicerLeadingVisual,
  title: 'Slice by',
  MenuComponent: SliceByMenu,
  testId: 'slice-by-menu',
  useHasValue: () => {
    const {sliceField} = useSliceBy()
    return !!sliceField
  },
  TextContent() {
    const {sliceField} = useSliceBy()

    return (
      <ListItemContent active={!!sliceField} title="Slice by">
        {sliceField ? sliceField.name : 'none'}
      </ListItemContent>
    )
  },
})

const visibleFieldsToolbarItem = createViewMenuConfigOption({
  icon: VisibleFieldsLeadingVisual,
  title: 'Fields',
  MenuComponent: AddColumnMenu,
  testId: 'add-field-menu',
  useHasValue: () => {
    const {visibleFields} = useVisibleFields()
    return visibleFields.length > 0
  },
  TextContent() {
    const {visibleFields} = useVisibleFields()

    return (
      <ListItemContent active={visibleFields.length > 0} title="Fields">
        {joinOxford(visibleFields.map(field => field.name))}
      </ListItemContent>
    )
  },
})

const horizontalGroupByToolbarItem = createViewMenuConfigOption({
  icon: GroupLeadingVisual,
  title: 'Group by',
  MenuComponent: HorizontalGroupByMenu,
  testId: 'group-by-menu',
  useHasValue: () => {
    const {groupedByColumn} = useHorizontalGroupedBy()
    return !!groupedByColumn
  },
  TextContent() {
    const {memex_table_without_limits, memex_mwl_swimlanes} = useEnabledFeatures()
    const {viewType} = useViewType()
    const {groupedByColumn} = useHorizontalGroupedBy()
    // Disable swimlanes for MWL board view for the time being
    const showGroupedByColumn =
      groupedByColumn && (!(memex_table_without_limits && viewType === ViewType.Board) || memex_mwl_swimlanes)

    return (
      <ListItemContent active={!!groupedByColumn} title="Group by">
        {showGroupedByColumn ? groupedByColumn.name : 'none'}
      </ListItemContent>
    )
  },
})

const sortByToolbarItem = createViewMenuConfigOption({
  icon: SortLeadingVisual,
  title: 'Sort by',
  MenuComponent: SortByMenu,
  testId: 'sort-by-menu',
  useHasValue: () => {
    const {isSorted} = useSortedBy()
    return isSorted
  },
  TextContent() {
    const {sorts, isSorted} = useSortedBy()
    return (
      <ListItemContent active={isSorted} title="Sort by">
        {isSorted
          ? sorts.map((sort, i) => (
              <Fragment key={sort.column.id}>
                <ColumnSortIcon direction={sort.direction} /> {sort.column.name}
                <span className="sr-only">{sort.direction === 'asc' ? ' (ascending)' : ' (descending)'}</span>
                {i !== sorts.length - 1 && ', '}
              </Fragment>
            ))
          : 'manual'}
      </ListItemContent>
    )
  },
})

const boardFieldSumToolbarItem = createViewMenuConfigOption({
  icon: AggregationLeadingVisual,
  title: 'Field sum',
  MenuComponent: FieldSumMenu,
  testId: 'field-sum-menu',
  useHasValue: () => {
    const {sum, hideItemsCount} = useAggregationSettings()
    return !!sum[0] || !hideItemsCount
  },
  TextContent() {
    const {hideItemsCount, sum} = useAggregationSettings()

    let label = hideItemsCount ? '' : 'Count'

    if (sum.length) {
      const sumItem = sum[0]
      if (sumItem != null) {
        label += `${label ? ', ' : ''}${sumItem.name}`
      }

      if (sum.length > 1) {
        label += ` and ${sum.length - 1} more`
      }
    }
    return (
      <ListItemContent active={!!label} title="Field sum">
        {label || 'none'}
      </ListItemContent>
    )
  },
})

const fieldSumToolbarItem = createViewMenuConfigOption({
  ...boardFieldSumToolbarItem,
  hideIf({currentView}) {
    if (!currentView) return false
    return currentView.localViewState.groupBy.length === 0
  },
})

const verticalGroupByMenuItem = createViewMenuConfigOption({
  icon: VerticalGroupLeadingVisual,
  title: 'Column by',
  MenuComponent: VerticalGroupByMenu,
  testId: 'column-by-menu',
  useHasValue: () => {
    return true
  },
  TextContent() {
    const {groupedByColumn} = useVerticalGroupedBy()
    return (
      <ListItemContent active={!!groupedByColumn} title="Column by">
        {groupedByColumn ? groupedByColumn.name : 'none'}
      </ListItemContent>
    )
  },
})

const roadmapGroupByMenuItem = createViewMenuConfigOption({
  ...horizontalGroupByToolbarItem,
  MenuComponent: RoadmapGroupByMenu,
  TextContent() {
    const {groupedByColumn} = useHorizontalGroupedBy()

    return (
      <ListItemContent active={!!groupedByColumn} title="Group by">
        {groupedByColumn ? groupedByColumn.name : 'none'}
      </ListItemContent>
    )
  },
})

const markerFieldsMenuItem = createViewMenuConfigOption({
  icon: MarkerDirtyIcon,
  title: 'Marker fields',
  MenuComponent: MarkerColumnMenu,
  testId: 'markers-menu',
  useHasValue: () => {
    const {markerFields} = useRoadmapSettings()

    return markerFields.length > 0
  },
  TextContent() {
    const {markerFields} = useRoadmapSettings()

    const containsVisibleMarkerFields = markerFields.length > 0
    return (
      <ListItemContent active={containsVisibleMarkerFields} title="Markers">
        {containsVisibleMarkerFields ? joinOxford(markerFields.map(field => field.name)) : 'none'}
      </ListItemContent>
    )
  },
})

const dateFieldsMenuItem = createViewMenuConfigOption({
  icon: RoadmapDateFieldsDirtyIcon,
  title: 'Dates',
  MenuComponent: RoadmapDateFieldsMenu,
  testId: 'date-fields-menu',
  useHasValue: () => {
    const {dateFields} = useRoadmapSettings()

    return new Set(dateFields.filter(isRoadmapColumnModel).map(field => field.name)).size > 0
  },
  TextContent() {
    const {dateFields} = useRoadmapSettings()
    const withoutDuplicates = new Set(dateFields.filter(isRoadmapColumnModel).map(field => field.name))
    const label = joinOxford(Array.from(withoutDuplicates).filter(name => !!name))
    return (
      <ListItemContent active={!!label} title="Dates">
        {label || 'none'}
      </ListItemContent>
    )
  },
})

const zoomLevelMenuItem = createViewMenuConfigOption({
  icon: RoadmapZoomLevelIcon,
  title: 'Zoom level',
  MenuComponent: RoadmapZoomLevelMenu,
  testId: 'zoom-level',
  useHasValue: () => {
    return true
  },
  TextContent() {
    const zoomLevel = useRoadmapZoomLevel()
    return (
      <ListItemContent active title="Zoom level">
        {RoadmapResources.zoomLevelOptions[zoomLevel]}
      </ListItemContent>
    )
  },
})

export const optionsForViewType: Readonly<Partial<{[V in ViewType]: ReadonlyArray<ViewMenuConfigurationOption>}>> = {
  [ViewType.Table]: [
    visibleFieldsToolbarItem,
    horizontalGroupByToolbarItem,
    sortByToolbarItem,
    fieldSumToolbarItem,
    sliceByToolbarItem,
  ],
  [ViewType.Board]: [
    visibleFieldsToolbarItem,
    verticalGroupByMenuItem,
    horizontalGroupByToolbarItem,
    sortByToolbarItem,
    boardFieldSumToolbarItem,
    sliceByToolbarItem,
  ],
  [ViewType.Roadmap]: [
    roadmapGroupByMenuItem,
    markerFieldsMenuItem,
    sortByToolbarItem,
    dateFieldsMenuItem,
    zoomLevelMenuItem,
    fieldSumToolbarItem,
    sliceByToolbarItem,
  ],
}

const configFieldUnset = {
  display: 'flex',
  justifyContent: 'space-between',
  whiteSpace: 'nowrap',
  width: '100%',
  maxWidth: '100%',
}
const headingSx = {color: 'fg.muted', fontStyle: 'normal'}
const contentSx = {
  maxWidth: '150px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontStyle: 'normal',
}
const contentSxEmpty = {
  ...contentSx,
  fontStyle: 'italic',
}
function ListItemContent({title, active, children}: {title: string; active: boolean; children: React.ReactNode}) {
  return (
    <Text sx={configFieldUnset}>
      <Text sx={headingSx}>{title}: </Text>
      <Text sx={active ? contentSx : contentSxEmpty}>{children}</Text>
    </Text>
  )
}
