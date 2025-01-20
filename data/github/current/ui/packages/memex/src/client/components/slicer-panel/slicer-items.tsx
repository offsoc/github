import {GitHubAvatar} from '@github-ui/github-avatar'
import {usePortalTooltip} from '@github-ui/portal-tooltip/use-portal-tooltip'
import {testIdProps} from '@github-ui/test-id-props'
import {IterationsIcon, MilestoneIcon} from '@primer/octicons-react'
import {ActionList, Box, Button, CounterLabel, Heading, Label, Link, merge, Octicon} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {clsx} from 'clsx'
import {useDeferredValue, useEffect, useRef} from 'react'

import {partition} from '../../../utils/partition'
import type {Iteration} from '../../api/columns/contracts/iteration'
import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import {ItemType} from '../../api/memex-items/item-type'
import {SlicerPanelUI} from '../../api/stats/contracts'
import {useFilteredItems} from '../../features/filtering/hooks/use-filtered-items'
import type {EmptyCustomGroup, IterationGrouping} from '../../features/grouping/types'
import {NO_SLICE_VALUE, type SliceValue} from '../../features/slicing/hooks/use-slice-by'
import {useOpenParentIssue} from '../../features/sub-issues/use-open-parent-issue'
import {intervalDatesDescription, isCurrentIteration, partitionAllIterations} from '../../helpers/iterations'
import {formatDateString, formatISODateString} from '../../helpers/parsing'
import {sanitizeTextInputHtmlString} from '../../helpers/sanitize'
import {isToday} from '../../helpers/util'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import type {IssueModel, MemexItemModel} from '../../models/memex-item-model'
import {useTrackedByItemsContext} from '../../state-providers/tracked-by-items/use-tracked-by-items-context'
import {Resources, TrackedByResources} from '../../strings'
import {SanitizedHtml} from '../dom/sanitized-html'
import {CurrentIterationLabel} from '../fields/iteration/iteration-label'
import {LabelDecorator} from '../fields/label-token'
import {RepositoryIcon} from '../fields/repository/repository-icon'
import {ColorDecorator} from '../fields/single-select/color-decorator'
import {SubIssuesProgressBar} from '../fields/sub-issues-progress-bar'
import {TracksToken} from '../fields/tracks/tracks-token'
import {ProjectInputWithSearchContext} from '../filter-bar/base-project-view-filter-input'
import {ItemState, ItemStateForTitle} from '../item-state'
import {TrackedByMissingIssuesButton} from '../tracked-by/tracked-by-missing-issues-button'
import type {SlicerItemGroup} from './slicer-items-provider'

/* Common */
const leadingVisualSx: BetterSystemStyleObject = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  flexDirection: 'row',
  gap: 2,
  maxWidth: 'unset',
  mx: 0,
  pl: 3,
  pr: 2,
}
const iconSx = {
  display: 'flex',
  marginTop: '10px', // margin-top is copied from ListItem.LeadingVisual, which does not support arbitrary children at the moment
}
const trailingVisualSx: BetterSystemStyleObject = {
  pr: 2,
  ml: 1,
  display: 'flex',
  justifyContent: 'flex-end',
  minWidth: '45px',
}
const counterSx: BetterSystemStyleObject = {color: 'fg.muted', lineHeight: 'normal'}

const mainContentSx: BetterSystemStyleObject = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flex: '1',
}

const trailingContentSx: BetterSystemStyleObject = {
  pr: 2,
  display: 'flex',
  justifyContent: 'flex-end',
  flex: 1,
  alignItems: 'center',
  // Using max-width over restructuring the layout or using `flex: 0 1 175px` to allow the title
  // to take up as much space as needed and have consistent shrinking of the trailing content
  maxWidth: '175px',
}

