import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {ActionList, ActionMenu} from '@primer/react'
import {memo, useCallback} from 'react'
import {flushSync} from 'react-dom'

import {RoadmapZoomLevelSet} from '../../api/stats/contracts'
import {RoadmapZoomLevel} from '../../api/view/contracts'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useMemexProjectViewRootHeight} from '../../hooks/use-memex-app-root-height'
import {useRoadmapSetZoomLevel, useRoadmapZoomLevel} from '../../hooks/use-roadmap-settings'
import {useViewOptionsStatsUiKey} from '../../hooks/use-view-options-stats-ui-key'
import {useViews} from '../../hooks/use-views'
import {RoadmapResources} from '../../strings'

type MenuProps = {
  open: boolean
  setOpen: (open: boolean) => void
  anchorRef: React.RefObject<HTMLElement>
  id?: string
}

/**
 * The control used in the roadmap view to specify the zoom level used in the view.
 */
export const RoadmapZoomLevelMenu = memo<MenuProps>(function RoadmapZoomLevelMenu({id, open, setOpen, anchorRef}) {
  const zoomLevel = useRoadmapZoomLevel()
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

  return (
    <ActionMenu open={open} anchorRef={anchorRef} onOpenChange={noop}>
      <ActionMenu.Overlay
        sx={{maxHeight: clientHeight, overflow: 'auto'}}
        {...testIdProps('roadmap-zoom-level-menu')}
        role="dialog"
        aria-label={RoadmapResources.zoomMenuDialogAriaLabel(zoomLevel)}
        onEscape={() => setOpen(false)}
        onClickOutside={() => setOpen(false)}
      >
        <MenuOptions id={id} key={String(open)} setOpen={setOpen} />
      </ActionMenu.Overlay>
    </ActionMenu>
  )
})

const zoomLevelOptions = [
  {type: RoadmapZoomLevel.Month, label: RoadmapResources.zoomLevelOptions.month},
  {type: RoadmapZoomLevel.Quarter, label: RoadmapResources.zoomLevelOptions.quarter},
  {type: RoadmapZoomLevel.Year, label: RoadmapResources.zoomLevelOptions.year},
]

type ZoomLevelsProps = {
  currentValue?: RoadmapZoomLevel
  onSelect: (zoomLevel: RoadmapZoomLevel) => void
}

const ZoomLevels = memo(function ZoomLevels({currentValue, onSelect}: ZoomLevelsProps) {
  return (
    <>
      {zoomLevelOptions.map(zoom => (
        <ActionList.Item
          key={zoom.type}
          selected={zoom.type === currentValue}
          onSelect={e => {
            e.preventDefault()
            onSelect(zoom.type)
          }}
          {...testIdProps(`zoom-level-${zoom.type}`)}
        >
          {zoom.label}
        </ActionList.Item>
      ))}
    </>
  )
})

const MenuOptions = memo(function MenuOptions({id, setOpen}: Pick<MenuProps, 'id' | 'setOpen'>) {
  const {currentView} = useViews()
  const zoomLevel = useRoadmapZoomLevel()
  const setZoomLevel = useRoadmapSetZoomLevel()
  const {postStats} = usePostStats()
  const statsUiKey = useViewOptionsStatsUiKey()

  const handleSelect = useCallback(
    (selectedZoomLevel: RoadmapZoomLevel) => {
      if (!currentView) return

      setZoomLevel(currentView.number, selectedZoomLevel)
      postStats({
        name: RoadmapZoomLevelSet,
        ui: statsUiKey,
        context: selectedZoomLevel,
      })

      setOpen(false)
    },
    [currentView, setZoomLevel, postStats, statsUiKey, setOpen],
  )

  return (
    <ActionList id={id}>
      <ActionList.Group selectionVariant="single" {...testIdProps('roadmap-zoom-list')}>
        <ActionList.GroupHeading>{RoadmapResources.zoomLevel}</ActionList.GroupHeading>
        <ZoomLevels currentValue={zoomLevel} onSelect={handleSelect} />
      </ActionList.Group>
    </ActionList>
  )
})
