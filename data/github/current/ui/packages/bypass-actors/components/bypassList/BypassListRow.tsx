import {ActionList, ActionMenu, FormControl, IconButton, Text, Box} from '@primer/react'
import {TrashIcon, KebabHorizontalIcon} from '@primer/octicons-react'
import {BypassAvatar} from '../BypassAvatar'
import {ActorType} from '../ActorType'
import {ActorBypassMode, type BypassActor} from '../../bypass-actors-types'
import {LOCKED_BYPASS_MODE_ACTOR_TYPES} from '../../helpers/constants'

type BypassActorMode = {
  type: ActorBypassMode
  text: string
  description: string
  shortName: string
}

const bypassActorModeArray: BypassActorMode[] = [
  {
    type: ActorBypassMode.ALWAYS,
    text: 'Always',
    description: 'Always allow rules to be bypassed',
    shortName: 'Always allow',
  },
  {
    type: ActorBypassMode.PRS_ONLY,
    text: 'For pull requests only',
    description: 'Only allow rules to be bypassed on pull requests',
    shortName: 'Allow for pull requests only',
  },
]

export function BypassListRow({
  actor,
  baseAvatarUrl,
  readOnly,
  removeBypassActor,
  updateBypassActor,
  isBypassModeEnabled,
}: {
  actor: BypassActor
  baseAvatarUrl: string
  readOnly?: boolean
  removeBypassActor: (bypassActor: BypassActor) => void
  updateBypassActor: (bypassActor: BypassActor) => void
  isBypassModeEnabled: boolean
}) {
  function getSelectedMode(currentActor: BypassActor, getType: boolean) {
    const selectedMode = bypassActorModeArray.find(mode => mode.type === currentActor.bypassMode)
    if (getType) {
      return selectedMode?.type
    } else {
      return selectedMode?.shortName
    }
  }

  function modeIsSelected(currentActor: BypassActor, option: BypassActorMode) {
    const comparisonValue = getSelectedMode(currentActor, true)
    return comparisonValue === option.type
  }

  function humanizeRoleName(currentActor: BypassActor) {
    if (currentActor.actorType === 'RepositoryRole') {
      switch (currentActor.name) {
        case 'admin':
          return 'Repository admin'
        case 'maintain':
          return 'Maintain'
        case 'write':
          return 'Write'
        default:
          return currentActor.name
      }
    }
    return currentActor.name
  }

  function actorMetadata({actorType, name, owner}: BypassActor) {
    if (actorType === 'Team') {
      return <span className="note"> &bull; {`@${name}`} </span>
    }
    if (actorType === 'Integration' && owner) {
      return <span className="note"> &bull; {owner} </span>
    }
    return null
  }

  return (
    <li key={actor._id} className="Box-row d-flex flex-justify-between flex-items-center py-2">
      <div className="d-flex flex-items-center gap-3">
        <BypassAvatar
          baseUrl={baseAvatarUrl}
          id={actor.actorId}
          name={humanizeRoleName(actor)}
          type={actor.actorType}
        />
        <div>
          {humanizeRoleName(actor)}
          <ActorType actorType={actor.actorType} />
          {actorMetadata(actor)}
        </div>
      </div>
      <div className={`d-flex pl-3 flex-items-center`}>
        {getSelectedMode(actor, false) &&
          (!readOnly ? (
            <RowRightHalfUnboxed
              actor={actor}
              updateBypassActor={updateBypassActor}
              isBypassModeEnabled={isBypassModeEnabled}
              getSelectedMode={getSelectedMode}
              modeIsSelected={modeIsSelected}
              removeBypassActor={removeBypassActor}
            />
          ) : (
            <>{getSelectedMode(actor, false)}</>
          ))}
      </div>
    </li>
  )
}

export function BypassActorMenu({
  actor,
  updateBypassActor,
  unboxRules,
  modeIsSelected,
}: {
  actor: BypassActor
  updateBypassActor: (bypassActor: BypassActor) => void
  unboxRules: boolean
  modeIsSelected: (currentActor: BypassActor, option: BypassActorMode) => boolean
}) {
  return (
    <>
      {bypassActorModeArray.map(option => (
        <ActionList.Item
          key={option.type}
          selected={modeIsSelected(actor, option)}
          onSelect={() => {
            updateBypassActor({...actor, bypassMode: option.type, _dirty: true})
          }}
        >
          <Box sx={{...(unboxRules && {whiteSpace: 'nowrap', overflow: 'hidden'})}}>{option.text}</Box>
          {!unboxRules && <ActionList.Description variant="block">{option.description}</ActionList.Description>}
        </ActionList.Item>
      ))}
    </>
  )
}

function RowRightHalfUnboxed({
  actor,
  updateBypassActor,
  isBypassModeEnabled,
  getSelectedMode,
  modeIsSelected,
  removeBypassActor,
}: {
  actor: BypassActor
  updateBypassActor: (bypassActor: BypassActor) => void
  isBypassModeEnabled: boolean
  getSelectedMode: (currentActor: BypassActor, getType: boolean) => string | ActorBypassMode | undefined
  modeIsSelected: (currentActor: BypassActor, option: BypassActorMode) => boolean
  removeBypassActor: (bypassActor: BypassActor) => void
}) {
  return (
    <>
      {isBypassModeEnabled && <Text sx={{color: 'fg.muted', mr: 2}}>{getSelectedMode(actor, false)}</Text>}
      <FormControl>
        {isBypassModeEnabled && <FormControl.Label visuallyHidden>Select bypass mode</FormControl.Label>}
        <ActionMenu>
          <ActionMenu.Anchor>
            <IconButton
              sx={{color: 'fg.muted'}}
              icon={KebabHorizontalIcon}
              variant="invisible"
              aria-label="Bypass actor actions"
              title="Bypass actor actions"
            />
          </ActionMenu.Anchor>

          <ActionMenu.Overlay width="auto">
            <ActionList>
              <>
                {isBypassModeEnabled && !LOCKED_BYPASS_MODE_ACTOR_TYPES.includes(actor.actorType) && (
                  <>
                    <ActionList.Group selectionVariant="single">
                      <ActionList.GroupHeading>Allow</ActionList.GroupHeading>
                      <BypassActorMenu
                        actor={actor}
                        updateBypassActor={updateBypassActor}
                        unboxRules
                        modeIsSelected={modeIsSelected}
                      />
                    </ActionList.Group>
                    <ActionList.Divider />
                  </>
                )}
                <ActionList.Item variant="danger" onSelect={() => removeBypassActor(actor)}>
                  <ActionList.LeadingVisual>
                    <TrashIcon />
                  </ActionList.LeadingVisual>
                  Delete bypass
                </ActionList.Item>
              </>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </FormControl>
    </>
  )
}
