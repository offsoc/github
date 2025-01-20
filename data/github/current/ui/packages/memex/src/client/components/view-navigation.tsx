import {testIdProps} from '@github-ui/test-id-props'
import {CopyIcon, PlusIcon, ProjectIcon, ProjectRoadmapIcon, TableIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, TabNav} from '@primer/react'
import {forwardRef, memo, useCallback, useEffect, useRef} from 'react'

import {TabNavigationUI, ViewOptionsMenuUI} from '../api/stats/contracts'
import {ViewTypeParam} from '../api/view/contracts'
import {getInitialState} from '../helpers/initial-state'
import {shortcutFromEvent, SHORTCUTS} from '../helpers/keyboard-shortcuts'
import {scrollToChild} from '../helpers/scroll-to-child'
import {ViewerPrivileges} from '../helpers/viewer-privileges'
import {DragDropWithIdsContext, type OnDropWithIds, useDropWithIds} from '../hooks/drag-and-drop/drag-and-drop'
import {useElementIsOverflowing} from '../hooks/use-element-is-overflowing'
import {useMemexRootHeight} from '../hooks/use-memex-root-height'
import {useMultiRef} from '../hooks/use-multi-ref'
import {ViewOptionsStatsUiContext} from '../hooks/use-view-options-stats-ui-key'
import {useViews} from '../hooks/use-views'
import {isWebkit} from '../platform/user-agent'
import {useProjectRouteParams} from '../router/use-project-route-params'
import {PROJECT_VIEW_ROUTE} from '../routes'
import {useUserNotices} from '../state-providers/user-notices/user-notices-provider'
import {Resources} from '../strings'
import {PotentiallyDirty} from './potentially-dirty'
import {NavLinkWithoutActiveClassName} from './react-router/link-without-active-classname'
import {MemexIssueTypeRenamePopover} from './user-notices/memex-issue-type-rename-popover'
import {ViewOptionsMenu} from './view-options/menu'
import {ViewTab} from './view-tab'

interface ViewNavigationProps {
  projectViewId: string
  onFocusIntoCurrentView: () => void
}

export const ViewNavigation = (props: ViewNavigationProps) => (
  <DragDropWithIdsContext>
    <ViewNavigationInner {...props} />
  </DragDropWithIdsContext>
)