const listContainerBaseSx: BetterSystemStyleObject = {
  '& ul': {padding: '0 0 0 12px', listStyleType: 'none'},
  '& .actionlistitem': {
    minHeight: '40px',
    position: 'relative',
    p: 0,
    m: 0,
  },
  'li:not(:last-child) .actionlistitem-container > :not(:first-child)': {
    borderBottom: '1px solid',
    borderColor: 'border.subtle',
  },
  '.actionlistitem-active': {
    backgroundColor: 'var(--control-transparent-bgColor-selected, var(--color-action-list-item-default-selected-bg))',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '8px',
      bottom: '8px',
      left: '-8px',
      width: '4px',
      backgroundColor: 'accent.fg',
      borderRadius: 2,
    },
  },
}
const listContainerWithIconsSx: BetterSystemStyleObject = merge(listContainerBaseSx, {
  '& .actionlistitem-leadingcontent': {
    minWidth: '40px',
  },
})
const listContainerNoIconsSx: BetterSystemStyleObject = merge(listContainerBaseSx, {
  '& .actionlistitem-leadingcontent': {
    minWidth: '16px',
    paddingRight: '0',
  },
})

const completedIterationHeadingSx = {
  backgroundColor: 'canvas.subtle',
  borderBottom: '1px solid',
  borderBottomColor: 'border.muted',
  borderTop: '1px solid',
  borderTopColor: 'border.muted',
  color: 'fg.muted',
  fontWeight: 'bold',
  my: 1,
  pl: 3,
  py: 1,
}

const todayLabelSx: BetterSystemStyleObject = {
  ml: 2,
  borderColor: 'accent.emphasis',
  color: 'accent.fg',
}

const toggleEmptyButtonSx = {ml: 'auto', mr: '12px', mt: '8px', color: 'fg.muted', fontWeight: 'normal'}

const descriptionStyles: BetterSystemStyleObject = {
  display: 'flex',
  flexWrap: 'nowrap',
  gap: 1,
  color: 'fg.muted',
  fontWeight: 'normal',
  fontSize: 0,
  alignItems: 'center',
}

const titleStyles: BetterSystemStyleObject = {
  fontSize: 1,
  fontWeight: 'normal',
  textAlign: 'left',
  whiteSpace: 'normal',
}

const fieldsWithNoLeadingIcon = new Set<MemexColumnDataType>([
  MemexColumnDataType.Text,
  MemexColumnDataType.Number,
  MemexColumnDataType.Date,
  MemexColumnDataType.IssueType,
])

const ListItemCountMetadata = ({count}: {count: number}) => (
  <Box sx={trailingVisualSx}>
    <CounterLabel {...testIdProps('slicer-item-count')} sx={counterSx}>
      {count}
    </CounterLabel>
  </Box>
)

const ListContainer = ({children, hasLeadingIcons = true}: {children: React.ReactNode; hasLeadingIcons?: boolean}) => (
  <Box sx={hasLeadingIcons ? listContainerWithIconsSx : listContainerNoIconsSx}>{children}</Box>
)

type SlicerItemCommonProps = {
  sliceValue: SliceValue
  onSliceValueChange: (value: SliceValue) => void
}

type SlicerItemGroupedProps = SlicerItemCommonProps & {
  count: number
}

/* Iteration */

const SlicerIterationItem = ({
  fieldGrouping,
  count,
  onSliceValueChange,
  sliceValue,
}: SlicerItemGroupedProps & {
  fieldGrouping: Exclude<IterationGrouping, EmptyCustomGroup>
}) => {
  return (
    <StandardSlicerItem
      onSelect={() => onSliceValueChange(fieldGrouping.value.iteration.title)}
      isActive={sliceValue === fieldGrouping.value.iteration.title}
      icon={<Octicon icon={IterationsIcon} sx={{color: 'fg.muted'}} />}
      title={fieldGrouping.value.iteration.titleHtml}
      description={<Box sx={descriptionStyles}>{intervalDatesDescription(fieldGrouping.value.iteration)}</Box>}
      metadata={
        <>
          {isCurrentIteration(new Date(), fieldGrouping.value.iteration) && (
            <div>
              <CurrentIterationLabel sx={{ml: 2}} />
            </div>
          )}
          <ListItemCountMetadata count={count} />
        </>
      }
    />
  )
}

