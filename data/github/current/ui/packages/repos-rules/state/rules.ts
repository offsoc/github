import type {MutableRefObject} from 'react'
import type {Rule, ServerRule, LocalRule, RulesetRoutePayload, Parameter, RuleSchema} from '../types/rules-types'
import {RuleModalState} from '../types/rules-types'

type MappedRoutePayload = {
  rules: Rule[]
}

export const mapRules = (rules: ServerRule[] | undefined, localRuleId: MutableRefObject<number>): Rule[] =>
  rules?.map(rule => ({
    ...rule,
    _id: localRuleId.current--,
    _enabled: true,
    _dirty: false,
    _modalState: RuleModalState.CLOSED,
  })) || []

export const mapRoutePayload = (
  payload: RulesetRoutePayload,
  localRuleId: MutableRefObject<number>,
): MappedRoutePayload => {
  const rules = mapRules(payload.ruleset.rules, localRuleId)

  return {
    rules,
  }
}

export type RuleId = Pick<Rule, 'id' | '_id'>
export const findRuleIndex = (rules: RuleId[], rule: RuleId) =>
  rules.findIndex(({id, _id}) => (Number.isFinite(id) ? id === rule.id : Number.isFinite(_id) && _id === rule._id))

export const addRuleFactory =
  (ruleSchema: RuleSchema, type: string, _id: number) =>
  (state: Rule[]): Rule[] => {
    const defaultParameters = ruleSchema.parameterSchema.fields.reduce<
      Record<string, number | string | boolean | object | Array<number | string | object>>
    >((map, field) => {
      if (typeof field.default_value === 'undefined') {
        return map
      }

      map[field.name] = field.default_value
      return map
    }, {})

    const newRule = {
      ruleType: type,
      parameters: defaultParameters,
      _id,
      _enabled: true,
      _dirty: true,
      _modalState: RuleModalState.CREATING,
    }

    if (ruleSchema.metadataPatternSchema && !newRule.parameters.operator) {
      newRule.parameters.operator = ruleSchema.metadataPatternSchema.supportedOperators[0]!.type
    }

    return [
      ...state,
      {
        ruleType: type,
        // TODO: Fix typing
        parameters: defaultParameters as never,
        _id,
        _enabled: true,
        _dirty: true,
        _modalState: ruleSchema.metadataPatternSchema ? RuleModalState.CREATING : undefined,
      },
    ]
  }

export const updateRuleParametersFactory =
  (rule: Rule, parameters: Parameter) =>
  (state: Rule[]): Rule[] => {
    const index = findRuleIndex(state, rule)

    if (index === -1) {
      return state
    }

    const updatedRule = {
      ...state[index]!,
      ruleType: rule.ruleType,
      _dirty: true,
      parameters: {
        ...state[index]!.parameters,
        ...parameters,
      },
    }

    return [
      ...(index > 0 ? state.slice(0, index) : []),
      updatedRule,
      ...(index < state.length ? state.slice(index + 1) : []),
    ]
  }

export const updateRuleModalStateFactory =
  <T extends LocalRule>(rule: T, newModalState: RuleModalState) =>
  (state: T[]): T[] => {
    const index = findRuleIndex(state, rule)

    if (index === -1) {
      return state
    }

    const updatedRule = {
      ...state[index]!,
      _modalState: newModalState,
    }

    return [
      ...(index > 0 ? state.slice(0, index) : []),
      updatedRule,
      ...(index < state.length ? state.slice(index + 1) : []),
    ]
  }

export const toggleRuleFactory =
  (rule: Rule, ruleEnabled: boolean) =>
  (state: Rule[]): Rule[] => {
    const index = findRuleIndex(state, rule)

    if (index === -1) {
      return state
    }

    const toggledRule = {
      ...rule,
      _dirty: true,
      _enabled: ruleEnabled,
    }

    if (rule.parameters.max_ref_updates !== undefined) {
      const stateModified: Rule[] = state
      for (let i = 0; i < stateModified.length; i++) {
        if (stateModified[i]!.parameters.max_ref_updates) {
          stateModified[index] = toggledRule
        }
      }

      return [...stateModified]
    } else if (rule.id) {
      // this is a db record, update the record to be _enabled: false so it's removed server side
      return [
        ...(index > 0 ? state.slice(0, index) : []),
        toggledRule,
        ...(index < state.length ? state.slice(index + 1) : []),
      ]
    } else {
      // else, this is a local record, just remove it entirely
      return [...(index > 0 ? state.slice(0, index) : []), ...(index < state.length ? state.slice(index + 1) : [])]
    }
  }
