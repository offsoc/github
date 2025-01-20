import type {BypassActor} from '../../bypass-actors-types'

export function alreadyAdded(actorId: number | string | null, actorType: string, enabledBypassActors: BypassActor[]) {
  return enabledBypassActors.some(
    ({actorId: matchingActorId, actorType: matchingActorType}) =>
      matchingActorId === actorId && matchingActorType === actorType,
  )
}

export function getEnabledBypassActor(
  actorId: number | string | null,
  actorType: string,
  enabledBypassActors: BypassActor[],
) {
  return enabledBypassActors.find(
    ({actorId: matchingActorId, actorType: matchingActorType}) =>
      matchingActorId === actorId && matchingActorType === actorType,
  )
}