const StandardSlicerItem = ({
  onSelect,
  isActive,
  icon,
  title,
  description,
  metadata,
  trailingContent,
}: {
  onSelect: () => void
  isActive: boolean
  icon?: JSX.Element
  title: JSX.Element | string
  description?: JSX.Element
  metadata?: JSX.Element
  trailingContent?: JSX.Element
}) => {
  const titleContent =
    typeof title === 'string' ? (
      <SanitizedHtml as="h3" sx={titleStyles}>
        {title}
      </SanitizedHtml>
    ) : (
      title
    )
  return (
    <ActionList.Item onSelect={onSelect} className={clsx(isActive && 'actionlistitem-active', 'actionlistitem')}>
      <Box className="actionlistitem-container" sx={{display: 'flex', height: '100%'}}>
        <Box className="actionlistitem-leadingcontent" sx={leadingVisualSx}>
          <Box sx={iconSx}>{icon}</Box>
        </Box>
        <Box className="actionlistitem-maincontent" sx={mainContentSx}>
          <Box sx={{flexGrow: 1, pr: 2, py: 2, textAlign: 'left'}}>
            {titleContent}
            {description}
          </Box>
          {metadata}
        </Box>
        {trailingContent && (
          <Box className="actionlistitem-trailingcontent" sx={trailingContentSx}>
            {trailingContent}
          </Box>
        )}
      </Box>
    </ActionList.Item>
  )
}

