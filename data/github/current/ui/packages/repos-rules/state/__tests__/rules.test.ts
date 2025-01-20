import type {Rule, RuleSchema} from '../../types/rules-types'
import {RuleModalState} from '../../types/rules-types'
import type {RuleId} from '../rules'
import {mapRoutePayload, findRuleIndex, addRuleFactory, updateRuleParametersFactory, toggleRuleFactory} from '../rules'

import {rulesetRoutePayload} from './helpers'

const localMetadataRules: Rule[] = [
  {
    id: 1,
    ruleType: 'committer_email_pattern',
    _enabled: true,
    _dirty: false,
    parameters: {
      pattern: '@github\\.com$',
      name: 'GitHub Email Rule',
      operator: 'ends_with',
      negate: false,
    },
  },
  {
    id: 2,
    ruleType: 'author_email_pattern',
    _enabled: false,
    _dirty: true,
    parameters: {
      pattern: '@microsoft\\.com$',
      name: 'Microsoft Email Rule',
      operator: 'regex',
      negate: false,
    },
  },
  {
    _id: -1,
    ruleType: 'commit_message_pattern',
    _enabled: true,
    _dirty: true,
    parameters: {
      pattern: '^JIRA-\\d+',
      name: 'Jira Ticket Rule',
      operator: 'regex',
      negate: false,
    },
  },
]

describe('mapRulesPayload', () => {
  test('should return expected fields', () => {
    const localRuleId = {current: -100}
    const result = mapRoutePayload(rulesetRoutePayload, localRuleId)

    expect(result.rules).toHaveLength(2)

    expect(result.rules[0]).toEqual({
      id: 1,
      _id: -100,
      ruleType: 'committer_email_pattern',
      _enabled: true,
      _dirty: false,
      _modalState: RuleModalState.CLOSED,
      parameters: {
        pattern: '@github.com$',
        name: 'GitHub Email Rule',
        operator: 'ends_with',
        negate: false,
      },
    })

    expect(result.rules[1]).toEqual({
      id: 2,
      _id: -101,
      ruleType: 'pull_request',
      _enabled: true,
      _dirty: false,
      _modalState: RuleModalState.CLOSED,
      parameters: {
        required_approving_review_count: 0,
      },
    })
  })
})

