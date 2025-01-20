import type {Condition, ConditionParameters, TargetType} from '../types/rules-types'

export const mapConditions = (conditions: Condition[] | undefined): Condition[] =>
  conditions?.map(condition => ({
    ...condition,
    _dirty: false,
  })) || []

export const addOrUpdateConditionFactory =
  (target: TargetType, parameters: ConditionParameters) =>
  (state: Condition[]): Condition[] => {
    const index = state.findIndex(condition => condition.target === target)
    if (index !== -1) {
      const updatedCondition = {
        ...state[index]!,
        parameters,
        _dirty: true,
      }
      return [
        ...(index > 0 ? state.slice(0, index) : []),
        updatedCondition,
        ...(index < state.length ? state.slice(index + 1) : []),
      ]
    }

    const newConditions: Condition = {
      parameters,
      target,
      _dirty: true,
    }

    return [...state, newConditions]
  }

export const removeConditionFactory =
  (condition: Condition) =>
  (state: Condition[]): Condition[] => {
    return state.filter(existing => existing.target !== condition.target)
  }