const getSlicerItem = ({
  group,
  onSliceValueChange,
  sliceValue,
}: {
  group: SlicerItemGroup
  sliceValue: SliceValue
  onSliceValueChange: (value: SliceValue) => void
}) => {
  const count = group.totalCount.value

  if (group.sourceObject.kind === 'empty') {
    const fieldGrouping = group.sourceObject
    return (
      <StandardSlicerItem
        key={NO_SLICE_VALUE}
        isActive={sliceValue === NO_SLICE_VALUE}
        title={fieldGrouping.value.titleHtml}
        onSelect={() => onSliceValueChange(NO_SLICE_VALUE)}
        metadata={<ListItemCountMetadata count={count} />}
      />
    )
  }

  switch (group.sourceObject.dataType) {
    case MemexColumnDataType.SingleSelect: {
      const fieldGrouping = group.sourceObject
      const value = fieldGrouping.value.option.name
      return (
        <StandardSlicerItem
          key={fieldGrouping.value.option.id}
          isActive={sliceValue === value}
          onSelect={() => onSliceValueChange(value)}
          title={fieldGrouping.value.option.nameHtml}
          icon={<ColorDecorator color={fieldGrouping.value.option.color} />}
          description={
            fieldGrouping.value.option.descriptionHtml ? (
              <Box sx={descriptionStyles}>
                <SanitizedHtml>{fieldGrouping.value.option.descriptionHtml}</SanitizedHtml>
              </Box>
            ) : undefined
          }
          metadata={<ListItemCountMetadata count={count} />}
        />
      )
    }
    case MemexColumnDataType.Assignees: {
      const assignee = group.sourceObject.value[0]
      if (!assignee) return null

      return (
        <StandardSlicerItem
          key={assignee.id}
          onSelect={() => onSliceValueChange(assignee.login)}
          isActive={sliceValue === assignee.login}
          icon={<GitHubAvatar loading="lazy" key={assignee.id} alt={assignee.login} src={assignee.avatarUrl} />}
          title={assignee.login}
          metadata={<ListItemCountMetadata count={count} />}
        />
      )
    }
    case MemexColumnDataType.Labels: {
      const fieldGrouping = group.sourceObject
      const value = fieldGrouping.value.name
      return (
        <StandardSlicerItem
          key={fieldGrouping.value.id}
          isActive={sliceValue === value}
          onSelect={() => onSliceValueChange(value)}
          icon={<LabelDecorator color={fieldGrouping.value.color} />}
          title={fieldGrouping.value.nameHtml}
          metadata={<ListItemCountMetadata count={count} />}
        />
      )
    }
    case MemexColumnDataType.Milestone: {
      const fieldGrouping = group.sourceObject
      const value = fieldGrouping.value.title
      return (
        <StandardSlicerItem
          key={fieldGrouping.value.id}
          isActive={sliceValue === value}
          onSelect={() => onSliceValueChange(value)}
          icon={<Octicon icon={MilestoneIcon} sx={{color: 'fg.muted'}} />}
          title={value}
          metadata={<ListItemCountMetadata count={count} />}
        />
      )
    }
    case MemexColumnDataType.ParentIssue: {
      const parentIssue = group.sourceObject.value
      const {total, completed, percentCompleted} = parentIssue.subIssueList

      const ParentIssueTitle = () => {
        const {openParentIssue} = useOpenParentIssue()
        const titleWithNumber = `${parentIssue.title} #${parentIssue.number}`
        return (
          <Link
            href={parentIssue.url}
            onClick={event => {
              event.stopPropagation()
              // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
              if (event.metaKey || event.shiftKey || event.button === 1) return
              event.preventDefault()
              openParentIssue(parentIssue)
            }}
          >
            <SanitizedHtml as="h3" sx={{...titleStyles, color: 'fg.default'}}>
              {titleWithNumber}
            </SanitizedHtml>
          </Link>
        )
      }

      return (
        <StandardSlicerItem
          key={parentIssue.id}
          isActive={sliceValue === parentIssue.nwoReference}
          onSelect={() => onSliceValueChange(parentIssue.nwoReference)}
          icon={
            <ItemState
              isDraft={false}
              state={parentIssue.state}
              stateReason={parentIssue.stateReason}
              type={ItemType.Issue}
              sx={{mr: 2}}
            />
          }
          title={<ParentIssueTitle />}
          trailingContent={
            <SubIssuesProgressBar total={total} completed={completed} percentCompleted={percentCompleted} />
          }
        />
      )
    }
    case MemexColumnDataType.IssueType: {
      const fieldGrouping = group.sourceObject
      const value = fieldGrouping.value.name
      return (
        <StandardSlicerItem
          key={fieldGrouping.value.id}
          isActive={sliceValue === value}
          onSelect={() => onSliceValueChange(value)}
          title={value}
          metadata={<ListItemCountMetadata count={count} />}
        />
      )
    }
    case MemexColumnDataType.Repository: {
      const fieldGrouping = group.sourceObject
      const value = fieldGrouping.value.nameWithOwner
      return (
        <StandardSlicerItem
          key={fieldGrouping.value.id}
          isActive={sliceValue === value}
          onSelect={() => onSliceValueChange(value)}
          icon={<RepositoryIcon repository={fieldGrouping.value} sx={{color: 'fg.muted'}} />}
          title={value}
          metadata={<ListItemCountMetadata count={count} />}
        />
      )
    }
    case MemexColumnDataType.Text: {
      const fieldGrouping = group.sourceObject
      const value = fieldGrouping.value.text.raw

      return (
        <StandardSlicerItem
          key={value}
          isActive={sliceValue === value}
          onSelect={() => onSliceValueChange(value)}
          title={sanitizeTextInputHtmlString(fieldGrouping.value.text.html)}
          metadata={<ListItemCountMetadata count={count} />}
        />
      )
    }
    case MemexColumnDataType.Number: {
      const valueString = group.sourceObject.value.number.value.toString()
      return (
        <StandardSlicerItem
          key={group.sourceObject.value.number.value.toString()}
          onSelect={() => onSliceValueChange(valueString)}
          isActive={sliceValue === valueString}
          title={valueString}
          metadata={<ListItemCountMetadata count={count} />}
        />
      )
    }
    case MemexColumnDataType.Date: {
      const date = group.sourceObject.value.date.value
      const title = formatDateString(date)
      const value = formatISODateString(date)
      const todayLabel = isToday(value) ? 'Today' : undefined
      return (
        <StandardSlicerItem
          key={date.toString()}
          onSelect={() => onSliceValueChange(value)}
          isActive={sliceValue === value}
          title={title}
          metadata={
            <>
              {todayLabel && (
                <div>
                  <Label sx={todayLabelSx}>{todayLabel}</Label>
                </div>
              )}
              <ListItemCountMetadata count={count} />
            </>
          }
        />
      )
    }
    case MemexColumnDataType.Iteration:
      return (
        <SlicerIterationItem
          key={group.sourceObject.value.iteration.id}
          fieldGrouping={group.sourceObject}
          count={count}
          onSliceValueChange={onSliceValueChange}
          sliceValue={sliceValue}
        />
      )
    default:
      return null
  }
}

