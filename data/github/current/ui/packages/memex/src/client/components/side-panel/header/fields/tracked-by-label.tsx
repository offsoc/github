import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {ActionList, ActionMenu, Box, Label, Link, Text} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {type MouseEvent, useEffect, useRef, useState} from 'react'
import {flushSync} from 'react-dom'

import type {IssueState, IssueStateReason} from '../../../../api/common-contracts'
import type {ItemTrackedByParent} from '../../../../api/issues-graph/contracts'
import {useElementSizes} from '../../../../hooks/common/use-element-sizes'
import {useMemexProjectViewRootHeight} from '../../../../hooks/use-memex-app-root-height'
import {type HistoryItem, useSidePanel} from '../../../../hooks/use-side-panel'
import {createHierarchySidePanelHistoryItem} from '../../../../state-providers/tracked-by-items/tracked-by-helpers'
import {TrackedByResources} from '../../../../strings'
import {ItemState} from '../../../item-state'

type SidePanelTrackedByItem = ItemTrackedByParent & {titleHtml: string}

type TrackedByLabelProps = Readonly<{
  currentValue: Array<SidePanelTrackedByItem>
}>

type TrackedByItemProps = Readonly<{
  title?: string
  displayNumber?: number
  itemId?: number
  state: IssueState
  stateReason?: IssueStateReason
  url: string
  onClick?: (event: MouseEvent<HTMLElement>) => void
}>

type TrackedByLabelContentProps = Readonly<{
  showElipsis: boolean
  children?: JSX.Element | Array<JSX.Element>
}>

const MIN_VISIBLE_ITEMS = 2

const sizerStyle: BetterSystemStyleObject = {position: 'relative'}

const defaultCurrentValue: Array<SidePanelTrackedByItem> = []
export const TrackedByLabel: React.FC<TrackedByLabelProps> = ({currentValue = defaultCurrentValue}) => {
  const [isUserInteractionOverLabel, setIsUserInteractionOverLabel] = useState(false)
  const [isActionMenuVisible, setIsActionMenuVisible] = useState(false)
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const {openPaneHistoryItem} = useSidePanel()
  const sizes = useElementSizes(container)

  const itemsRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)

  const toggleMouseOver = () => setIsUserInteractionOverLabel(!isUserInteractionOverLabel)
  const showElipsis = (currentValue.length > MIN_VISIBLE_ITEMS && !isUserInteractionOverLabel) || isActionMenuVisible
  const showHorizontalItems = isUserInteractionOverLabel && !isActionMenuVisible
  const minVisibleItems = currentValue.slice(0, MIN_VISIBLE_ITEMS)
  const visibleItems = showHorizontalItems ? currentValue : minVisibleItems

  const {clientHeight} = useMemexProjectViewRootHeight({
    onResize: () => {
      if (!isActionMenuVisible) return
      flushSync(() => {
        setIsActionMenuVisible(false)
      })
      setIsActionMenuVisible(true)
    },
  })

  useEffect(() => {
    if (!itemsRef.current) return

    const rect = itemsRef.current.getBoundingClientRect()
    const outOfBounds = rect.right > (window.innerWidth || document.documentElement.clientWidth)
    if (!isActionMenuVisible) setIsActionMenuVisible(outOfBounds)
  }, [isActionMenuVisible, isUserInteractionOverLabel])

  return currentValue.length ? (
    <div ref={anchorRef}>
      <Box sx={sizerStyle} ref={setContainer} style={{width: sizes.clientWidth}}>
        <Label
          as="div"
          onMouseEnter={toggleMouseOver}
          onMouseLeave={toggleMouseOver}
          ref={itemsRef}
          size="large"
          sx={isUserInteractionOverLabel && !isActionMenuVisible ? {...labelStyle, ...hoverStyle} : labelStyle}
          {...testIdProps('tracked-by-label')}
        >
          <TrackedByLabelContent showElipsis={showElipsis}>
            <TrackedByItems items={visibleItems} />
          </TrackedByLabelContent>
        </Label>
        <ActionMenu anchorRef={anchorRef} open={isActionMenuVisible} onOpenChange={noop}>
          <ActionMenu.Overlay
            sx={{width: `${400 - 24 * 2 + 1}px`, maxHeight: clientHeight, overflow: 'auto'}}
            onEscape={() => setIsActionMenuVisible(false)}
            onClickOutside={() => setIsActionMenuVisible(false)}
          >
            <ActionList>
              <ActionList.Group>
                {currentValue.map(value => (
                  <ActionList.LinkItem
                    href={value.url}
                    key={value.itemId}
                    onClick={openSidePanel(value, openPaneHistoryItem)}
                    rel="noreferer"
                    role="button"
                    target="_blank"
                  >
                    <TrackedByMenuItem
                      title={`Tracking: ${value.title}`}
                      displayNumber={value.displayNumber}
                      state={value.state}
                      stateReason={value.stateReason}
                      url={value.url}
                    />
                  </ActionList.LinkItem>
                ))}
              </ActionList.Group>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </Box>
    </div>
  ) : null
}

