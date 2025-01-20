import {noop} from '@github-ui/noop'
import {SidePanel as SidePanelComponent} from '@github-ui/side-panel'
import {testIdProps} from '@github-ui/test-id-props'
import {useKeyPress} from '@github-ui/use-key-press'
import {Box, PageLayout, useOverlay} from '@primer/react'
import {type ComponentProps, memo, useCallback, useMemo, useRef} from 'react'

import {SidePanelTypeParam} from '../../api/memex-items/side-panel-item'
import {shortcutFromEvent, SHORTCUTS} from '../../helpers/keyboard-shortcuts'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useReturnFocus} from '../../hooks/common/use-return-focus'
import {useRootOffsetY} from '../../hooks/use-root-offset-y'
import {type SidePanelState, useSidePanel} from '../../hooks/use-side-panel'
import {useSiteHeaderHeight} from '../../hooks/use-site-header-height'
import {Resources} from '../../strings'
import {SidePanelContent} from './content'

interface SidePanelProps {
  mainAppContent: React.ReactNode
}

export const SidePanel = memo(function SidePanel({mainAppContent}: SidePanelProps) {
  const {closePane, sidePanelState, isPaneOpened, supportedItemTypes, pinned, containerRef, initialFocusRef} =
    useSidePanel()

  const isOpen =
    (isPaneOpened &&
      sidePanelState &&
      (sidePanelState.type !== SidePanelTypeParam.ISSUE || supportedItemTypes.has(sidePanelState.item.contentType))) ??
    false

  const content = sidePanelState && (
    <Box ref={containerRef} sx={{display: 'contents'}}>
      {/* It's not great to start focus at a useless unlabeled element - much better would be the side panel heading.
      But the new issue viewer shows a skeleton when loading, so there's initially nothing to focus. And we'd have to
      then shift focus to the heading once the content loads, which would be annoying and unexpected. So instead we
      focus this empty element, which at least guarantees that we have a focusable target and that screen readers will
      announce the panel label. Also note we don't want to focus the close button because users will want to press
      space to scroll down in long panel contents and that will close the panel. */}
      <span tabIndex={-1} ref={initialFocusRef} {...testIdProps('side-panel-focus-target')} />

      <SidePanelContent sidePanelState={sidePanelState} />
    </Box>
  )

  const label = buildSidePanelLabel(sidePanelState)

  const onEscape = useCallback(
    (e: Pick<Event, 'target'>) => {
      let isSiteSearchEscapeEvent = false
      if (e.target && e.target instanceof Element) {
        isSiteSearchEscapeEvent = e.target.classList.contains('js-site-search-field')
      }

      const noActivePickers = document.querySelectorAll('.omnibar-picker.visible').length === 0

      if (noActivePickers && !isSiteSearchEscapeEvent) closePane()
    },
    [closePane],
  )

  // Always rendering (but hiding) both the modal and the docked pane ensures that animations work and performance is
  // maximized when pinning/unpinning
  // Conditionally rendering the children helps avoid unnecessary re-renders of the hidden, memoized one, and
  // unnecessary HTML in the DOM
  return (
    <>
      <DockedSidePanel
        open={isOpen && pinned}
        mainAppContent={mainAppContent}
        label={label}
        initialFocusRef={initialFocusRef}
        onEscape={onEscape}
      >
        {isOpen && pinned && content}
      </DockedSidePanel>
      <OverlaySidePanel
        open={isOpen && !pinned}
        label={label}
        onEscape={onEscape}
        contentType={sidePanelState?.type}
        initialFocusRef={initialFocusRef}
      >
        {isOpen && !pinned && content}
      </OverlaySidePanel>
    </>
  )
})

interface DockedSidePanelProps {
  mainAppContent: React.ReactNode
  children: React.ReactNode
  open: boolean
  label: string
  initialFocusRef: React.RefObject<HTMLElement>
  onEscape: (e: KeyboardEvent) => void
}

/**
 * Try to focus a ref, falling back to another ref if necessary. Avoids focusing unmounted elements.
 */