export const SlicerGroupByItems = ({
  sliceValue,
  onSliceValueChange,
  slicerItems,
  showEmptySlicerItems,
  setShowEmptySlicerItems,
}: SlicerItemCommonProps & {
  slicerItems: Array<SlicerItemGroup>
  showEmptySlicerItems: boolean
  setShowEmptySlicerItems: (value: boolean) => void
}) => {
  const [nonEmptySlicerItems, emptySlicerItems] = partition(slicerItems, item => item.totalCount.value > 0)
  const hasEmptySlicerItems = emptySlicerItems.length > 0
  const dataType = slicerItems[0]?.sourceObject.dataType
  const hasLeadingIcons = !(dataType && fieldsWithNoLeadingIcon.has(dataType))

  return (
    <>
      <ListContainer hasLeadingIcons={hasLeadingIcons}>
        <Heading as="h2" className="sr-only">
          Project items group
        </Heading>
        <ActionList aria-labelledby="slicer-panel-title">
          {nonEmptySlicerItems.map(group => getSlicerItem({group, sliceValue, onSliceValueChange}))}
          {showEmptySlicerItems &&
            emptySlicerItems.map(group => getSlicerItem({group, sliceValue, onSliceValueChange}))}
        </ActionList>
      </ListContainer>
      <ToggleItemsButton
        hasEmptySlicerItems={hasEmptySlicerItems}
        showEmptySlicerItems={showEmptySlicerItems}
        setShowEmptySlicerItems={setShowEmptySlicerItems}
      />
    </>
  )
}

/* Tracked By */

const SlicerNoTrackedByItem = ({onSliceValueChange, sliceValue}: SlicerItemCommonProps) => (
  <StandardSlicerItem
    onSelect={() => onSliceValueChange(NO_SLICE_VALUE)}
    isActive={sliceValue === NO_SLICE_VALUE}
    title={TrackedByResources.noTrackedBy}
  />
)

// ListItem.Metadata has a fixed width of 45px, so we use a separate container for larger tracks pills
const tracksSx = {display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'flex-end'}

const linkStyle = {
  color: 'fg.muted',
  overflow: 'hidden',
  textAlign: 'left',
  whiteSpace: 'normal',
  textDecoration: 'none',
  textOverflow: 'ellipsis',
  fontSize: 0,
  wordBreak: 'break-all',
}

const addMissingItemsButtonSx: BetterSystemStyleObject = {
  display: 'flex',
  marginTop: '8px',
  button: {
    minWidth: '48px',
    '[data-component=buttonContent]': {flex: '1 1'},
    '[data-component=text]': {display: 'flex'},
  },
}

