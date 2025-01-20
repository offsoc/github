import type {MutableRefObject} from 'react'
import type {BypassActor} from '@github-ui/bypass-actors/types'

export const mapBypassActors = (
  bypassActors: BypassActor[] | undefined,
  localConditionId: MutableRefObject<number>,
): BypassActor[] =>
  bypassActors?.map(bypassActor => ({
    ...bypassActor,
    _id: localConditionId.current--,
    _enabled: true,
    _dirty: false,
  })) || []

export type BypassActorId = Pick<BypassActor, 'id' | '_id'>
export const findBypassActorIndex = (bypassActors: BypassActorId[], bypassActor: BypassActorId) =>
  bypassActors.findIndex(({id, _id}) =>
    Number.isFinite(id) ? id === bypassActor.id : Number.isFinite(_id) && _id === bypassActor._id,
  )

export const addBypassActorFactory =
  (
    actorId: BypassActor['actorId'],
    actorType: BypassActor['actorType'],
    name: BypassActor['name'],
    bypassMode: BypassActor['bypassMode'],
    owner: BypassActor['owner'],
    _id: number,
  ) =>
  (state: BypassActor[]): BypassActor[] => {
    const index = state.findIndex(bypassActor => bypassActor.actorId === actorId && bypassActor.actorType === actorType)
    if (index !== -1) {
      if (state[index]!._enabled) {
        return state
      }
      const updatedBypassActor = {
        ...state[index]!,
        _enabled: true,
        _dirty: true,
      }
      return [
        ...(index > 0 ? state.slice(0, index) : []),
        updatedBypassActor,
        ...(index < state.length ? state.slice(index + 1) : []),
      ]
    }
    const newBypassActor = {
      _id,
      actorId,
      actorType,
      name,
      _enabled: true,
      _dirty: true,
      bypassMode,
      owner,
    }
    return [...state, newBypassActor]
  }

export const removeBypassActorFactory =
  (bypassActor: BypassActor) =>
  (state: BypassActor[]): BypassActor[] => {
    const index = findBypassActorIndex(state, bypassActor)
    if (index === -1) {
      return state
    }
    // if the bypass actor is not persisted, we can just remove it from the list
    if (!bypassActor.id) {
      return [...state.slice(0, index), ...state.slice(index + 1)]
    }
    return [
      ...(index > 0 ? state.slice(0, index) : []),
      {
        ...bypassActor,
        _dirty: true,
        _enabled: false,
      },
      ...(index < state.length ? state.slice(index + 1) : []),
    ]
  }

export const updateBypassActorFactory =
  (bypassActor: BypassActor) =>
  (state: BypassActor[]): BypassActor[] => {
    const index = findBypassActorIndex(state, bypassActor)
    if (index === -1) return state

    if (state[index]) return [...state.slice(0, index), bypassActor, ...state.slice(index + 1)]

    return state
  }
