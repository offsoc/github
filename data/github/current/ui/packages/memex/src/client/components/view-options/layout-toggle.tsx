import {testIdProps} from '@github-ui/test-id-props'
import {type Icon, ProjectIcon, ProjectRoadmapIcon, TableIcon} from '@primer/octicons-react'
import {FormControl, SegmentedControl} from '@primer/react'
import {memo, useCallback, useId} from 'react'

import {SwitchLayoutName, ViewOptionsMenuUI} from '../../api/stats/contracts'
import {ViewType} from '../../helpers/view-type'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {usePostStats} from '../../hooks/common/use-post-stats'
import type {BaseViewState, ViewIsDirtyStates} from '../../hooks/use-view-state-reducer/types'
import {useViewType} from '../../hooks/use-view-type'
import {PotentiallyDirty} from '../potentially-dirty'

const LAYOUT_OPTIONS = [
  {type: ViewType.Table, Icon: TableIcon, title: 'Table'},
  {type: ViewType.Board, Icon: ProjectIcon, title: 'Board'},
  {type: ViewType.Roadmap, Icon: ProjectRoadmapIcon, title: 'Roadmap'},
] as const

const formControlSx = {px: 3, py: 1}
const labelSx = {
  display: 'block',
  color: 'fg.muted',
  fontSize: 0,
  fontWeight: 'bold',
  py: 2,
}
export const LayoutToggle = memo(function LayoutToggle({
  view,
  setOpen,
}: {
  view: BaseViewState & ViewIsDirtyStates
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const {isViewTypeDirty, viewType, setViewType} = useViewType()
  const {hasWritePermissions} = ViewerPrivileges()

  const {postStats} = usePostStats()

  const iconForControl = useCallback(
    (IconToDisplay: Icon, opts: {selected: boolean}) => {
      return (
        <PotentiallyDirty isDirty={isViewTypeDirty} hideDirtyState={!opts.selected || !hasWritePermissions}>
          <IconToDisplay />
        </PotentiallyDirty>
      )
    },
    [hasWritePermissions, isViewTypeDirty],
  )

  const handleViewTypeChange = useCallback(
    (segmentIndex: number) => {
      const value = LAYOUT_OPTIONS[segmentIndex]
      if (!value) return
      setViewType(view, value.type, ViewOptionsMenuUI)
      postStats({
        name: SwitchLayoutName,
        ui: ViewOptionsMenuUI,
        context: value.type,
      })
      setOpen(false)
    },
    [setViewType, view, postStats, setOpen],
  )

  const controlId = useId()
  const labelId = useId()

  return (
    <FormControl id={controlId} sx={formControlSx}>
      <FormControl.Label id={labelId} sx={labelSx}>
        Layout
      </FormControl.Label>
      <SegmentedControl
        aria-labelledby={labelId}
        fullWidth
        onChange={handleViewTypeChange}
        {...testIdProps('view-options-menu-layout')}
      >
        {LAYOUT_OPTIONS.map(option => {
          return (
            <SegmentedControl.Button
              key={option.type}
              leadingIcon={() => iconForControl(option.Icon, {selected: viewType === option.type})}
              selected={viewType === option.type}
              {...testIdProps(`view-type-${option.type}`)}
            >
              {option.title}
            </SegmentedControl.Button>
          )
        })}
      </SegmentedControl>
    </FormControl>
  )
})