const ViewNavigationInner = memo(function ViewNavigationInner({
  projectViewId,
  onFocusIntoCurrentView,
}: ViewNavigationProps) {
  const {views, viewsMap, currentView, setCurrentViewNumber, updateViewPriority} = useViews()
  const {
    projectLimits: {viewsLimit},
  } = getInitialState()
  const {hasWritePermissions} = ViewerPrivileges()
  const {userNotices} = useUserNotices()
  const tabContainerRef = useRef<HTMLDivElement | null>(null)
  const viewOptionMenuTriggerRef = useRef<HTMLButtonElement>(null)
  const viewOptionMenuPlaceholderRef = useRef<HTMLDivElement | null>(null)
  const viewOptionMenuRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const isWebKit = isWebkit()

  const hideViewOptionsMenu = useCallback(() => {
    if (viewOptionMenuRef.current) {
      viewOptionMenuRef.current.style.display = 'none'
      viewOptionMenuRef.current.style.left = '0px'
    }
    if (viewOptionMenuPlaceholderRef.current) {
      viewOptionMenuPlaceholderRef.current.style.visibility = 'visible'
      viewOptionMenuPlaceholderRef.current.style.opacity = '1'
    }
  }, [])

  const showViewOptionsMenu = useCallback(() => {
    // We need to wait until the next tick to show the menu, so that final position of the placeholder is calculated.
    // Not sure why exactly, but for Safari, we need to use requestAnimationFrame to get the correct position,
    // whereas for Chrome and Safari, setTimeout gives the correct position.
    const onNextTick = isWebKit ? requestAnimationFrame : setTimeout
    onNextTick(() => {
      if (viewOptionMenuPlaceholderRef.current && viewOptionMenuRef.current && scrollContainerRef.current) {
        viewOptionMenuRef.current.style.display = 'flex'
        viewOptionMenuRef.current.style.left = `${
          scrollContainerRef.current.scrollLeft -
          scrollContainerRef.current.getBoundingClientRect().left +
          viewOptionMenuPlaceholderRef.current.getBoundingClientRect().left
        }px`
        viewOptionMenuPlaceholderRef.current.style.visibility = 'hidden'
        viewOptionMenuPlaceholderRef.current.style.opacity = '0'
      }
    })
  }, [isWebKit])

  // Update position of menu when views change
  // from a live update or a new view tab
  useEffect(() => {
    hideViewOptionsMenu()
    showViewOptionsMenu()
  }, [hideViewOptionsMenu, showViewOptionsMenu, views])

  // Update position of menu when views change on resize
  useMemexRootHeight({
    onResize: () => {
      hideViewOptionsMenu()
      showViewOptionsMenu()
    },
  })

  const onDrop = useCallback<OnDropWithIds<{id: number; number: number}>>(
    async ({dragMetadata, dropMetadata, side}) => {
      if (!hasWritePermissions || !dropMetadata || !dragMetadata) return

      const draggedView = viewsMap[dragMetadata.number]
      const indexOfDraggedView = views.findIndex(view => view.id === dragMetadata?.id)
      const indexOfDroppedView = views.findIndex(view => view.id === dropMetadata?.id)

      if (!draggedView || indexOfDraggedView === indexOfDroppedView) return

      /**
       When views that already exist are backfilled with priorities, they receive priorities in the reverse order
       in which they were originally placed.

       For example:
       1. views - [1, 2, 3, 4] (no priorities)
       2. backfill run
       3, prioritized_views - [4, 3, 2, 1]

       We return `prioritized_views.reversed` from the backend in the `memexViews` JSON island in order to maintain
       the same view order for clients before and after the backfill.

       This changes the interpretation of "previousMemexProjectViewId" on the front end

       For a list sorted in ascending order of priority, `previousMemexProjectViewId` is the ID of the view *before*
       which we want to insert the dragged view.

       For example: views on the front end = [1, 2, 3, 4]
       - To shift 1 to be between 3 and 4, `previousMemexProjectViewId` should be 4
       - To shift 1 to be the last item, `previousMemexProjectViewId` should be empty
      */

      // the view *before* which we want to drop the dragged view
      let targetView

      if (side === 'before') {
        targetView = views[indexOfDroppedView]
      } else if (side === 'after' && indexOfDroppedView !== views.length - 1) {
        targetView = views[indexOfDroppedView + 1]
      }

      if (draggedView.number === targetView?.number) return // if dragged view is moving to its own position
      // the view *currently* after the view being dragged view
      // This will be used to revert local state changes if the API call to update the priority fails
      const currentViewAfter = indexOfDraggedView !== views.length - 1 ? views[indexOfDraggedView + 1] : undefined

      await updateViewPriority(draggedView.number, targetView?.id || '', targetView?.number, currentViewAfter?.number)
      showViewOptionsMenu()
    },
    [hasWritePermissions, viewsMap, views, updateViewPriority, showViewOptionsMenu],
  )

  const drop = useDropWithIds({
    dropID: 'views',
    dropType: 'view',
    dropRef: tabContainerRef,
    onDrop,
  })

  const onSelectedTabKeyDown = useCallback<React.KeyboardEventHandler>(
    event => {
      if (shortcutFromEvent(event) === SHORTCUTS.ARROW_DOWN) {
        event.preventDefault()
        onFocusIntoCurrentView()
      }
    },
    [onFocusIntoCurrentView],
  )

  const tabRefs = useMultiRef<number, HTMLAnchorElement>()

  useEffect(() => {
    const currentTabLink = currentView && tabRefs(currentView.number).current
    const scrollContainer = scrollContainerRef.current

    if (currentTabLink && scrollContainer) scrollToChild(scrollContainer, currentTabLink, {direction: 'x'})
  }, [tabRefs, currentView])

  const setViewOptionsPlaceholderRef = useCallback(
    (viewOptionMenuPlaceholder: HTMLDivElement) => {
      viewOptionMenuPlaceholderRef.current = viewOptionMenuPlaceholder
      showViewOptionsMenu()
    },
    [showViewOptionsMenu],
  )

  return (
    <Box
      ref={scrollContainerRef}
      sx={{
        position: 'relative',
        overflowX: 'auto',
        overflowY: 'hidden',
        backgroundColor: 'canvas.inset',
        boxShadow: theme => `inset -1px -1px 0px 0px ${theme.colors.border.default}`,
      }}
    >
      <Box
        {...drop.props}
        ref={tabContainerRef}
        sx={{
          width: 'fit-content',
          pl: [3, 4, 5],
        }}
      >
        <TabNav
          aria-label="Select view"
          sx={{
            isolation: 'isolate',
            '& [role="tablist"]': {
              overflow: 'hidden',
            },
            '> nav': {
              borderBottom: 'none',
            },
            [`& .TabNav-item:not(.selected):not(:first-child):not(.TabNav-item.selected + .TabNav-item)::before`]: {
              content: '""',
              position: 'absolute',
              backgroundColor: 'border.muted',
              width: '1.5px',
              height: '19px',
              top: '50%',
              right: '100%',
              transform: 'translateY(-50%)',
            },
            [`& .TabNav-item.TabNav-item-truncate:not(.selected)::after`]: {
              content: "''",
              position: 'absolute',
              right: 1,
              top: '50%',
              width: '30px',
              height: '21px',
              transform: 'translateY(-50%)',
              backgroundImage: (theme: FixMeTheme) =>
                `linear-gradient(to right, transparent, ${theme.colors.canvas.inset} 75%, ${theme.colors.canvas.inset} 50%, ${theme.colors.canvas.inset} 25%)`,
            },
          }}
          {...testIdProps('tab-nav')}
        >
          {views.map(view => {
            const selected = view.number === currentView?.number
            return (
              <ViewNavigationTab
                key={view.number}
                ref={tabRefs(view.number)}
                selected={selected}
                projectViewId={projectViewId}
                onTabChange={(e: React.MouseEvent) => {
                  // prevent link from trigger navigation, as view state will do this, but show an href
                  e.preventDefault()
                  if (selected) return
                  setCurrentViewNumber(view.number, {ui: TabNavigationUI})
                  hideViewOptionsMenu()
                }}
                view={view}
                onKeyDown={selected ? onSelectedTabKeyDown : undefined}
                setViewOptionsPlaceholderRef={setViewOptionsPlaceholderRef}
                viewOptionMenuTriggerRef={viewOptionMenuTriggerRef}
                showViewOptionsMenu={showViewOptionsMenu}
                hideViewOptionsMenu={hideViewOptionsMenu}
              />
            )
          })}
          {hasWritePermissions && views.length < viewsLimit && <NewViewMenu />}
        </TabNav>
      </Box>
      {currentView ? (
        <Box
          sx={{
            position: 'absolute',
            top: '9px',
            left: 0,
            display: 'none',
          }}
          ref={viewOptionMenuRef}
          {...testIdProps('view-options-menu')}
        >
          <ViewOptionsStatsUiContext.Provider value={ViewOptionsMenuUI}>
            <ViewOptionsMenu
              viewOptionMenuTriggerRef={viewOptionMenuTriggerRef}
              view={currentView}
              showViewOptionsMenu={showViewOptionsMenu}
            />
          </ViewOptionsStatsUiContext.Provider>
          {userNotices.memex_issue_types_rename_prompt && <MemexIssueTypeRenamePopover anchorRef={viewOptionMenuRef} />}
        </Box>
      ) : null}
    </Box>
  )
})

