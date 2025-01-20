import {useCallback, useState} from 'react'
import {useAlive} from '@github-ui/use-alive'
import {Box, Heading, Octicon, RelativeTime, Spinner, Text} from '@primer/react'
import {CheckCircleFillIcon, PencilIcon} from '@primer/octicons-react'
import type {SettingsOrchestration} from '../types'

type LiveBannerProps = {
  channel?: string
  initialState?: SettingsOrchestration
  isFormTouched?: boolean
}

export function LiveBanner({channel = '', initialState = undefined, isFormTouched = false}: LiveBannerProps) {
  const [status, setStatus] = useState<SettingsOrchestration | undefined>(initialState)

  if (!status && !channel && !isFormTouched) {
    return null
  }

  if (isFormTouched) {
    return (
      <div className="Box d-flex p-3 flex-items-center">
        <Octicon icon={PencilIcon} size={36} />
        <div className="pl-2 d-flex flex-column">
          <Heading sx={{fontSize: 2}} as="h3">
            Unsaved changes
          </Heading>
          <span className="color-fg-muted">This form has unsaved changes </span>
        </div>
      </div>
    )
  }

  const finished = status?.state === 'succeeded' || status?.state === 'finished'
  return (
    <div className="Box d-flex p-3 flex-items-center">
      {channel && <AliveUpdater channel={channel} setStatus={setStatus} />}
      {finished ? (
        <Octicon icon={CheckCircleFillIcon} size={36} sx={{color: 'success.fg'}} />
      ) : (
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2}}>
          <Spinner size="medium" />
        </Box>
      )}
      <div className="pl-2 d-flex flex-column">
        <Heading sx={{fontSize: 2}} as="h3">
          {finished ? 'Settings are up to date' : 'Applying group settings'}
        </Heading>
        {finished ? (
          <Text sx={{color: 'fg.muted'}}>
            Applied to {status?.total} repositories{' • '}
            {status?.completed ? <RelativeTime date={new Date(status.completed)} tense="past" /> : 'Now'}
          </Text>
        ) : (
          <Text sx={{color: 'fg.muted'}}>
            {status?.total ? `${status?.succeeded} of ${status?.total} repositories` : 'Applying to repositories'}
          </Text>
        )}
      </div>
    </div>
  )
}

function AliveUpdater({channel = '', setStatus}: {channel: string; setStatus: (args: SettingsOrchestration) => void}) {
  const aliveCallback = useCallback(
    (args: SettingsOrchestration) => {
      setStatus(args)
    },
    [setStatus],
  )

  useAlive(channel, aliveCallback)

  return null
}
