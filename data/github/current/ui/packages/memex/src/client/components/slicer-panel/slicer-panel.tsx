import {testIdProps} from '@github-ui/test-id-props'
import {TriangleDownIcon} from '@primer/octicons-react'
import {Box, Button, Truncate} from '@primer/react'
import {type MouseEvent, useCallback, useRef, useState} from 'react'

import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import {
  SliceItemDeselected,
  SliceItemSelected,
  SlicerDeselect,
  SlicerHideEmpty,
  SlicerPanelUI,
  SlicerShowEmpty,
} from '../../api/stats/contracts'
import {type SliceValue, useSliceBy} from '../../features/slicing/hooks/use-slice-by'
import {themeGetSx} from '../../helpers/theme-get-sx'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {usePostStats} from '../../hooks/common/use-post-stats'
import type {OpenSidePanelFn} from '../../hooks/use-side-panel'
import {ViewStateActionTypes} from '../../hooks/use-view-state-reducer/view-state-action-types'
import {useViewType} from '../../hooks/use-view-type'
import {useViews} from '../../hooks/use-views'
import type {IssueModel} from '../../models/memex-item-model'
import {type SearchConfigType, SearchProvider} from '../filter-bar/search-context'
import {BulkAddItemsProvider} from '../side-panel/bulk-add/bulk-add-items-provider'
import {SliceByMenu} from '../slice-by-menu'
import {SLICER_PANEL_DEFAULT_WIDTH} from './constants'
import {SlicerGroupByItems, SlicerIterationItems, SlicerTrackedByItems} from './slicer-items'
import type {SlicerItemGroup} from './slicer-items-provider'
import {SlicerPanelResizer} from './slicer-panel-resizer'

const headingContainerSx = {
  display: 'flex',
  justifyContent: 'space-between',
  margin: '12px 12px 0 12px',
}

const headingButtonSx = {
  minHeight: '34px',
  minWidth: '48px',
  display: 'flex',
  alignItems: 'center',
}

const fieldButtonSx = {
  ...headingButtonSx,
  flexshrink: 1,
  color: 'fg.default',
  '[data-component=buttonContent]': {flex: '1 1'},
}

const fieldButtonTitleSx = {
  display: 'block',
  fontSize: 1,
  fontWeight: 'bold',
  maxWidth: '400px',
}

const deselectButtonSx = {
  ...headingButtonSx,
  flexShrink: 0,
  color: 'fg.muted',
  fontWeight: 'normal',
}

const SlicerSearchConfig: Readonly<SearchConfigType> = {
  baseQuery: '-no:tracks',
  isMainProjectFilter: false,
  viewStateActionType: ViewStateActionTypes.SetSliceByFilter,
  getSearchQueryFromView: view => view?.localViewState?.sliceBy?.filter ?? '',
  getSearchIsDirty: view => view?.isSliceByFilterDirty ?? false,
}