const SlicerTrackedByItem = ({
  item,
  onSliceValueChange,
  sliceValue,
  onOpenSidePanel,
}: SlicerItemCommonProps & {
  item: IssueModel
  onOpenSidePanel: (e: React.MouseEvent<HTMLAnchorElement>, item: IssueModel) => void
}) => {
  const columnData = item.columns
  const repo = columnData.Repository
  const title = columnData.Title
  const tracks = columnData.Tracks
  const issueSuffix = title && 'number' in title.value ? `#${title.value.number}` : ''
  const displayName = repo ? `${repo.nameWithOwner}${issueSuffix}` : ''
  const isActive = sliceValue === displayName
  const issueId = item.content.id

  // Tracked by items allow users to add missing child items to the project
  const {tasklist_block} = useEnabledFeatures()
  const {getChildrenTrackedByParent, parentIssuesById} = useTrackedByItemsContext()
  const itemsNotInProjectCount = tasklist_block ? parentIssuesById.get(issueId)?.count ?? 0 : 0

  // Show percent complete tooltip over the tracks token
  const tracksTokenRef = useRef<HTMLButtonElement>(null)
  const [contentProps, Trackstooltip] = usePortalTooltip({
    contentRef: tracksTokenRef,
    direction: 'n',
    'aria-label': tracks?.total
      ? Resources.progressPercentCount(Math.floor((tracks.completed / tracks.total) * 100))
      : undefined,
  })

  useEffect(() => {
    if (tasklist_block && isActive) {
      getChildrenTrackedByParent(issueId)
    }
  }, [tasklist_block, issueId, getChildrenTrackedByParent, isActive])

  const icon = title?.contentType === ItemType.Issue ? <ItemStateForTitle title={title} /> : undefined
  const metadata = tracks ? (
    <Box sx={tracksSx}>
      <TracksToken ref={tracksTokenRef} sx={{cursor: 'pointer', mr: 2}} progress={tracks} {...contentProps} />
      {Trackstooltip}
    </Box>
  ) : undefined

  // An active (selected) Tracked by item has nested interactive elements (link, button), so we use an <li> instead of <ActionList.Item>
  if (isActive) {
    return (
      <Box as="li" sx={{pl: 0, pr: 3}}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          onClick={() => onSliceValueChange(displayName)}
          className={clsx(isActive && 'actionlistitem-active', 'actionlistitem')}
        >
          <Box className="actionlistitem-container" sx={{display: 'flex'}}>
            <Box className="actionlistitem-leadingcontent" sx={leadingVisualSx}>
              <Box sx={iconSx}>{icon}</Box>
            </Box>
            <Box className="actionlistitem-maincontent" sx={mainContentSx}>
              <Box sx={{flexGrow: 1, pr: 2, py: 2, textAlign: 'left'}}>
                <SanitizedHtml as="h3" sx={titleStyles}>
                  {item.getHtmlTitle()}
                </SanitizedHtml>
                {displayName && (
                  <>
                    <Link
                      sx={linkStyle}
                      target="_blank"
                      rel="noreferrer"
                      href={item.content.url}
                      onClick={e => onOpenSidePanel(e, item)}
                      {...testIdProps('issue-link')}
                    >
                      {displayName}
                    </Link>
                    {itemsNotInProjectCount ? (
                      <Box sx={addMissingItemsButtonSx}>
                        <TrackedByMissingIssuesButton
                          trackedBy={issueId}
                          invisibleButtonVariant={false}
                          ui={SlicerPanelUI}
                        />
                      </Box>
                    ) : null}
                  </>
                )}
              </Box>
              {metadata}
            </Box>
          </Box>
        </div>
      </Box>
    )
  }

  return (
    <StandardSlicerItem
      onSelect={() => onSliceValueChange(displayName)}
      isActive={isActive}
      icon={icon}
      title={item.getHtmlTitle()}
      description={displayName ? <Box sx={linkStyle}>{displayName}</Box> : undefined}
      metadata={metadata}
    />
  )
}

// Returns a Tracked by item for IssueModels and a "No Tracked by" item for undefined
const getSlicerTrackedByItem = ({
  item,
  ...args
}: {
  item: MemexItemModel | undefined
  sliceValue: SliceValue
  onSliceValueChange: (newValue: SliceValue) => void
  onOpenSidePanel: (e: React.MouseEvent<HTMLAnchorElement>, item: IssueModel) => void
}) => {
  switch (item?.contentType) {
    case ItemType.Issue:
      return <SlicerTrackedByItem key={item.id} item={item} {...args} />
    case undefined:
      return <SlicerNoTrackedByItem key={'no-tracked-by-item'} {...args} />
    default:
      return null
  }
}

// Get filtered items inside of child component to avoid unnecessary filter operations for other slicer types
// Avoid nesting filter input inside of the list view because the suggestion list disrupts focus management
export const SlicerTrackedByItems = ({
  sliceValue,
  onSliceValueChange,
  onOpenSidePanel,
}: SlicerItemCommonProps & {
  onOpenSidePanel: (e: React.MouseEvent<HTMLAnchorElement>, item: IssueModel) => void
}) => {
  const {filteredItems} = useFilteredItems({applyTransientFilter: 'exclude'})

  const sliceItems = filteredItems.map(item =>
    getSlicerTrackedByItem({item, sliceValue, onSliceValueChange, onOpenSidePanel}),
  )
  const noTrackedByItem = getSlicerTrackedByItem({item: undefined, sliceValue, onSliceValueChange, onOpenSidePanel})
  sliceItems.push(noTrackedByItem)

  return (
    <>
      <ProjectInputWithSearchContext
        filterCount={useDeferredValue(filteredItems.length)}
        hideSaveButton
        hideResetChangesButton
        {...testIdProps('slicer-panel-filter-input')}
      />
      <ListContainer>
        <Heading as="h2" className="sr-only">
          Project filtered items
        </Heading>
        <ActionList aria-labelledby="slicer-panel-title">{sliceItems}</ActionList>
      </ListContainer>
    </>
  )
}

