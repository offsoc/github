import type {
  Rule,
  Ruleset,
  Condition,
  RuleSchema,
  UpsellInfo,
  PropertyConfiguration,
  RepositoryPropertyParameters,
} from '../types/rules-types'
import {RulesetEnforcement} from '../types/rules-types'
import {OrgAdminBypassMode} from '@github-ui/bypass-actors/types'

export function createRuleset(partial?: Partial<Ruleset>): Ruleset {
  return {
    id: 1,
    target: 'branch',
    name: 'Test Ruleset',
    matches: [],
    conditions: [],
    source: {
      id: 1,
      type: 'Repository',
      name: 'my-repo',
    },
    orgAdminBypassMode: OrgAdminBypassMode.NoOrgBypass,
    deployKeyBypass: false,
    enforcement: RulesetEnforcement.Disabled,
    rules: [],
    missingConditionTargets: ['ref'],
    ...(partial || {}),
  }
}

export function createRule(partial?: Partial<Rule>): Rule {
  return {
    id: 1,
    _enabled: true,
    _dirty: true,
    ruleType: 'pull_request',
    parameters: {},
    ...(partial || {}),
  }
}

export function createRuleSchema(partial?: Partial<RuleSchema>): RuleSchema {
  return {
    type: 'pull_request',
    displayName: 'Require pull requests',
    description: 'Require pull requests',
    beta: false,
    parameterSchema: {
      name: 'pull_request',
      fields: [],
    },
    ...partial,
  }
}

export function createMetadataRuleSchema(partial?: Partial<RuleSchema>): RuleSchema {
  return {
    type: 'commit_author_email_pattern',
    displayName: 'commit_author_email_pattern',
    description: 'commit_author_email_pattern',
    beta: false,
    parameterSchema: {
      name: '',
      fields: [],
    },
    metadataPatternSchema: {
      supportedOperators: [
        {
          type: 'start_with',
          displayName: 'start with a matching pattern',
        },
      ],
      propertyDescription: 'Commit author email',
    },
    ...partial,
  }
}

export function createMetadataRule(partial?: Partial<Rule>): Rule {
  return {
    id: 1,
    _enabled: true,
    _dirty: true,
    ruleType: 'commit_author_email_pattern',
    parameters: {
      name: '',
      negate: false,
      operator: 'starts_with',
      pattern: '*',
    },
    ...(partial || {}),
  }
}

export function createRefNameCondition(
  include?: string[],
  exclude?: string[],
  partial?: Partial<Condition>,
): Condition {
  return {
    _dirty: true,
    parameters: {
      include: include || [],
      exclude: exclude || [],
    },
    target: 'ref_name',
    ...(partial || {}),
  }
}

export function createRepoIdCondition(repository_ids?: string[], condition?: Partial<Condition>): Condition {
  return {
    _dirty: true,
    parameters: {
      repository_ids: repository_ids || [],
    },
    target: 'repository_id',
    ...(condition || {}),
  }
}

export function createPropertyCondition(
  include?: PropertyConfiguration[],
  exclude?: PropertyConfiguration[],
): Condition {
  return {
    _dirty: true,
    parameters: {
      include: include || [
        {
          name: 'environment',
          source: 'custom',
          property_values: ['testing'],
        },
      ],
      exclude: exclude || [],
    } as RepositoryPropertyParameters,
    target: 'repository_property',
  }
}

export function createUpsellInfo(): UpsellInfo {
  return {
    organization: false,
    askAdmin: false,
    enterpriseRulesets: {
      featureEnabled: false,
      cta: {
        visible: true,
      },
    },
    rulesets: {
      featureEnabled: true,
      cta: {
        visible: false,
      },
    },
  }
}
