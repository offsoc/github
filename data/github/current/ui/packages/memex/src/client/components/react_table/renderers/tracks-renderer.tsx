import {ControlledTooltip} from '@github-ui/portal-tooltip/controlled'
import {testIdProps} from '@github-ui/test-id-props'
import {AlertIcon} from '@primer/octicons-react'
import {Octicon} from '@primer/react'
import {useCallback, useRef, useState} from 'react'

import type {Progress} from '../../../api/columns/contracts/tracks'
import {ItemType} from '../../../api/memex-items/item-type'
import {useTableSidePanel} from '../../../hooks/use-side-panel'
import {type ColumnValue, isEmpty, isLoading} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {Resources} from '../../../strings'
import {useAdjustPickerPosition} from '../../common/picker-list'
import {PillPlaceholder} from '../../common/placeholders'
import {TracksToken} from '../../fields/tracks/tracks-token'
import {BaseCell} from '../cells/base-cell'
import {useRecordCellRenderer} from '../performance-measurements'
import {withCellRenderer} from './cell-renderer'

type Props = Readonly<{
  currentValue: ColumnValue<Progress>
  model: MemexItemModel
}>

export const LoadingTracksCell = () => (
  <BaseCell>
    <PillPlaceholder minWidth={30} maxWidth={60} {...testIdProps('placeholder')} />
  </BaseCell>
)

export const FailedToLoadDataCell = () => {
  return (
    <BaseCell sx={{color: 'fg.muted'}}>
      <Octicon icon={AlertIcon} sx={{mr: 1}} />
      Failed to load data
    </BaseCell>
  )
}

export const TracksRenderer = withCellRenderer<Props>(function TracksRenderer({currentValue, model}) {
  useRecordCellRenderer('TracksRenderer', model.id)
  const {openPane} = useTableSidePanel()
  const containerRef = useRef(null)
  const valueTooltipRef = useRef(null)
  const [hovering, setHovering] = useState(false)

  const tracksTooltipPosition = useAdjustPickerPosition(containerRef, valueTooltipRef, hovering, [currentValue], {
    xAlign: 'center',
    yAlign: 'top',
  })

  const onClick = useCallback(() => {
    if (model.contentType !== ItemType.Issue) return

    openPane(model)
  }, [model, openPane])

  // This is a graceful degradation strategy: sometimes if the data cannot be loaded we simply
  // get an empty value object, so as a fallback we just render an error state to indicate
  // that the data was not fetched from the server.
  const isError = currentValue.state === 'found' && Object.keys(currentValue.value).length === 0

  if (isLoading(currentValue)) {
    return <LoadingTracksCell />
  }

  if (isEmpty(currentValue)) {
    return null
  }

  if (model.contentType === ItemType.DraftIssue) {
    return null
  }

  if (currentValue.value.total === 0) {
    return null
  }

  if (isError) {
    return <FailedToLoadDataCell />
  }

  const tracksTokenProps =
    model.contentType === ItemType.PullRequest
      ? ({as: 'a', href: model.getUrl(), target: '_blank', rel: 'noopener noreferrer'} as const)
      : ({as: 'button', onClick} as const)

  const tooltipId = `${model.id}-tracks-completion-value`
  return (
    <BaseCell>
      <ControlledTooltip
        direction="n"
        open={hovering}
        aria-label={Resources.progressPercentCount(
          Math.floor((currentValue.value.completed / currentValue.value.total) * 100),
        )}
        ref={valueTooltipRef}
        id={tooltipId}
        aria-live="polite"
        portalProps={{
          onMount: tracksTooltipPosition.adjustPickerPosition,
        }}
      />
      <TracksToken
        progress={currentValue.value}
        aria-describedby={tooltipId}
        tabIndex={-1}
        ref={containerRef}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        {...tracksTokenProps}
      />
    </BaseCell>
  )
})

TracksRenderer.displayName = 'TracksRenderer'