export const SlicerIterationItems = ({
  slicerItems,
  sliceValue,
  onSliceValueChange,
  showEmptySlicerItems,
  setShowEmptySlicerItems,
}: SlicerItemCommonProps & {
  slicerItems: Array<SlicerItemGroup>
  showEmptySlicerItems: boolean
  setShowEmptySlicerItems: (value: boolean) => void
}) => {
  const iterations: Array<Iteration> = []
  const iterationGroupsMap = new Map<string, SlicerItemGroup>()
  let emptyGroup: SlicerItemGroup | null = null

  for (const item of slicerItems) {
    if (item.sourceObject.dataType === MemexColumnDataType.Iteration) {
      if (item.sourceObject.kind !== 'empty') {
        const iteration = item.sourceObject.value.iteration
        iterations.push(iteration)
        iterationGroupsMap.set(iteration.id, item)
      } else {
        emptyGroup = item
      }
    }
  }

  const partitionedIterations = partitionAllIterations(iterations)

  if (!partitionedIterations['iterations'].length && !partitionedIterations['completedIterations'].length) {
    return null
  }

  const hasEmptySlicerItems = slicerItems.some(item => item.totalCount.value === 0)

  return (
    <>
      <ListContainer>
        <Heading as="h2" className="sr-only">
          Project iterations list
        </Heading>
        <ActionList aria-labelledby="slicer-panel-title">
          {partitionedIterations['iterations'].length > 0 && (
            <>
              {partitionedIterations['iterations'].map(iteration => {
                const slicerItem = iterationGroupsMap.get(iteration.id)
                if (!slicerItem || (!showEmptySlicerItems && !slicerItem.totalCount.value)) return null

                return getSlicerItem({group: slicerItem, sliceValue, onSliceValueChange})
              })}
            </>
          )}
          {emptyGroup && getSlicerItem({group: emptyGroup, sliceValue, onSliceValueChange})}
        </ActionList>
        {partitionedIterations['completedIterations'].length > 0 && (
          <>
            <Box data-testid="completed-iteration-header" sx={completedIterationHeadingSx}>
              {Resources.iterationLabel.completed}
            </Box>
            <ActionList aria-label="Completed iterations">
              {partitionedIterations['completedIterations'].map(iteration => {
                const slicerItem = iterationGroupsMap.get(iteration.id)
                if (!slicerItem || (!showEmptySlicerItems && !slicerItem.totalCount.value)) return null

                return slicerItem && getSlicerItem({group: slicerItem, sliceValue, onSliceValueChange})
              })}
            </ActionList>
          </>
        )}
      </ListContainer>
      <ToggleItemsButton
        hasEmptySlicerItems={hasEmptySlicerItems}
        showEmptySlicerItems={showEmptySlicerItems}
        setShowEmptySlicerItems={setShowEmptySlicerItems}
      />
    </>
  )
}

const ToggleItemsButton = ({
  hasEmptySlicerItems,
  showEmptySlicerItems,
  setShowEmptySlicerItems,
}: {
  hasEmptySlicerItems: boolean
  showEmptySlicerItems: boolean
  setShowEmptySlicerItems: (showEmptySlicerItems: boolean) => void
}) => {
  const toggleEmptySlicerItems = () => setShowEmptySlicerItems(!showEmptySlicerItems)

  if (!hasEmptySlicerItems) return null

  return (
    <Button
      onClick={toggleEmptySlicerItems}
      size="small"
      variant="invisible"
      sx={toggleEmptyButtonSx}
      {...testIdProps('toggle-empty-slicer-items')}
    >
      {showEmptySlicerItems ? 'Hide' : 'Show'} empty values
    </Button>
  )
}
