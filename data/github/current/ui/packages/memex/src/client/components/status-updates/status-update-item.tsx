import {testIdProps} from '@github-ui/test-id-props'
import {Box, useOnOutsideClick} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {useCallback, useEffect, useRef, useState} from 'react'

import type {MemexStatus} from '../../api/memex/contracts'
import {STATUS_UPDATE_ID_PARAM} from '../../platform/url'
import {useSearchParams} from '../../router'
import {StatusUpdateActionTypes} from '../../state-providers/status-updates/hooks/use-status-updates-editor-reducer'
import {useStatusUpdates} from '../../state-providers/status-updates/status-updates-context'
import {useStatusUpdatesEditorState} from '../../state-providers/status-updates/status-updates-editor-state-context'
import {StatusUpdateItemBody} from './item/body'
import {StatusUpdateItemHeader} from './item/header'
import {StatusUpdateEditor} from './status-update-editor'

type Props = {
  status: MemexStatus
}

const statusUpdateItemStyle: BetterSystemStyleObject = {
  border: '1px solid',
  borderColor: 'border.muted',
  boxShadow: 'shadow.small',
  borderRadius: 2,
  flexGrow: 1,
  width: '100%',
  minWidth: 0,
  mt: 3,
}

const statusUpdateItemDeepLinkedStyle: BetterSystemStyleObject = {
  borderColor: 'accent.fg',
  boxShadow: theme => `0 0 0 1px ${theme.colors.accent.fg}`,
}

const statusUpdateItemEditorStyle: BetterSystemStyleObject = {
  mt: 3,
}

export const StatusUpdateItem = ({status}: Props) => {
  const {statusUpdateDrafts, statusUpdateDraftsDispatch} = useStatusUpdatesEditorState()
  const {statusUpdateIdParam} = useStatusUpdates()
  const [_, setSearchParams] = useSearchParams()
  const [isDeepLinked, setIsDeepLinked] = useState(statusUpdateIdParam === String(status.id))
  const containerRef = useRef<HTMLDivElement | null>(null)

  // The existence of a draft implies that the item is currently being edited.
  const currentDraft = statusUpdateDrafts[status.id]

  const handleOnEditClick = () => {
    const {startDate: startDateStr, targetDate: targetDateStr, status: statusOption} = status.statusValue

    statusUpdateDraftsDispatch({
      type: StatusUpdateActionTypes.SET_STATUS_UPDATE,
      payload: {
        ...status,
        startDate: startDateStr ? new Date(startDateStr) : null,
        targetDate: targetDateStr ? new Date(targetDateStr) : null,
        status: statusOption,
      },
    })
  }

  // if the status update is deep linked, we want to deslect it when clicking outside
  // this mirrors issue deeplinking functionality
  const deselectDeepLinkSelection = useCallback(() => {
    if (!isDeepLinked) return

    setIsDeepLinked(false) // clear local state
    setSearchParams(params => {
      // clear the status update id if it's present
      if (params.get(STATUS_UPDATE_ID_PARAM)) {
        params.delete(STATUS_UPDATE_ID_PARAM)
      }
      return params
    })
  }, [isDeepLinked, setSearchParams])

  useOnOutsideClick({onClickOutside: deselectDeepLinkSelection, containerRef})

  useEffect(() => {
    if (isDeepLinked && containerRef.current) {
      containerRef?.current?.scrollIntoView()
    }
  }, [isDeepLinked, containerRef])

  return (
    <div>
      {currentDraft ? (
        <Box
          role="listitem"
          sx={statusUpdateItemEditorStyle}
          ref={containerRef}
          {...testIdProps('status-updates-item-container')}
        >
          <StatusUpdateEditor statusUpdate={currentDraft} />
        </Box>
      ) : (
        <Box
          role="listitem"
          ref={containerRef}
          sx={{...statusUpdateItemStyle, ...(isDeepLinked ? statusUpdateItemDeepLinkedStyle : {})}}
          aria-current={isDeepLinked}
          {...testIdProps(`status-update-item-${status.id}`)}
        >
          <StatusUpdateItemHeader status={status} handleOnEditClick={handleOnEditClick} />
          <StatusUpdateItemBody status={status} />
        </Box>
      )}
    </div>
  )
}
