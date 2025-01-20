import {ActorBypassMode, type BypassActor} from '@github-ui/bypass-actors/types'
import type {BypassActorId} from '../bypass-actors'
import {mapBypassActors, findBypassActorIndex, addBypassActorFactory, removeBypassActorFactory} from '../bypass-actors'
import {rulesetRoutePayload} from './helpers'

const localBypassActors: BypassActor[] = [
  {
    name: 'Team 2',
    _id: -1,
    _enabled: true,
    _dirty: false,
    actorId: 10,
    actorType: 'Team',
    bypassMode: ActorBypassMode.ALWAYS,
  },
]

describe('mapBypassActors', () => {
  test('should return an empty array given undefined', () => {
    expect(mapBypassActors(undefined, {current: -1})).toEqual([])
  })

  test('should return expected fields', () => {
    const localId = {current: -100}
    const bypassActors = mapBypassActors(rulesetRoutePayload.ruleset.bypassActors, localId)

    expect(bypassActors).toHaveLength(2)

    expect(bypassActors[0]).toEqual({
      id: 1,
      _id: -100,
      _enabled: true,
      _dirty: false,
      name: 'Team 1',
      actorId: 5,
      actorType: 'Team',
      bypassMode: 0,
    })

    expect(bypassActors[1]).toEqual({
      id: 2,
      _id: -101,
      _enabled: true,
      _dirty: false,
      name: 'Super Bot',
      actorId: 6,
      actorType: 'Integration',
      bypassMode: 0,
    })
  })
})

// this method starts with 'findBy', so it gets picked up by the linter looking for async queries
describe('findBypassActorIndex', () => {
  test('should return an index for matches against {id}, or -1', () => {
    const localId = {current: -100}
    const bypassActors = mapBypassActors(rulesetRoutePayload.ruleset.bypassActors, localId)

    // eslint-disable-next-line testing-library/await-async-query
    expect(findBypassActorIndex(bypassActors, {id: 1})).toBe(0)

    // eslint-disable-next-line testing-library/await-async-query
    expect(findBypassActorIndex(bypassActors, {id: 4})).toBe(-1)
    // eslint-disable-next-line testing-library/await-async-query
    expect(findBypassActorIndex(bypassActors, {id: 0})).toBe(-1)
  })

  test('should return an index for matches against {_id}, or -1', () => {
    const rules: BypassActorId[] = [
      {
        _id: -1,
      },
      {
        id: 1,
      },
      {
        _id: -2,
      },
      {
        _id: -3,
      },
    ]

    // eslint-disable-next-line testing-library/await-async-query
    expect(findBypassActorIndex(rules, {_id: -1})).toBe(0)
    // eslint-disable-next-line testing-library/await-async-query
    expect(findBypassActorIndex(rules, {_id: -2})).toBe(2)
    // eslint-disable-next-line testing-library/await-async-query
    expect(findBypassActorIndex(rules, {_id: -3})).toBe(3)

    // eslint-disable-next-line testing-library/await-async-query
    expect(findBypassActorIndex(rules, {_id: -4})).toBe(-1)
    // eslint-disable-next-line testing-library/await-async-query
    expect(findBypassActorIndex(rules, {_id: 1})).toBe(-1)
  })
})

describe('addBypassActorFactory', () => {
  const expectedNewBypassActor: BypassActor = {
    _enabled: true,
    _dirty: true,
    name: 'Team 3',
    actorId: 3,
    actorType: 'Team',
    bypassMode: ActorBypassMode.ALWAYS,
  }

  test('should append a new empty rule given empty state', () => {
    const newState = addBypassActorFactory(3, 'Team', 'Team 3', ActorBypassMode.ALWAYS, undefined, -1)([])

    expect(newState).toHaveLength(1)
    expect(newState[0]).toEqual({
      _id: -1,
      ...expectedNewBypassActor,
    })
  })

  test('should not change an unchanged state', () => {
    const newState = addBypassActorFactory(
      10,
      'Team',
      'Team 2',
      ActorBypassMode.ALWAYS,
      undefined,
      -1,
    )(localBypassActors)

    expect(newState).toHaveLength(1)
    expect(newState[0]).toEqual(newState[0])
  })
})

describe('different methods called in succession', () => {
  it('should add, remove, and add again the same bypass actor', () => {
    let state: BypassActor[] = []
    state = addBypassActorFactory(3, 'Team', 'Team 3', ActorBypassMode.ALWAYS, undefined, -1)(state)
    state = removeBypassActorFactory({
      _id: -1,
      _enabled: true,
      _dirty: true,
      name: 'Team 3',
      actorId: 3,
      actorType: 'Team',
      bypassMode: ActorBypassMode.ALWAYS,
    })(state)
    expect(state).toHaveLength(0)
    state = addBypassActorFactory(3, 'Team', 'Team 3', ActorBypassMode.ALWAYS, undefined, -1)(state)

    expect(state).toHaveLength(1)
    expect(state[0]).toEqual({
      _id: -1,
      _enabled: true,
      _dirty: true,
      name: 'Team 3',
      actorId: 3,
      actorType: 'Team',
      bypassMode: 0,
    })
  })
  it('should remove then add a bypass actor that is persisted', () => {
    const bypassActor = rulesetRoutePayload.ruleset.bypassActors![0]!
    let state = rulesetRoutePayload.ruleset.bypassActors!
    expect(state).toHaveLength(2)

    state = removeBypassActorFactory(bypassActor)(state)
    expect(state).toHaveLength(2)
    expect(state[0]).toEqual({
      ...bypassActor,
      _enabled: false,
      _dirty: true,
    })

    state = addBypassActorFactory(
      bypassActor.actorId,
      bypassActor.actorType,
      bypassActor.name,
      bypassActor.bypassMode,
      undefined,
      -1,
    )(state)
    expect(state).toHaveLength(2)
    expect(state[0]).toEqual({
      ...bypassActor,
      _enabled: true,
      _dirty: true,
    })
  })
})
