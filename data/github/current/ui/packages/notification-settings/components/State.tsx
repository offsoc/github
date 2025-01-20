import React, {useEffect} from 'react'
import {announceFromElement} from '@github-ui/aria-live'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {Box, Text, Octicon, Spinner} from '@primer/react'
import {CheckIcon, AlertIcon} from '@primer/octicons-react'

export enum Sections {
  Notifications = 'notifications',
  Watching = 'watching',
  System = 'system',
}

export enum SavingStatus {
  IDLE = '',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

interface StateProps {
  sx?: BetterSystemStyleObject
  status: SavingStatus
}

function State(props: StateProps) {
  const {status} = props
  const ref = React.useRef<HTMLDivElement>(null)
  const [isDisplayed, setDisplayed] = React.useState(status !== SavingStatus.IDLE)

  const successStatus = () => {
    return (
      <>
        <Octicon icon={CheckIcon} size={12} sx={{verticalAlign: 'top', color: 'success.fg', marginRight: 1}} />
        <Text sx={{fontSize: '12px', fontWeight: 400}}>Saved</Text>
      </>
    )
  }

  const succeeded = status === SavingStatus.SUCCESS

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null

    if (succeeded) {
      timeoutId = setTimeout(() => setDisplayed(false), 3000)
    } else {
      setDisplayed(true)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [succeeded])

  const renderStatus = () => {
    return status === SavingStatus.SUCCESS ? successStatus() : <Text sx={{fontSize: '12px'}}>{status}</Text>
  }

  useEffect(() => {
    if (ref.current) {
      announceFromElement(ref.current, {assertive: status === SavingStatus.ERROR})
    }
  }, [status, ref])

  if (!isDisplayed) return null

  return (
    <Box sx={{...props.sx}} ref={ref}>
      {status === SavingStatus.ERROR ? (
        <Text sx={{color: 'fg.muted', fontSize: '12px'}}>
          <Octicon icon={AlertIcon} size={12} sx={{verticalAlign: 'top', color: 'danger.fg', marginRight: 1}} />
          Oops, something went wrong.
        </Text>
      ) : (
        <>{status === SavingStatus.LOADING ? <Spinner size="small" /> : renderStatus()}</>
      )}
    </Box>
  )
}

export default State