describe('findRuleIndex', () => {
  test('should return an index for matches against {id}, or -1', () => {
    const {rules} = mapRoutePayload(rulesetRoutePayload, {current: -100})

    expect(findRuleIndex(rules, {id: 1})).toBe(0)
    expect(findRuleIndex(rules, {id: 2})).toBe(1)

    expect(findRuleIndex(rules, {id: 4})).toBe(-1)
    expect(findRuleIndex(rules, {id: 0})).toBe(-1)
  })

  test('should return an index for matches against {_id}, or -1', () => {
    /* mocked rules since mapped rules will never have {_id} */
    const rules: RuleId[] = [
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

    expect(findRuleIndex(rules, {_id: -1})).toBe(0)
    expect(findRuleIndex(rules, {_id: -2})).toBe(2)
    expect(findRuleIndex(rules, {_id: -3})).toBe(3)

    expect(findRuleIndex(rules, {_id: -4})).toBe(-1)
    expect(findRuleIndex(rules, {_id: 1})).toBe(-1)
  })
})

describe('addRuleFactory', () => {
  const expectedNewRule: Omit<Rule, '_id'> = {
    ruleType: 'commit_message_pattern',
    _enabled: true,
    _dirty: true,
    parameters: {
      pattern: '',
      name: '',
      operator: 'regex',
      negate: false,
    },
    _modalState: RuleModalState.CREATING,
  }

  const schema: RuleSchema[] = [
    {
      type: 'pull_request',
      displayName: 'Require pull requests',
      description: 'Disallows commits to matching branches unless made via pull requests',
      beta: false,
      parameterSchema: {
        name: 'pull_requests',
        fields: [
          {
            name: 'required_approving_review_count',
            display_name: 'Required approvals',
            description: 'Number of required approvals',
            type: 'integer',
            required: true,
            default_value: 1,
          },
          {
            name: 'foo',
            display_name: 'Foo',
            description: 'Foobar',
            type: 'string',
            required: false,
          },
        ],
      },
    },
    {
      type: 'commit_message_pattern',
      displayName: '',
      description: '',
      beta: false,
      parameterSchema: {
        name: 'commit_message_pattern',
        fields: [
          {
            name: 'operator',
            display_name: 'Operator',
            description: 'Operator',
            type: 'string',
            required: true,
            default_value: '',
          },
          {
            name: 'pattern',
            display_name: 'Pattern',
            description: 'Pattern',
            type: 'string',
            required: true,
            default_value: '',
          },
          {
            name: 'name',
            display_name: 'Name',
            description: 'Name',
            type: 'string',
            required: false,
            default_value: '',
          },
          {
            name: 'negate',
            display_name: 'Negate',
            description: 'Negate',
            type: 'string',
            required: false,
            default_value: false,
          },
        ],
      },
      metadataPatternSchema: {
        propertyDescription: 'Commit message',
        supportedOperators: [
          {type: 'regex', displayName: 'matches regex'},
          {type: 'ends_with', displayName: 'end with'},
        ],
      },
    },
  ]

  test('should append a new empty rule given empty state', () => {
    const newState = addRuleFactory(schema[1]!, 'commit_message_pattern', -1)([])

    expect(newState).toHaveLength(1)
    expect(newState[0]).toEqual({
      _id: -1,
      ...expectedNewRule,
    })
  })

  test('should append a new empty rule to existing state', () => {
    const newState = addRuleFactory(schema[1]!, 'commit_message_pattern', -2)(localMetadataRules)

    expect(newState.slice(0, 3)).toEqual(localMetadataRules)
    expect(newState).toHaveLength(4)

    expect(newState[3]).toEqual({
      _id: -2,
      ...expectedNewRule,
    })
  })

  test('should add rule with defaults', () => {
    const newState = addRuleFactory(schema[0]!, 'pull_request', -1)([])

    expect(newState).toEqual([
      {
        _id: -1,
        ruleType: 'pull_request',
        _enabled: true,
        _dirty: true,
        parameters: {
          required_approving_review_count: 1,
        },
      },
    ])
  })
})

describe('updateRuleParametersFactory', () => {
  test('should return state as is if the given rule is not found', () => {
    const newState = updateRuleParametersFactory(
      {
        ...localMetadataRules[0]!,
        id: 12,
      },
      {pattern: 'new_pattern'},
    )(localMetadataRules)

    expect(newState).toEqual(localMetadataRules)
  })

  test('should return new state with the parameters of the given rule merged in and _dirty: true', () => {
    const newState = updateRuleParametersFactory(localMetadataRules[0]!, {pattern: 'new_pattern'})(localMetadataRules)

    expect(newState).toHaveLength(localMetadataRules.length)
    expect(newState[0]).toEqual({
      id: 1,
      ruleType: 'committer_email_pattern',
      _enabled: true,
      _dirty: true,
      parameters: {
        pattern: 'new_pattern',
        name: 'GitHub Email Rule',
        operator: 'ends_with',
        negate: false,
      },
    })
  })
})

describe('toggleRuleFactory', () => {
  test('should return state as is if the given rule is not found', () => {
    const newState = toggleRuleFactory(
      {
        ...localMetadataRules[0]!,
        id: 12,
      },
      false,
    )(localMetadataRules)

    expect(newState).toEqual(localMetadataRules)
  })

  test('should return a new array with the given rule marked as _enabled: false and _dirty: true if id exists (server side)', () => {
    const removeFirstRuleState = toggleRuleFactory(localMetadataRules[0]!, false)(localMetadataRules)

    expect(removeFirstRuleState).toHaveLength(localMetadataRules.length)
    expect(removeFirstRuleState).toEqual([
      {
        ...localMetadataRules[0]!,
        _enabled: false,
        _dirty: true,
      },
      ...localMetadataRules.slice(1),
    ])

    const removeSecondRuleState = toggleRuleFactory(localMetadataRules[1]!, false)(localMetadataRules)

    expect(removeSecondRuleState).toHaveLength(localMetadataRules.length)
    expect(removeSecondRuleState).toEqual([
      localMetadataRules[0]!,
      {
        ...localMetadataRules[1],
        _enabled: false,
        _dirty: true,
      },
      localMetadataRules[2],
    ])
  })

  test('should remove rules with _id from the resulting array', () => {
    const removeLastRuleState = toggleRuleFactory(localMetadataRules[2]!, false)(localMetadataRules)

    expect(removeLastRuleState).toHaveLength(localMetadataRules.length - 1)
    expect(removeLastRuleState).toEqual(localMetadataRules.slice(0, -1))
  })

  test('should disable the last item in an array for a given id', () => {
    const removeLastRuleState = toggleRuleFactory(localMetadataRules[0]!, false)([localMetadataRules[0]!])

    expect(removeLastRuleState).toHaveLength(1)
    expect(removeLastRuleState).toEqual([
      {
        ...localMetadataRules[0]!,
        _dirty: true,
        _enabled: false,
      },
    ])
  })
})

describe('toggleDynamicRuleFactory', () => {
  test('should return state as is if the rule to toggle is not found (by _id)', () => {
    const localRuleId = {current: -100}
    const {rules} = mapRoutePayload(rulesetRoutePayload, localRuleId)

    const newState = toggleRuleFactory(
      {
        ...rules[0]!,
        id: undefined,
        _id: 12,
      },
      true,
    )(rules)

    expect(newState).toEqual(rules)
  })

  test('should toggle the _enabled field and set _dirty: true for the given rule', () => {
    const {rules} = mapRoutePayload(rulesetRoutePayload, {current: -100})

    const newState = toggleRuleFactory(rules[0]!, true)(rules)

    expect(newState[0]).toEqual({
      ...rules[0],
      _enabled: true,
      _dirty: true,
    })
    /* the rest of the array should be unchanged */
    expect(newState.slice(1)).toEqual(rules.slice(1))
  })
})
