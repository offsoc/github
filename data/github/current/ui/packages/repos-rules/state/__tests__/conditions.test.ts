import type {Condition} from '../../types/rules-types'
import {mapConditions, addOrUpdateConditionFactory, removeConditionFactory} from '../conditions'
import {rulesetRoutePayload} from './helpers'

const localConditions: Condition[] = [
  {
    _dirty: false,
    parameters: {
      include: [],
      exclude: ['refs/heads/branchymcbranchface'],
    },
    target: 'ref_name',
  },
]

describe('mapConditionsPayload', () => {
  test('should return an empty array given undefined', () => {
    expect(mapConditions(undefined)).toEqual([])
  })

  test('should return expected fields', () => {
    const conditions = mapConditions(rulesetRoutePayload.ruleset.conditions)

    expect(conditions).toHaveLength(2)

    expect(conditions[0]).toEqual({
      _dirty: false,
      parameters: {
        include: ['refs/heads/main', 'refs/heads/release/*'],
        exclude: ['refs/heads/master'],
      },
      target: 'ref_name',
    })

    expect(conditions[1]).toEqual({
      _dirty: false,
      parameters: {
        include: ['smile', 'public-server', 'fishsticks*'],
        exclude: ['fishsticks-sneaky'],
      },
      target: 'repository_name',
    })
  })
})

describe('addOrUpdateConditionFactory', () => {
  const expectedNewCondition: Condition = {
    _dirty: true,
    parameters: {
      include: ['refs/heads/new'],
      exclude: [],
    },
    target: 'ref_name',
  }

  test('should append a new empty rule given empty state', () => {
    const newState = addOrUpdateConditionFactory('ref_name', {include: ['refs/heads/new'], exclude: []})([])

    expect(newState).toHaveLength(1)
    expect(newState[0]).toEqual(expectedNewCondition)
  })

  test('should not change an unchanged state', () => {
    const newState = addOrUpdateConditionFactory('ref_name', {include: ['refs/heads/new'], exclude: []})(
      localConditions,
    )

    expect(newState).toHaveLength(1)
    expect(newState[0]).toEqual(expectedNewCondition)
  })

  test('should update parameters when changed', () => {
    const newState = addOrUpdateConditionFactory('ref_name', {include: [], exclude: ['refs/heads/new']})(
      localConditions,
    )

    expect(newState).toHaveLength(1)
    expect(newState[0]).toEqual({
      ...localConditions[0],
      _dirty: true,
      parameters: {
        include: [],
        exclude: ['refs/heads/new'],
      },
    })
  })

  test('should remove a single parameter from a condition if found and keep the rest of the condition', () => {
    const multiParameterState: Condition[] = [
      {
        ...localConditions[0]!,
        parameters: {
          include: ['refs/heads/first', 'refs/heads/second'],
          exclude: [],
        },
      },
    ]
    const newState = addOrUpdateConditionFactory('ref_name', {
      include: ['refs/heads/second'],
      exclude: [],
    })(multiParameterState)

    expect(newState).toHaveLength(1)
    expect(newState[0]).toEqual({
      ...multiParameterState[0],
      _dirty: true,
      parameters: {
        include: ['refs/heads/second'],
        exclude: [],
      },
    })
  })
})

describe('removeConditionFactory', () => {
  test('should remove a given condition', () => {
    const newState = removeConditionFactory(localConditions[0]!)(localConditions)

    expect(newState).toHaveLength(0)
  })
})
