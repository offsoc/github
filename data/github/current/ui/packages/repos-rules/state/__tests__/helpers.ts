import {createRepository} from '@github-ui/current-repository/test-helpers'

import type {Organization} from '@github-ui/repos-types'
import type {
  Condition,
  RulesetRoutePayload,
  HomeRoutePayload,
  Ruleset,
  RuleSchema,
  RuleSuite,
  InsightsRoutePayload,
  RuleRun,
  RuleSuiteResult,
} from '../../types/rules-types'
import {RulesetEnforcement} from '../../types/rules-types'
import {ActorBypassMode, OrgAdminBypassMode} from '@github-ui/bypass-actors/types'

export const mockRepo = createRepository()

export const mockOrganization: Organization = {
  id: 2,
  name: 'github',
  ownerLogin: 'github',
}

export const conditions: Condition[] = [
  {
    parameters: {
      include: ['refs/heads/main', 'refs/heads/release/*'],
      exclude: ['refs/heads/master'],
    },
    target: 'ref_name',
    _dirty: false,
  },
  {
    parameters: {
      include: ['smile', 'public-server', 'fishsticks*'],
      exclude: ['fishsticks-sneaky'],
    },
    target: 'repository_name',
    _dirty: false,
  },
]

export const metadataCommitterEmailPatternRule = {
  id: 1,
  ruleType: 'committer_email_pattern',
  _enabled: true,
  _dirty: false,
  parameters: {
    pattern: '@github.com$',
    name: 'GitHub Email Rule',
    operator: 'ends_with',
    negate: false,
  },
}

export const pullRequestRule = {
  id: 2,
  ruleType: 'pull_request',
  _enabled: true,
  _dirty: false,
  parameters: {
    required_approving_review_count: 0,
  },
}

export const mockRuleset: Ruleset = {
  id: 1,
  target: 'branch',
  name: 'Ruleset',
  source: {
    id: 1,
    name: 'my-repo',
    type: 'Repository',
    url: '/github',
  },
  orgAdminBypassMode: OrgAdminBypassMode.NoOrgBypass,
  deployKeyBypass: false,
  enforcement: RulesetEnforcement.Enabled,
  matches: [],
  missingConditionTargets: [],
  conditions,
  rules: [metadataCommitterEmailPatternRule, pullRequestRule],
  bypassActors: [
    {
      id: 1,
      name: 'Team 1',
      actorId: 5,
      actorType: 'Team',
      _enabled: true,
      _dirty: false,
      bypassMode: ActorBypassMode.ALWAYS,
    },
    {
      id: 2,
      name: 'Super Bot',
      actorId: 6,
      actorType: 'Integration',
      _enabled: true,
      _dirty: false,
      bypassMode: ActorBypassMode.ALWAYS,
    },
  ],
}

export const mockSimpleRuleSchema: RuleSchema = {
  type: 'creation',
  displayName: 'Restrict creations',
  description: 'Restrict creation of refs',
  beta: false,
  parameterSchema: {
    name: 'name',
    fields: [],
  },
}

const mockMetadataRuleSchema = ({type, displayName}: Pick<RuleSchema, 'type' | 'displayName'>): RuleSchema => ({
  type,
  displayName,
  description: displayName,
  beta: false,
  parameterSchema: {
    name: 'name',
    fields: [
      {
        type: 'string',
        name: 'operator',
        display_name: 'Operator',
        description: 'The operator to use for matching.',
        required: true,
      },
      {
        type: 'string',
        name: 'pattern',
        display_name: 'Pattern',
        description: 'The pattern to match with.',
        required: true,
      },
      {
        type: 'boolean',
        name: 'negate',
        display_name: 'Negate',
        description: 'If true, the rule will fail if the pattern matches.',
        required: false,
      },
      {
        type: 'string',
        name: 'name',
        display_name: 'Name',
        description: 'How this rule will appear to users.',
        required: false,
      },
    ],
  },
  metadataPatternSchema: {
    propertyDescription: displayName,
    supportedOperators: [
      {
        type: 'starts_with',
        displayName: 'start with a matching pattern',
      },
      {
        type: 'ends_with',
        displayName: 'end with a matching pattern',
      },
      {
        type: 'contains',
        displayName: 'contain a matching pattern',
      },
      {
        type: 'regex',
        displayName: 'match a given regex pattern',
      },
    ],
  },
})

export const mockComplexRuleSchema: RuleSchema = {
  type: 'pull_request',
  displayName: 'Require a pull request before merging',
  description:
    'Require all commits be made to a non-target branch and submitted via a pull request before they can be merged.',
  beta: false,
  parameterSchema: {
    name: 'name',
    fields: [
      {
        type: 'integer',
        name: 'required_approving_review_count',
        display_name: 'Required approvals',
        description: 'The number of approving reviews that are required before a pull request can be merged.',
        required: true,
        allowed_range: '0..10',
      },
      {
        type: 'boolean',
        name: 'require_code_owner_review',
        display_name: 'Require review from Code Owners',
        description:
          'Require an approving review in pull requests that modify files that have a designated code owner.',
        required: true,
        default_value: false,
      },
    ],
  },
}

