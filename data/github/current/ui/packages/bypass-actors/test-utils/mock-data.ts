import {ActorBypassMode, type BypassActor} from '../bypass-actors-types'

export const getBypassActor = (
  id: number,
  type: BypassActor['actorType'],
  bypassMode: BypassActor['bypassMode'] = ActorBypassMode.ALWAYS,
): BypassActor => ({
  actorId: id,
  actorType: type,
  name: `actor-${type}-${id}`,
  bypassMode,
  _enabled: true,
  _dirty: false,
})
