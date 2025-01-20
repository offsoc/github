import {Fragment} from 'react'
import {Box, Checkbox, FormControl, Text, Truncate} from '@primer/react'
import type {BypassActor, BypassActorType} from '../../bypass-actors-types'
import {ActorBypassMode} from '../../bypass-actors-types'
import {BypassAvatar} from '../BypassAvatar'
import {ActorType} from '../ActorType'
import {alreadyAdded} from './alreadyAdded'

type BypassDialogRowProps = {
  actorId: number | string | null
  actorType: BypassActorType
  name: string
  owner?: string
  selected: BypassActor[]
  setSelected: (selected: BypassActor[]) => void
  baseAvatarUrl: string
  enabledBypassActors: BypassActor[]
}

export function BypassDialogRow({
  actorId,
  actorType,
  name,
  owner,
  selected,
  setSelected,
  baseAvatarUrl,
  enabledBypassActors,
}: BypassDialogRowProps) {
  const isChecked = selected.some(item => item.actorId === actorId && item.actorType === actorType)
  return (
    <FormControl>
      <Checkbox
        data-testid="bypass-dialog-checkbox"
        value="actorId"
        checked={isChecked || alreadyAdded(actorId, actorType, enabledBypassActors)}
        onChange={() => {
          if (isChecked) {
            const index = selected.findIndex(
              bypassActor => bypassActor?.actorId === actorId && bypassActor?.actorType === actorType,
            )
            if (index > -1) setSelected([...selected.slice(0, index), ...selected.slice(index + 1)])
          } else {
            setSelected([
              ...selected,
              {actorId, actorType, name, _enabled: true, _dirty: true, bypassMode: ActorBypassMode.ALWAYS, owner},
            ])
          }
        }}
      />
      <FormControl.LeadingVisual>
        <BypassAvatar baseUrl={baseAvatarUrl} id={actorId} name={name} type={actorType} />
      </FormControl.LeadingVisual>
      <FormControl.Label>
        <Box sx={{display: 'flex', alignItems: 'center', fontWeight: 'normal'}}>
          <Truncate title={name} maxWidth={250}>
            <Text sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{name}</Text>
          </Truncate>
          <ActorType actorType={actorType} />
          {actorType === 'Team' ? (
            <Fragment>
              <Text className="note" sx={{marginLeft: 1, marginRight: 1}}>
                &bull;
              </Text>
              <Truncate title={`@${name}`} maxWidth={250}>
                <Text
                  className="note"
                  sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}
                >{`@${name}`}</Text>
              </Truncate>
            </Fragment>
          ) : null}
          {actorType === 'Integration' && owner ? (
            <Fragment>
              <Text className="note" sx={{marginLeft: 1, marginRight: 1}}>
                &bull;
              </Text>
              <Truncate title={owner} maxWidth={250}>
                <Text className="note" sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  {owner}
                </Text>
              </Truncate>
            </Fragment>
          ) : null}
        </Box>
      </FormControl.Label>
    </FormControl>
  )
}