export const ruleRuns: RuleRun[] = [
  {
    id: 1,
    rulesetId: mockRuleset.id,
    ruleType: 'commit_message_pattern',
    result: 'failed',
    insightsCategory: {
      name: `Ruleset ${mockRuleset.id}`,
      id: mockRuleset.id,
    },
    insightsSourceOutOfDate: false,
    message: 'Commit message must start with a matching pattern: breakme',
    ruleDisplayName: 'Restrict commit messages',
    metadata: null,
  },
  {
    id: 2,
    rulesetId: mockRuleset.id,
    ruleType: 'deletion',
    result: 'allowed',
    insightsCategory: {
      name: `Ruleset ${mockRuleset.id}`,
      id: mockRuleset.id,
    },
    insightsSourceOutOfDate: false,
    message: null,
    ruleDisplayName: 'Restrict deletions',
    metadata: null,
  },
  {
    id: 3,
    rulesetId: mockRuleset.id + 1,
    ruleType: 'pull_request',
    result: 'evaluate_failed',
    insightsCategory: {
      name: `Ruleset ${mockRuleset.id + 1}`,
      id: mockRuleset.id + 1,
    },
    insightsSourceOutOfDate: false,
    message: 'Changes must be made through a pull request.',
    ruleDisplayName: 'Require a pull request before merging',
    metadata: null,
  },
  {
    id: 4,
    rulesetId: mockRuleset.id + 1,
    ruleType: 'non_fast_forward',
    result: 'evaluate_allowed',
    insightsCategory: {
      name: `Ruleset ${mockRuleset.id + 1}`,
      id: mockRuleset.id + 1,
    },
    insightsSourceOutOfDate: false,
    message: null,
    ruleDisplayName: 'Block force pushes',
    metadata: null,
  },
]

export const ruleSuiteRuns: RuleSuite[] = [
  {
    id: 1,
    ruleRuns,
    repository: mockRepo,
    result: 'allowed',
    actor: {
      login: mockRepo.ownerLogin,
      name: mockRepo.ownerLogin,
      path: '',
      primaryAvatarUrl: mockRepo.ownerAvatar,
    },
    evaluationMetadata: {},
    refName: 'aaabbbccc',
    createdAt: new Date(),
  },
]

export const rulesetRoutePayload: RulesetRoutePayload = {
  source: mockRepo,
  sourceType: 'repository',
  readOnly: false,
  supportedConditionTargetObjects: ['ref'],
  ruleset: mockRuleset,
  ruleSchemas: [
    mockSimpleRuleSchema,
    mockMetadataRuleSchema({type: 'commit_message_pattern', displayName: 'Commit message'}),
    mockMetadataRuleSchema({type: 'commit_author_email_pattern', displayName: 'Author email'}),
    mockMetadataRuleSchema({type: 'committer_email_pattern', displayName: 'Committer email'}),
    mockMetadataRuleSchema({type: 'branch_name_pattern', displayName: 'Branch'}),
    mockComplexRuleSchema,
  ],
  baseAvatarUrl: '/',
  upsellInfo: {
    organization: false,
    askAdmin: false,
    rulesets: {
      featureEnabled: true,
      cta: {
        visible: false,
      },
    },
    enterpriseRulesets: {
      featureEnabled: true,
      cta: {
        visible: false,
      },
    },
  },
}

export const homeRoutePayload: HomeRoutePayload = {
  source: mockRepo,
  sourceType: 'repository',
  rulesets: [rulesetRoutePayload.ruleset],
  branch: '',
  readOnly: false,
  branchListCacheKey: 'fake-cache-key',
  matchingRulesets: [rulesetRoutePayload.ruleset.id],
  editableRulesets: [rulesetRoutePayload.ruleset.id],
  upsellInfo: {
    organization: false,
    askAdmin: false,
    rulesets: {
      featureEnabled: true,
      cta: {
        visible: false,
      },
    },
    enterpriseRulesets: {
      featureEnabled: true,
      cta: {
        visible: false,
      },
    },
  },
  supportedTargets: ['branch', 'tag', 'push'],
}

export const insightsRoutePayload: InsightsRoutePayload = {
  source: mockRepo,
  sourceType: 'repository',
  upsellInfo: {
    organization: false,
    askAdmin: false,
    rulesets: {
      featureEnabled: true,
      cta: {
        visible: false,
      },
    },
    enterpriseRulesets: {
      featureEnabled: true,
      cta: {
        visible: false,
      },
    },
  },
  rulesets: [
    {
      ...rulesetRoutePayload.ruleset,
      name: 'Ruleset (enabled)',
    },
    {
      ...rulesetRoutePayload.ruleset,
      id: rulesetRoutePayload.ruleset.id + 1,
      name: 'Ruleset (evaluate)',
      enforcement: RulesetEnforcement.Evaluate,
    },
  ],
  repositories: [mockRepo.name],
  ruleSuiteRuns,
  visibleResults: ruleSuiteRuns.reduce<Record<number, RuleSuiteResult>>((acc, suite) => {
    acc[suite.id] = 'allowed'
    return acc
  }, {}),
  branchListCacheKey: 'fake-cache-key',
  filter: {},
  hasMoreSuites: false,
  readOnly: false,
  learnMoreUrl: '',
  supportedTargets: ['branch', 'tag', 'push'],
}