const newViewButtonSx = {
  '&:hover': {color: 'fg.default'},
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  color: 'fg.muted',
  alignSelf: 'center',
  mr: [3, 4, 5],
}
function NewViewMenu() {
  const {createNewDefaultView, duplicateCurrentViewState, currentView} = useViews()

  return (
    <ActionMenu>
      <ActionMenu.Button
        {...testIdProps('view-navigation-create-new-view')}
        role="tab"
        sx={newViewButtonSx}
        variant="invisible"
        leadingVisual={PlusIcon}
        trailingAction={null}
      >
        New view
      </ActionMenu.Button>
      <ActionMenu.Overlay {...testIdProps('view-navigation-create-new-view-overlay')}>
        <ActionList>
          <ActionList.Group>
            <ActionList.GroupHeading>Layout</ActionList.GroupHeading>
            <ActionList.Item
              onSelect={() => createNewDefaultView({layout: ViewTypeParam.Table}, {ui: TabNavigationUI})}
            >
              <ActionList.LeadingVisual>
                <TableIcon />
              </ActionList.LeadingVisual>
              Table
            </ActionList.Item>
            <ActionList.Item
              onSelect={() => createNewDefaultView({layout: ViewTypeParam.Board}, {ui: TabNavigationUI})}
            >
              <ActionList.LeadingVisual>
                <ProjectIcon />
              </ActionList.LeadingVisual>
              Board
            </ActionList.Item>
            <ActionList.Item
              onSelect={() => createNewDefaultView({layout: ViewTypeParam.Roadmap}, {ui: TabNavigationUI})}
            >
              <ActionList.LeadingVisual>
                <ProjectRoadmapIcon />
              </ActionList.LeadingVisual>
              Roadmap
            </ActionList.Item>
          </ActionList.Group>
          {currentView ? (
            <>
              <ActionList.Divider />
              <ActionList.Item
                onSelect={() => {
                  duplicateCurrentViewState(currentView.number, undefined, {ui: TabNavigationUI})
                }}
              >
                <ActionList.LeadingVisual>
                  <CopyIcon />
                </ActionList.LeadingVisual>
                {Resources.duplicateView({isDirty: currentView.isViewStateDirty})}
              </ActionList.Item>
            </>
          ) : null}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

/**
 * A wrapper component that avoids passing sx to the rendered NavLink
 */
const TabNavLink = forwardRef(function TabNavLink(
  {
    sx,
    ...props
  }: React.ComponentProps<(typeof TabNav)['Link']> & React.ComponentProps<typeof NavLinkWithoutActiveClassName>,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  return <NavLinkWithoutActiveClassName {...props} ref={ref} />
})

interface ViewNavigationTabProps {
  selected: boolean
  onTabChange: React.MouseEventHandler
  view: ReturnType<typeof useViews>['views'][number]
  projectViewId: string
  viewOptionMenuTriggerRef: React.RefObject<HTMLButtonElement>
  setViewOptionsPlaceholderRef: (placeholder: HTMLDivElement) => void
  hideViewOptionsMenu: () => void
  showViewOptionsMenu: () => void
  onKeyDown?: React.KeyboardEventHandler
}

const ViewNavigationTab = forwardRef<HTMLAnchorElement, ViewNavigationTabProps>(function ViewNavigationTab(
  {
    selected,
    onTabChange,
    view,
    projectViewId,
    viewOptionMenuTriggerRef,
    setViewOptionsPlaceholderRef,
    hideViewOptionsMenu,
    showViewOptionsMenu,
    onKeyDown,
  },
  ref,
) {
  const {hasWritePermissions} = ViewerPrivileges()
  const tabRef = useRef<HTMLSpanElement>(null)

  /**
   *
   * We don't use react-router links here, since
   * view urls are currently managed from internal
   * state.
   */
  const isOverflowing = useElementIsOverflowing(tabRef)
  const projectRouteParams = useProjectRouteParams()
  return (
    <TabNav.Link
      ref={ref}
      className={isOverflowing && !selected ? 'TabNav-item-truncate' : ''}
      selected={selected}
      aria-selected={selected ? 'true' : undefined}
      as={TabNavLink}
      aria-controls={selected ? projectViewId : undefined}
      to={selected ? undefined : PROJECT_VIEW_ROUTE.generatePath({...projectRouteParams, viewNumber: view.number})}
      sx={{
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        margin: 0,
        flexGrow: 1,
        width: '200px',
        maxWidth: 'max-content',
        minWidth: selected ? 'min-content' : isOverflowing ? '140px' : undefined,
        px: 3,
        pr: selected ? undefined : 3,
      }}
      title={view.name}
      onKeyDown={onKeyDown}
      onClick={event => {
        // If any modifier keys are held, don't change the tab
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
        // If the primary mouse button is not clicked, don't change the tab
        if (event.button !== 0) return
        onTabChange(event)
      }}
      {...testIdProps('view-navigation-view-tab-link')}
    >
      <ViewTab
        ref={tabRef}
        view={view}
        selected={selected}
        viewOptionMenuTriggerRef={viewOptionMenuTriggerRef}
        hideViewOptionsMenu={hideViewOptionsMenu}
        showViewOptionsMenu={showViewOptionsMenu}
        setViewOptionsPlaceholderRef={setViewOptionsPlaceholderRef}
      />
      {view.isViewStateDirty && !selected && (
        <PotentiallyDirty
          key={`dirty-for-${view.number}`}
          isDirty
          hideDirtyState={!hasWritePermissions}
          sx={{top: '-5px', left: '-4px', zIndex: 1}}
        />
      )}
    </TabNav.Link>
  )
})
