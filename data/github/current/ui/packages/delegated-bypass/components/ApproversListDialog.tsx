import {useState, useEffect} from 'react'
import {Box, Portal, Text} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {BypassAvatar} from './BypassActor'
import {getApprovers} from '../services/api'
import type {AppPayload, BypassActor as BypassActorType} from '../delegated-bypass-types'
import {humanizeRoleName} from '../helpers/humanize-role-name'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'

const subtitle = 'Roles and teams who can approve requests for bypass privileges'

type ApproversListDialogProps = {
  onClose: () => void
  rulesetId?: number
}

export default function ApproversListDialog({onClose, rulesetId}: ApproversListDialogProps) {
  const [approvers, setApprovers] = useState<BypassActorType[]>([])
  const {base_avatar_url: baseAvatarUrl} = useAppPayload<AppPayload>()

  useEffect(() => {
    const fetch = async () => {
      const {approvers: data, statusCode} = await getApprovers(`${ssrSafeLocation.pathname}/approvers`, {rulesetId})
      if (statusCode === 200) {
        setApprovers(data)
      }
    }
    fetch()
  }, [rulesetId])

  return (
    <Portal>
      <Dialog title="Approvers" subtitle={subtitle} onClose={onClose}>
        <Box
          as="ul"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            listStyle: 'none',
            mx: 1,
            my: 2,
            '> li span': {borderBottom: '1px solid', borderColor: 'border.default'},
            '> li:last-child span': {borderBottom: 0},
          }}
        >
          {approvers.map(({actorType, actorId, name}) => (
            <Box
              as="li"
              key={`${actorType}-${actorId}`}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
                py: 1,
              }}
            >
              <BypassAvatar type={actorType} id={actorId} name={name} baseUrl={baseAvatarUrl} size={20} />
              <Text sx={{width: '100%', py: 1}}>{humanizeRoleName({actorType, name})}</Text>
            </Box>
          ))}
        </Box>
      </Dialog>
    </Portal>
  )
}
