import {ControlledTooltip} from '@github-ui/portal-tooltip/controlled'
import {testIdProps} from '@github-ui/test-id-props'
import {Box, Button, Link} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {useCallback, useEffect, useRef, useState} from 'react'

import type {ItemCompletion, TrackedByItem} from '../../../../api/issues-graph/contracts'
import {getInitialState} from '../../../../helpers/initial-state'
import {displayNameWithOwner, displayNameWithOwnerWithoutId} from '../../../../helpers/tracked-by-formatter'
import type {FieldAggregate} from '../../../../hooks/use-aggregation-settings'
import {useSidePanelFromTrackedByItem} from '../../../../hooks/use-side-panel-from-tracked-by-item'
import {useTrackedByItemsContext} from '../../../../state-providers/tracked-by-items/use-tracked-by-items-context'
import {useTrackedByParent} from '../../../../state-providers/tracked-by-items/use-tracked-by-parent'
import {Resources} from '../../../../strings'
import {TracksToken} from '../../../fields/tracks/tracks-token'
import {ItemState} from '../../../item-state'
import {AggregateLabels} from '../../aggregate-labels'
import {useAdjustPickerPosition} from '../../picker-list'
import {PillPlaceholder} from '../../placeholders'
import {SanitizedGroupHeaderText} from '../sanitized-group-header-text'

type Props = {
  trackedBy: TrackedByItem
  titleSx?: BetterSystemStyleObject
  /** Whether to hide the repo/owner information until the user hovers/focuses the issue ID */
  showOwnerOnFocus?: boolean
  rowCount: number
  hideItemsCount: boolean
  aggregates: Array<FieldAggregate>
}

export const TrackedByGroupHeaderLabel: React.FC<Props> = ({
  trackedBy,
  titleSx,
  showOwnerOnFocus = false,
  rowCount,
  aggregates,
  hideItemsCount,
}) => {
  const {projectOwner} = getInitialState()
  const {getParentCompletion} = useTrackedByParent()
  const {getChildrenTrackedByParent} = useTrackedByItemsContext()
  const {createSidePanelHandler} = useSidePanelFromTrackedByItem()
  const [completionData, setCompletionData] = useState<ItemCompletion>()
  const mounted = useRef(false)
  const [hovering, setHovering] = useState(false)
  const containerRef = useRef(null)
  const valueTooltipRef = useRef(null)

  const tracksTooltipPosition = useAdjustPickerPosition(containerRef, valueTooltipRef, hovering, [completionData], {
    xAlign: 'center',
    yAlign: 'top',
  })

  const getCompletionData = useCallback(
    async (issueId: number) => {
      if (!mounted.current) return

      const parentCompletion = getParentCompletion(issueId)
      if (parentCompletion) {
        setCompletionData(parentCompletion)
        return
      }

      await getChildrenTrackedByParent(issueId)
    },
    [getChildrenTrackedByParent, getParentCompletion],
  )

  useEffect(() => {
    mounted.current = true
    void getCompletionData(trackedBy.key.itemId)
    return () => {
      mounted.current = false
    }
  }, [trackedBy.key.itemId, getCompletionData])

  const completionPill = completionData ? (
    <Button
      variant="invisible"
      sx={{
        p: 0,
        borderRadius: 3,
        '&:hover:not([disabled]), &:focus:not([disabled])': {backgroundColor: 'transparent', color: 'fg.default'},
      }}
      onClick={createSidePanelHandler(trackedBy)}
      ref={containerRef}
      tabIndex={-1}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      {...testIdProps(`tracked-by-completion-pill`)}
    >
      <ControlledTooltip
        direction="n"
        open={hovering}
        aria-label={Resources.progressPercentCount(Math.floor((completionData.completed / completionData.total) * 100))}
        ref={valueTooltipRef}
        id={`${trackedBy.key.itemId}-tracked-by-completion-value`}
        aria-live="polite"
        portalProps={{
          onMount: tracksTooltipPosition.adjustPickerPosition,
        }}
      />
      <Box sx={{alignItems: 'center', overflow: 'hidden', flex: '1', display: 'flex'}}>
        <TracksToken progress={completionData} />
      </Box>
    </Button>
  ) : (
    <Box sx={{alignItems: 'center', overflow: 'hidden', flex: '1 0 auto', display: 'flex', ml: 2}}>
      <PillPlaceholder marginLeft={2} minWidth={40} maxWidth={80} {...testIdProps('placeholder')} />
    </Box>
  )

  return (
    <>
      <ItemState
        key={trackedBy.key.itemId}
        state={trackedBy.state}
        stateReason={trackedBy.stateReason}
        type={'Issue'}
        isDraft={false}
        sx={{mr: 2}}
      />

      <SanitizedGroupHeaderText titleHtml={trackedBy.title} sx={titleSx} />
      {showOwnerOnFocus ? (
        <Link
          key={trackedBy.url}
          target="_blank"
          rel="noreferrer"
          href={trackedBy.url}
          onClick={createSidePanelHandler(trackedBy)}
          sx={{
            color: 'fg.subtle',
            display: 'flex',
            alignItems: 'center',
            ':focus-within .tracked-by-item-owner-repo': {display: 'block'},
            ':hover .tracked-by-item-owner-repo': {display: 'block'},
          }}
          aria-label={displayNameWithOwner(trackedBy, projectOwner)}
        >
          <Box className="tracked-by-item-owner-repo" sx={{display: 'none'}}>
            {displayNameWithOwnerWithoutId(trackedBy, projectOwner)}
          </Box>
          {`#${trackedBy.number}`}
        </Link>
      ) : (
        <Link
          key={trackedBy.url}
          target="_blank"
          rel="noreferrer"
          href={trackedBy.url}
          onClick={createSidePanelHandler(trackedBy)}
          sx={{color: 'fg.subtle', display: 'flex', alignItems: 'center', ml: 2}}
        >
          {displayNameWithOwner(trackedBy, projectOwner)}
        </Link>
      )}
      {completionPill}
      <AggregateLabels
        counterSx={{color: 'fg.muted'}}
        itemsCount={rowCount}
        aggregates={aggregates}
        hideItemsCount={hideItemsCount}
      />
    </>
  )
}
