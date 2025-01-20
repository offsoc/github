import {Box, Button, Details, Octicon, useDetails} from '@primer/react'
import type {PipelineStageStatus, Stage} from '../../../../types'
import {ChevronDownIcon, ChevronRightIcon} from '@primer/octicons-react'
import {LogGroup} from './LogGroup'
import {useEffect, useRef, type MouseEventHandler} from 'react'
import {StageIcon} from './StageIcon'
import {isInProgress, shouldAutoClose, shouldAutoOpen, wentBackwards} from './utils'
import {useThemeColor} from './use-theme-color'

interface Props {
  stage: Stage
}

// Actions has the background color of: var(--control-bgColor-active, var(--color-action-list-item-default-active-bg))
// var(--control-bgColor-active) is #31363e in dark mode, as seen in `dark.css`
// `theme` does not have a `colors.control.bg.active` or anything similar. So hardcoding this is the simplest and
// most accurate way to get the color.
const controlBgColorActive = '#31363e'

export function Stage({stage}: Props) {
  const {name, status, log_groups: logGroups} = stage
  const {getDetailsProps, open: isOpen, setOpen} = useDetails({defaultOpen: isInProgress(status)})
  const hasBeenClickedRef = useRef(false)
  const prevStageRef = useRef<PipelineStageStatus | undefined>()
  const getThemeColor = useThemeColor()

  const isEmpty = !logGroups.length

  useEffect(() => {
    // We do not want to auto open/close an accordion if the user has already interacted with it. Only auto
    // open/close when the user has not taken action.
    if (hasBeenClickedRef.current) return

    const prev = prevStageRef.current
    const curr = status

    // This hook is always called twice, with the second time having the order
    // _reversed_, so we always want to enforce it going forward. It is most likely
    // called twice due to the needed dependency on `setOpen`.
    if (wentBackwards(prev, curr)) return
    if (prev === curr) return

    if (shouldAutoOpen(prev, curr)) setOpen(true)
    if (shouldAutoClose(prev, curr)) setOpen(false)

    prevStageRef.current = curr
  }, [status, setOpen, isOpen])

  const handleClick: MouseEventHandler = e => {
    if (isEmpty) {
      e.preventDefault()
      return
    } else {
      // Do not track expansion when it's empty
      hasBeenClickedRef.current = true
    }
  }

  return (
    <Details {...getDetailsProps()}>
      <Button
        alignContent="start"
        as="summary"
        onClick={handleClick}
        sx={{
          backgroundColor: isOpen ? `${controlBgColorActive} !important` : 'transparent',
          '&:active': {
            backgroundColor: isEmpty ? 'transparent !important' : `${controlBgColorActive} !important`,
          },
          '&:hover': {
            backgroundColor: isEmpty
              ? 'transparent !important'
              : isOpen
                ? `${controlBgColorActive} !important`
                : `${getThemeColor('colors.actionListItem.default.hoverBg')} !important`,
          },
          border: 'solid 1px transparent !important',
          boxShadow: 'none',
          color: isOpen ? getThemeColor('colors.fg.default') : getThemeColor('colors.fg.muted'),
          cursor: isEmpty ? 'default' : 'pointer',
          fontWeight: 'normal',
          p: '8px',
        }}
      >
        <Box sx={{alignItems: 'center', display: 'flex', gap: '8px'}}>
          <Octicon
            icon={isOpen ? ChevronDownIcon : ChevronRightIcon}
            sx={{visibility: isEmpty ? 'hidden' : 'inherit'}}
          />
          <StageIcon status={status} />
          <span>{name}</span>
        </Box>
      </Button>

      <Box sx={{my: '8px', px: '16px'}}>
        {logGroups.map(logGroup => (
          <LogGroup key={logGroup.name} logGroup={logGroup} />
        ))}
      </Box>
    </Details>
  )
}