const tryFocus = (...refs: Array<React.RefObject<HTMLElement | null>>) => {
  for (const {current} of refs)
    if (current && document.body.contains(current)) {
      current.focus()
      return
    }
}

const DockedSidePanel = memo(function DockedSidePanel({
  mainAppContent,
  children,
  open,
  label,
  initialFocusRef,
  onEscape,
}: DockedSidePanelProps) {
  const {postStats} = usePostStats()
  const memexAppOffsetY = useRootOffsetY()

  const returnFocusOutRef = useRef<HTMLElement | null>(null)
  const returnFocusInRef = useRef<HTMLElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const onFocus = useCallback((event: React.FocusEvent) => {
    const from = event.relatedTarget
    const container = event.currentTarget
    const element = event.target

    if (element instanceof HTMLElement) returnFocusInRef.current = element

    if (!container.contains(from) && from instanceof HTMLElement) {
      // focus is entering the region
      returnFocusOutRef.current = from

      // try to return focus to where it was before, if possible
      tryFocus(returnFocusInRef)
    }
  }, [])

  useReturnFocus(open, returnFocusOutRef)

  // Listen for ctrl+f6 shortcut (consistent with Slack app) to move focus to/from the side panel
  useKeyPress(
    ['F6'],
    event => {
      event.preventDefault()

      // be careful not to focus things that aren't in the document
      if (containerRef.current?.contains(document.activeElement)) {
        tryFocus(returnFocusOutRef)
        // there's no good fallback for the main content, but it also shouldn't ever be necessary
        postStats({name: 'region_focus', context: 'target: main'})
      } else {
        tryFocus(returnFocusInRef, initialFocusRef)
        postStats({name: 'region_focus', context: 'target: side panel'})
      }
    },
    {
      ctrlKey: true,
      triggerWhenInputElementHasFocus: true,
      triggerWhenPortalIsActive: false,
    },
  )

  // The docked panel is not an overlay so this is a lie, but `useOverlay` will register it onto the global overlay
  // stack that Primer maintains. This allows it to work well with other actual overlays, preventing us from closing
  // the panel if for example, a picker is open, because Primer will not call `onEscape` if there is another overlay
  // that was opened after this one. We can't just use regular DOM event bubbling (where we'd call `stopPropagation`
  // in the child overlay) because overlays are all rendered into a root portal. Once overlays all use the Popover API
  // this won't be necessary.
  const nullRef = useRef(null)
  useOverlay({overlayRef: nullRef, returnFocusRef: nullRef, onEscape, onClickOutside: noop})

  return (
    <PageLayout
      containerWidth="full"
      padding="none"
      columnGap="none"
      rowGap="none"
      sx={{
        width: '100%',
        // contain resizer z-index so it doesn't appear over portal overlays
        isolation: 'isolate',
        // without explicit height, table view wants to shrink and only fill part of screen
        height: `calc(100vh - ${memexAppOffsetY}px)`,
        '& > div': {
          height: '100%',
        },
      }}
    >
      <PageLayout.Content
        sx={{
          // contain z-indexes inside main content so nothing appears above resizer
          isolation: 'isolate',
          // only matters when layout is vertical on very small screens
          minHeight: '50vh',
        }}
      >
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>{mainAppContent}</Box>
      </PageLayout.Content>
      <PageLayout.Pane
        sticky
        resizable
        hidden={!open}
        width="large"
        widthStorageKey="projects.sidePanelWidth"
        aria-label={label}
        sx={{
          '& > :nth-child(2)': {
            // Buckle up! This is where it gets complicated 🧠
            //
            // pane-min-width is the CSS variable that controls the minimum width of the pane.Since the pane is by
            // default very small (because the component was designed for menus, not side panels), this also sets
            // the initial width of the pane.
            //
            // pane-max-width-diff is actually the minimum width of the main content
            //
            // By setting them to ideal values of 33vw, we allow the user to resize between 1/3 and 2/3 of the width
            // of the page. This is usually decent, but on _very_ wide screens it would be frustrating not to have a
            // wider range - ie, if you have an ultrawide monitor you may want to only have the side panel take 1/10
            // of it. So we add max values. In addition, on very small screens 33vw is too small - it never makes sense
            // to let the side panel be smaller than around 350px because it just starts to break down. Same for the
            // main content. So we also assign minimum values.
            //
            // An important caveat is that the layout automatically goes from horizontal to vertical at 750px. So if
            // our minimums sum to more than 750px, there will be invalid states where the pane is stuck and not
            // resizable - something has to give at that point and either the pane or main content will end up smaller
            // than we intended to allow.
            '--pane-min-width': 'clamp(350px, 33vw, 500px)',
            '--pane-max-width-diff': 'clamp(350px, 33vw, 1000px)',
          },
          // hack to select the divider container
          '& > :nth-child(3)': {
            width: '3px',
            zIndex: 5, // make resizer appear above main & aside for wider drag handle zone
            "& > [role='slider']": {
              inset: '0 -3px', // negative offset causes separator to overflow container, increasing click zone
            },
          },
        }}
        divider="line"
      >
        <Box
          as="aside"
          aria-label={label}
          sx={{
            // contain z-indexes inside side panel so nothing appears above resizer
            isolation: 'isolate',
          }}
          onFocus={onFocus}
          tabIndex={-1}
          ref={containerRef}
        >
          {children}
        </Box>
      </PageLayout.Pane>
    </PageLayout>
  )
})