const openSidePanel = (item: SidePanelTrackedByItem, openPaneHistoryItem: (item: HistoryItem) => void) => {
  const historyItem = createHierarchySidePanelHistoryItem(item)

  return (e: MouseEvent<HTMLElement>) => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (e.ctrlKey || e.metaKey || !historyItem.item) return

    e.preventDefault()
    openPaneHistoryItem(historyItem)
  }
}

const TrackedByItems: React.FC<{items: Array<SidePanelTrackedByItem>}> = ({items}) => {
  const {openPaneHistoryItem} = useSidePanel()

  return (
    <>
      {items.map((value, i) => {
        return (
          <TrackedByLink
            key={value.itemId}
            onClick={openSidePanel(value, openPaneHistoryItem)}
            title={`#${value.displayNumber}${items.length > 1 && i !== items.length - 1 ? ',' : ''}`}
            state={value.state}
            stateReason={value.stateReason}
            url={value.url}
            itemId={value.itemId}
          />
        )
      })}
    </>
  )
}

const TrackedByLink: React.FC<TrackedByItemProps> = ({title, state, stateReason, url, itemId, ...rest}) => (
  <Link
    {...rest}
    target="_blank"
    rel="noreferer"
    href={url}
    role="button"
    data-hovercard-type="issue"
    data-hovercard-url={`${url}/hovercard`}
    {...testIdProps(`tracked-by-label-${itemId}`)}
  >
    <ItemState state={state} stateReason={stateReason} type="Issue" isDraft={false} />
    <Text as="span" sx={{color: 'fg.muted', fontSize: 0, mx: 1}}>
      {title}
    </Text>
  </Link>
)

const TrackedByMenuItem: React.FC<TrackedByItemProps> = ({displayNumber, title, state, stateReason, url, ...rest}) => (
  <Box sx={{display: 'flex'}} {...rest}>
    <ItemState state={state} stateReason={stateReason} type="Issue" isDraft={false} />
    <Text as="span" sx={{color: 'fg.default', fontSize: 0, mx: 1}}>
      {title}
    </Text>
    <Text as="span" sx={{color: 'fg.muted', fontSize: 0, mx: 1, flexGrow: 1, textAlign: 'end'}}>
      {`#${displayNumber}`}
    </Text>
  </Box>
)

const TrackedByLabelContent: React.FC<TrackedByLabelContentProps> = ({showElipsis, children}) => {
  const {trackedBy} = TrackedByResources

  return (
    <>
      <Text as="span" sx={{color: 'fg.muted', fontSize: 0, mr: 1}}>
        {trackedBy}
      </Text>
      {children}
      {showElipsis && (
        <Text as="span" sx={{color: 'fg.muted'}}>
          ...
        </Text>
      )}
    </>
  )
}

const labelStyle = {
  backgroundColor: 'canvas.subtle',
  color: 'fg.muted',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  p: '4px 12px',
  overflow: 'hidden',
  textAlign: 'left',
}

const hoverStyle = {
  position: 'absolute',
  zIndex: 1,
  top: 0,
  bottom: 0,
  margin: '-12px 0',
}
