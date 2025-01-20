import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {testIdProps} from '@github-ui/test-id-props'
import {useIgnoreKeyboardActionsWhileComposing} from '@github-ui/use-ignore-keyboard-actions-while-composing'
import {useSyncedState} from '@github-ui/use-synced-state'
import {DownloadIcon, GraphIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, FormControl, TextInput} from '@primer/react'
import {Dialog} from '@primer/react/drafts'
import {memo, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react'
import {flushSync} from 'react-dom'

import {ViewOptionsMenuUI} from '../../api/stats/contracts'
import {ViewTypeParam} from '../../api/view/contracts'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {useEmojiAutocomplete} from '../../hooks/common/use-emoji-autocomplete'
import {useDownloadView} from '../../hooks/use-download-view'
import {useIsCommandPaletteVisible} from '../../hooks/use-is-command-palette-visible'
import {useMemexProjectViewRootHeight} from '../../hooks/use-memex-app-root-height'
import type {BaseViewState, ViewIsDirtyStates} from '../../hooks/use-view-state-reducer/types'
import {useViews} from '../../hooks/use-views'
import {useInsightsEnabledFeatures} from '../../pages/insights/hooks/use-insights-features'
import {Link} from '../../router'
import {useProjectRouteParams} from '../../router/use-project-route-params'
import {PROJECT_INSIGHTS_ROUTE} from '../../routes'
import {useUserNotices} from '../../state-providers/user-notices/user-notices-provider'
import {useViewOptionsMenuRef} from '../../state-providers/view-options/use-view-options-menu-ref'
import {Resources} from '../../strings'
import {useSearch} from '../filter-bar/search-context'
import {ConfigurationItemMenus, ConfigurationItems} from './configuration-items'
import {LayoutToggle} from './layout-toggle'
import {MenuAnchor} from './menu-anchor'
import {RoadmapUserSettingsMenu} from './roadmap-user-settings'
import {ViewActionItems} from './view-action-items'
import {ViewChangeButtons} from './view-changes-button'

type ViewOptionsMenuProps = {
  view: BaseViewState & ViewIsDirtyStates
  viewOptionMenuTriggerRef?: React.RefObject<HTMLButtonElement | null>
  showViewOptionsMenu?: () => void
}

const viewOptionsMenuOverlaySx = {overflow: 'auto'}
export const ViewOptionsMenu = memo(function ViewOptionsMenu({
  view,
  viewOptionMenuTriggerRef,
  showViewOptionsMenu,
}: ViewOptionsMenuProps) {
  const {hideUserNotice} = useUserNotices()

  const [open, setOpen] = useState(false)
  const [showSubMenu, setShowSubMenu] = useState<
    | null
    | 'Fields'
    | 'Sort by'
    | 'Group by'
    | 'Column by'
    | 'Field sum'
    | 'Dates'
    | 'Zoom level'
    | 'rename-view'
    | 'Marker fields'
    | 'Slice by'
  >(null)
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

  const {query} = useSearch()

  const {views, currentView, duplicateCurrentViewState, destroyCurrentView} = useViews()

  const {hasWritePermissions} = ViewerPrivileges()
  const {isInsightsChartViewEnabled} = useInsightsEnabledFeatures()
  const {anchorRef} = useViewOptionsMenuRef()
  const configRef = useRef<HTMLLIElement | null>(null)

  useEffect(() => {
    if (!open) return
    setShowSubMenu(null)
  }, [open])

  const handleDestroyView = useCallback(async () => {
    destroyCurrentView(
      view.number,
      {
        ui: ViewOptionsMenuUI,
      },
      () => {
        setOpen(false)
        anchorRef.current?.focus()
      },
    )
  }, [destroyCurrentView, view.number, anchorRef])

  const handleDuplicateView = useCallback(async () => {
    if (!currentView) return
    await duplicateCurrentViewState(currentView.number, undefined, {
      ui: ViewOptionsMenuUI,
    })
    setOpen(false)
  }, [currentView, duplicateCurrentViewState])

  const handleRenameViewClick = useCallback(() => {
    setOpen(false)
    setShowSubMenu('rename-view')
  }, [])

  useImperativeHandle(viewOptionMenuTriggerRef, () => anchorRef.current)

  const {isCommandPaletteVisible} = useIsCommandPaletteVisible()

  const downloadView = useDownloadView()
  const projectRouteParams = useProjectRouteParams()
  return (
    <Box sx={{position: 'relative'}}>
      <MenuAnchor
        ref={anchorRef}
        onClick={() => {
          // Hide any notices which might be anchored to the view options menu trigger
          hideUserNotice('memex_issue_types_rename_prompt')
          setOpen(s => !s)
        }}
        viewName={view.name}
        open={open}
      />
      <ActionMenu
        anchorRef={anchorRef}
        open={open && !isCommandPaletteVisible}
        onOpenChange={useCallback((nextOpen: boolean): void => setOpen(nextOpen), [])}
      >
        <ActionMenu.Overlay
          {...testIdProps('view-options-menu-modal')}
          width="medium"
          sx={viewOptionsMenuOverlaySx}
          style={{
            maxHeight: clientHeight,
          }}
        >
          <LayoutToggle view={view} setOpen={setOpen} />
          <ActionList sx={{pt: 0}}>
            <ActionList.Divider />
            <ConfigurationItems
              selectedOption={showSubMenu === 'rename-view' ? null : showSubMenu}
              onSelect={option => {
                setShowSubMenu(option)
              }}
              ref={configRef}
            />
            <ConfigurationItemMenus
              anchorRef={configRef}
              currentMenu={showSubMenu === 'rename-view' ? null : showSubMenu}
              setShowSubMenu={setShowSubMenu}
            />
            {view.localViewState.layout === ViewTypeParam.Roadmap ? (
              <>
                <ActionList.Divider />
                <ActionList.Group selectionVariant="multiple">
                  <ActionList.GroupHeading>User settings</ActionList.GroupHeading>
                  <RoadmapUserSettingsMenu />
                </ActionList.Group>
              </>
            ) : null}

            {isInsightsChartViewEnabled ? (
              <>
                <ActionList.Divider />
                <ActionList.Group>
                  <ActionList.LinkItem
                    as={Link}
                    {...testIdProps('view-options-menu-item-show-insights')}
                    to={{
                      pathname: PROJECT_INSIGHTS_ROUTE.generatePath(projectRouteParams),
                      search: query
                        ? `${new URLSearchParams({
                            filterQuery: query,
                          })}`
                        : undefined,
                    }}
                  >
                    <ActionList.LeadingVisual>
                      <GraphIcon />
                    </ActionList.LeadingVisual>
                    Generate chart
                  </ActionList.LinkItem>
                </ActionList.Group>
              </>
            ) : null}

            {hasWritePermissions ? (
              <>
                <ActionList.Divider />
                <ViewActionItems
                  handleRenameViewClick={handleRenameViewClick}
                  handleDuplicateView={handleDuplicateView}
                  handleDestroyView={handleDestroyView}
                  viewsLength={views.length}
                  view={view}
                />
              </>
            ) : null}

            <ActionList.Divider />
            <ActionList.Item onSelect={downloadView}>
              <ActionList.LeadingVisual>
                <DownloadIcon />
              </ActionList.LeadingVisual>
              Export view data
            </ActionList.Item>

            {view.isViewStateDirty ? (
              <>
                <ActionList.Divider />
                <ActionList.Group sx={{'& > ul': {display: 'flex'}}}>
                  <ViewChangeButtons setOpen={setOpen} view={view} />
                </ActionList.Group>
              </>
            ) : null}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      {currentView ? (
        <RenameViewMenu
          key={view.id}
          anchorRef={anchorRef}
          open={showSubMenu === 'rename-view'}
          setOpen={(nextOpen: boolean) => setShowSubMenu(() => (nextOpen ? 'rename-view' : null))}
          view={currentView}
          showViewOptionsMenu={showViewOptionsMenu}
        />
      ) : null}
    </Box>
  )
})

const stopPropagation: React.MouseEventHandler<HTMLInputElement> = e => {
  e.stopPropagation()
}
/**
 * The control used in the roadmap view to specify the zoom level used in the view.
 */
const RenameViewMenu = memo<{
  open: boolean
  setOpen: (next: boolean) => void
  anchorRef: React.RefObject<HTMLElement>
  view: BaseViewState & ViewIsDirtyStates
  showViewOptionsMenu?: () => void
}>(function RenameViewMenu({open, setOpen, anchorRef, view, showViewOptionsMenu}) {
  const {renameView} = useViews()
  const [localViewName, setLocalViewName] = useSyncedState(view.name)
  const {hasWritePermissions} = ViewerPrivileges()
  const inputRef = useRef<HTMLInputElement>(null)

  const resetViewName = useCallback(() => {
    setLocalViewName(view.name)
  }, [setLocalViewName, view.name])

  const autocompleteProps = useEmojiAutocomplete()
  const onKeyDown = useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      switch (event.key) {
        case 'Enter': {
          if (localViewName.trim().length > 0 && localViewName !== view.name) {
            await renameView(view.number, localViewName, {
              ui: ViewOptionsMenuUI,
            })
            setOpen(false)
            showViewOptionsMenu?.()
          }

          event.preventDefault()
          break
        }

        case 'Escape': {
          resetViewName()
          break
        }
      }
    },
    [localViewName, view.name, view.number, renameView, setOpen, showViewOptionsMenu, resetViewName],
  )
  const inputCompositionProps = useIgnoreKeyboardActionsWhileComposing(onKeyDown)

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalViewName(e.target.value)
    },
    [setLocalViewName],
  )

  useEffect(
    function focusInputOnOpen() {
      if (open) {
        setTimeout(() => inputRef.current?.focus())
      }
    },
    [open],
  )

  if (!open) return null

  return (
    <Dialog
      title="Rename view"
      width="small"
      onClose={() => {
        setOpen(false)
        // When the dialog is closed, re-focus the anchor element to ensure that the focus is not lost
        setTimeout(() => anchorRef.current?.focus())
      }}
      footerButtons={[
        {
          content: Resources.cancelChanges,
          onClick: e => {
            e.preventDefault()
            resetViewName()
            setOpen(false)
          },
        },
        {
          content: Resources.saveChanges,
          buttonType: 'primary',
          onClick: async e => {
            e.preventDefault()
            if (localViewName.trim().length === 0 || localViewName === view.name) return
            await renameView(view.number, localViewName, {
              ui: ViewOptionsMenuUI,
            })
            setOpen(false)
            showViewOptionsMenu?.()
          },
        },
      ]}
    >
      <FormControl>
        <FormControl.Label>View name</FormControl.Label>
        <InlineAutocomplete {...autocompleteProps} fullWidth>
          <TextInput
            ref={inputRef}
            block
            autoComplete="off"
            value={localViewName}
            onChange={onChange}
            onMouseDown={stopPropagation}
            disabled={!hasWritePermissions || view.isDeleted}
            {...inputCompositionProps}
          />
        </InlineAutocomplete>
        {localViewName.trim().length === 0 ? (
          <FormControl.Validation variant="error">{Resources.viewNameRequired}</FormControl.Validation>
        ) : null}
      </FormControl>
    </Dialog>
  )
})

export default ViewOptionsMenu
