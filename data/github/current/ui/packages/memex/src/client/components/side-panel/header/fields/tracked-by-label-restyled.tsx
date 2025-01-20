import {testIdProps} from '@github-ui/test-id-props'
import {useHovercardClickIntercept} from '@github-ui/use-link-interception/use-hovercard-click-intercept'
import {ChevronRightIcon, IssueTrackedByIcon} from '@primer/octicons-react'
import {Label, Link, Octicon, Text} from '@primer/react'
import type {MouseEvent as ReactMouseEvent} from 'react'

import type {IssueState, IssueStateReason} from '../../../../api/common-contracts'
import type {ItemTrackedByParent} from '../../../../api/issues-graph/contracts'
import {type HistoryItem, useSidePanel} from '../../../../hooks/use-side-panel'
import {createHierarchySidePanelHistoryItem} from '../../../../state-providers/tracked-by-items/tracked-by-helpers'
import {TrackedByResources} from '../../../../strings'
import {ItemState} from '../../../item-state'

type SidePanelTrackedByItem = ItemTrackedByParent & {titleHtml: string}

type TrackedByLabelProps = Readonly<{
  issueId?: number
  items: Array<SidePanelTrackedByItem>
  url: string | undefined
}>

type TrackedByItemProps = Readonly<{
  title?: string
  displayNumber?: number
  issueId?: number
  itemId?: number
  state: IssueState
  stateReason?: IssueStateReason
  trackedByTitle?: string
  url: string
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void
}>

type TrackedByLabelContentProps = Readonly<{
  children?: JSX.Element | Array<JSX.Element>
}>

export const RestyledTrackedByLabel: React.FC<TrackedByLabelProps> = ({issueId, items, url}) => {
  return items.length ? (
    <Label as="div" size="large" sx={labelStyle} {...testIdProps('tracked-by-label')}>
      <TrackedByLabelContent>
        <TrackedByItems issueId={issueId} items={items} url={url} />
      </TrackedByLabelContent>
    </Label>
  ) : null
}

const openSidePanel = (item: SidePanelTrackedByItem, openPaneHistoryItem: (item: HistoryItem) => void) => {
  const historyItem = createHierarchySidePanelHistoryItem(item)

  return (e: ReactMouseEvent<HTMLElement> | MouseEvent) => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (e.ctrlKey || e.metaKey || !historyItem.item) return

    e.preventDefault()
    openPaneHistoryItem(historyItem)
  }
}

const TrackedByItems: React.FC<TrackedByLabelProps> = ({issueId, items, url}) => {
  const {openPaneHistoryItem} = useSidePanel()

  if (!items.length || !items[0]) return null

  if (items.length > 1) {
    return <TrackedByAnchor items={items} url={url} />
  }

  const item = items[0]

  return (
    <TrackedByLink
      onClick={openSidePanel(item, openPaneHistoryItem)}
      title={`${item.title}`}
      displayNumber={item.displayNumber}
      trackedByTitle={item.trackedByTitle}
      state={item.state}
      stateReason={item.stateReason}
      url={item.url}
      issueId={issueId}
      itemId={item.itemId}
    />
  )
}

const TrackedByAnchor: React.FC<TrackedByLabelProps> = ({items, url}) => {
  const {openPaneHistoryItem} = useSidePanel()
  const hovercardUrl = `${url}/tracked_in/hovercard`

  useHovercardClickIntercept((targetUrl, event) => {
    if (targetUrl !== hovercardUrl) return

    const link = (event.target as HTMLElement).closest('a')
    if (!link) return

    const item = items.find(i => new URL(i.url).pathname === link.pathname)
    if (!item) return

    openSidePanel(item, openPaneHistoryItem)(event)
  })

  return (
    <Text as="span" data-hovercard-type="tracked_in" data-hovercard-url={hovercardUrl} sx={trackedByStyle}>
      <Octicon icon={IssueTrackedByIcon} sx={{color: 'fg.muted'}} />
      <Text as="span" sx={{...trackedByTextStyle, color: 'fb.muted'}}>
        {`${items.length}${' '}${TrackedByResources.trackingIssues}`}
      </Text>
    </Text>
  )
}

const TrackedByLink: React.FC<TrackedByItemProps> = ({
  trackedByTitle,
  displayNumber,
  title,
  state,
  stateReason,
  url,
  issueId,
  itemId,
  ...rest
}) => (
  <Link
    {...rest}
    target="_blank"
    rel="noreferer"
    href={url}
    role="button"
    data-hovercard-type="tracking"
    data-hovercard-url={url && issueId ? `${url}/tracking/${issueId}/hovercard` : undefined}
    sx={trackedByStyle}
    {...testIdProps(`tracked-by-label-${itemId}`)}
  >
    <ItemState state={state} stateReason={stateReason} type="Issue" isDraft={false} />
    <Text as="span" sx={trackedByTextStyle}>
      {title}
    </Text>
    <Text
      as="span"
      sx={{
        ...trackedByTextStyle,
        color: 'fg.muted',
        fontWeight: '400',
        px: 0,
      }}
    >
      {displayNumber}
      <ChevronRightIcon size={12} />
      {trackedByTitle}
    </Text>
  </Link>
)

const TrackedByLabelContent: React.FC<TrackedByLabelContentProps> = ({children}) => {
  return <>{children}</>
}

const labelStyle = {
  backgroundColor: 'canvas.subtle',
  color: 'fg.muted',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  maxWidth: '350px',
  p: '4px 6px',
  overflow: 'hidden',
  textAlign: 'left',
}

const trackedByStyle = {
  display: 'flex',
  alignItems: 'center',
  maxWidth: '100%',
  textUnderlineOffset: '2px',
}

const trackedByTextStyle = {
  color: 'fg.default',
  fontSize: 0,
  fontWeight: '600',
  px: 1,
  py: '2px',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}