interface OverlaySidePanelProps {
  children: React.ReactNode
  open: boolean
  label: string
  onEscape: (event: Parameters<ComponentProps<typeof SidePanelComponent>['onClose']>[0]) => void
  contentType: SidePanelTypeParam | undefined
  initialFocusRef: React.RefObject<HTMLElement>
}

const OverlaySidePanel = memo(function OverlaySidePanel({
  children,
  open,
  label,
  onEscape,
  contentType,
  initialFocusRef,
}: OverlaySidePanelProps) {
  const siteHeaderHeight = useSiteHeaderHeight()
  // unused but required by the Overlay component
  const returnFocusRef = useRef(null)

  /* Cache the width to avoid flashing to full-width when transitioning to unload the side panel */
  const prevSidePanelWidth = useRef<string | undefined>()
  const sidePanelWidth = useMemo(() => {
    switch (contentType) {
      case SidePanelTypeParam.ISSUE:
        return (prevSidePanelWidth.current = 'min(90%, 1280px)')
      case SidePanelTypeParam.INFO:
        return (prevSidePanelWidth.current = '580px')
      case SidePanelTypeParam.BULK_ADD:
        return (prevSidePanelWidth.current = '60%')
      default:
        return prevSidePanelWidth.current
    }
  }, [contentType])

  const preventShortcutBubbling = useCallback((e: React.KeyboardEvent) => {
    const shortcut = shortcutFromEvent(e)
    // Prevent all known shortcuts from bubbling through to the table underneath
    // Don't prevent escape from bubbling to the Primer handler
    if (shortcut !== SHORTCUTS.ESCAPE && Object.values(SHORTCUTS).includes(shortcut)) e.stopPropagation()
  }, [])

  return (
    <SidePanelComponent
      open={open}
      onClose={onEscape}
      returnFocusRef={returnFocusRef}
      topOffset={siteHeaderHeight}
      onKeyDown={preventShortcutBubbling}
      width={sidePanelWidth}
      aria-label={label}
      initialFocusRef={initialFocusRef}
      defaultCloseElement="first-child"
    >
      {children}
    </SidePanelComponent>
  )
})

/**
 * Create a side panel label string for accessible region labelling. The result should be consistent in format so the
 * region is easy to find, but should also reflect the contents of the panel.
 */
function buildSidePanelLabel(state: SidePanelState) {
  const parts = [Resources.sidePanelRegionNameLabel]

  switch (state?.type) {
    case SidePanelTypeParam.INFO:
      parts.push(Resources.sidePanelProjectInfoLabel)
      break
    case SidePanelTypeParam.BULK_ADD:
      parts.push(Resources.sidePanelBulkAddLabel)
      break
    case SidePanelTypeParam.ISSUE:
      parts.push(Resources.itemType(state.item.contentType), state.item.getRawTitle())
  }

  return parts.join(': ')
}