export function SlicerPanel({
  slicerItems,
  openSidePanel,
}: {
  slicerItems: Array<SlicerItemGroup> | null
  openSidePanel: OpenSidePanelFn
}) {
  const {sliceField, sliceValue, setSliceValue, sliceByPanelWidth, setSliceByPanelWidth} = useSliceBy()
  const [isSliceByMenuOpen, setIsSliceByMenuOpen] = useState(false)
  const [showEmptyItems, setShowEmptyItems] = useState(false)
  const {currentView} = useViews()
  const {viewType} = useViewType()
  const {postStats} = usePostStats()
  const {hasWritePermissions} = ViewerPrivileges()

  const [localPanelWidth, setLocalPanelWidth] = useState<Record<number, number>>({})

  const anchorRef = useRef<HTMLButtonElement>(null)

  const toggleSliceValue = useCallback(
    (value: SliceValue) => {
      if (!sliceField || !currentView) return

      const toggleOn = value !== sliceValue

      setSliceValue(currentView.number, toggleOn ? value : null)

      postStats({
        name: toggleOn ? SliceItemSelected : SliceItemDeselected,
        memexProjectColumnId: sliceField.id,
        ui: SlicerPanelUI,
        context: JSON.stringify({layout: viewType}),
      })
    },
    [sliceField, currentView, sliceValue, setSliceValue, postStats, viewType],
  )

  const deselectSelection = useCallback(() => {
    if (!sliceField || !currentView) return

    setSliceValue(currentView.number, null)

    postStats({
      name: SlicerDeselect,
      memexProjectColumnId: sliceField.id,
      ui: SlicerPanelUI,
      context: JSON.stringify({layout: viewType}),
    })
  }, [sliceField, currentView, setSliceValue, postStats, viewType])

  const showEmptySlicerItems = useCallback(
    (show: boolean) => {
      if (!sliceField || !currentView) return

      setShowEmptyItems(show)

      postStats({
        name: show ? SlicerShowEmpty : SlicerHideEmpty,
        memexProjectColumnId: sliceField.id,
        ui: SlicerPanelUI,
        context: JSON.stringify({layout: viewType}),
      })
    },
    [sliceField, currentView, postStats, viewType],
  )

  const handleOpenSidePanel = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, item: IssueModel) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      const isModifiedClick = e.ctrlKey || e.metaKey

      // Prevent toggling the slice value if the slice value is the same as
      // the item clicked or if the user is holding the ctrl or cmd key
      if (sliceValue === e.currentTarget.textContent || isModifiedClick) {
        e.stopPropagation()
      }

      // Prevent opening the side panel when opening a link in a new tab
      if (isModifiedClick) {
        return
      }

      openSidePanel(item)
      e.preventDefault()
    },
    [openSidePanel, sliceValue],
  )

  const renderSlicerItems = useCallback(() => {
    if (!sliceField || !slicerItems) return null

    switch (sliceField.dataType) {
      case MemexColumnDataType.TrackedBy:
        return (
          <SearchProvider config={SlicerSearchConfig}>
            <SlicerTrackedByItems
              sliceValue={sliceValue}
              onSliceValueChange={toggleSliceValue}
              onOpenSidePanel={handleOpenSidePanel}
            />
          </SearchProvider>
        )
      case MemexColumnDataType.Iteration:
        return (
          <SlicerIterationItems
            sliceValue={sliceValue}
            onSliceValueChange={toggleSliceValue}
            slicerItems={slicerItems}
            showEmptySlicerItems={showEmptyItems}
            setShowEmptySlicerItems={showEmptySlicerItems}
          />
        )
      default:
        return (
          <SlicerGroupByItems
            sliceValue={sliceValue}
            onSliceValueChange={toggleSliceValue}
            slicerItems={slicerItems}
            showEmptySlicerItems={showEmptyItems}
            setShowEmptySlicerItems={showEmptySlicerItems}
          />
        )
    }
  }, [sliceField, slicerItems, sliceValue, toggleSliceValue, handleOpenSidePanel, showEmptyItems, showEmptySlicerItems])

  // Handle resizing the slicer panel while the user is dragging the resizer control
  const handleResize = useCallback(
    (width: number) => {
      if (!currentView) return

      setLocalPanelWidth(prev => {
        return {
          ...prev,
          [currentView.number]: width,
        }
      })
    },
    [currentView, setLocalPanelWidth],
  )

  // Handle resizing the slicer panel when the user has stopped
  // dragging the resizer control or has double clicked it
  // This will update the slice by panel width server side
  const handleResizeEnd = useCallback(
    (width: number) => {
      if (!currentView) return

      setLocalPanelWidth(prev => {
        const newState = {...prev}
        delete newState[currentView.number]

        return newState
      })

      setSliceByPanelWidth(width)
    },
    [currentView, setSliceByPanelWidth],
  )

  if (!currentView) return null

  const panelWidth = localPanelWidth[currentView.number] ?? sliceByPanelWidth ?? SLICER_PANEL_DEFAULT_WIDTH

  return (
    /**
     * The height: 0 and minHeight: '100%' trickery is needed to allow scrolling the slicer panel
     * within the grid container. Without this, the slicer panel will not scroll correctly.
     *
     * See: https://stackoverflow.com/a/43312314
     * See: https://stackoverflow.com/a/43352777
     */
    <Box sx={{gridArea: '1/1/-1', display: 'flex', height: 0, minHeight: '100%'}}>
      <Box
        {...testIdProps('slicer-panel')}
        sx={{
          left: 0,
          backgroundColor: themeGetSx('colors.canvas.default'),
          color: themeGetSx('colors.fg.default'),
          height: '100%',
          overflow: 'auto',
          // Only show the border when the user does not have write permissions (slicer panel is read only)
          ...(!hasWritePermissions && {
            borderColor: themeGetSx('colors.border.muted'),
            borderWidth: '1px',
            borderRightStyle: 'solid',
          }),
        }}
        style={{
          width: `${panelWidth}px`,
        }}
      >
        <BulkAddItemsProvider>
          {sliceField && slicerItems ? (
            <>
              <Box sx={headingContainerSx}>
                <Button
                  variant="invisible"
                  sx={fieldButtonSx}
                  ref={anchorRef}
                  aria-expanded={isSliceByMenuOpen}
                  onClick={() => setIsSliceByMenuOpen(!isSliceByMenuOpen)}
                  trailingVisual={TriangleDownIcon}
                >
                  <Truncate
                    {...testIdProps('slicer-panel-title')}
                    id="slicer-panel-title"
                    title={sliceField.name}
                    sx={fieldButtonTitleSx}
                  >
                    {sliceField.name}
                  </Truncate>
                </Button>
                {sliceValue && (
                  <Button variant="invisible" sx={deselectButtonSx} onClick={deselectSelection} size="small">
                    Deselect
                  </Button>
                )}
              </Box>
              <SliceByMenu
                anchorRef={anchorRef}
                open={isSliceByMenuOpen}
                setOpen={setIsSliceByMenuOpen}
                ui={SlicerPanelUI}
              />

              {renderSlicerItems()}
            </>
          ) : null}
        </BulkAddItemsProvider>
      </Box>
      {hasWritePermissions && (
        <SlicerPanelResizer onResize={handleResize} onResizeEnd={handleResizeEnd} width={panelWidth} />
      )}
    </Box>
  )
}
