import type {RulesetTarget, TargetObjectType} from '../types/rules-types'

export const PLURAL_RULESET_TARGETS: {[key in RulesetTarget]: string} = {
  branch: 'branches',
  tag: 'tags',
  push: 'pushes',
  member_privilege: 'member privileges',
}

export const PLURAL_TARGET_OBJECT_TYPES: {[key in TargetObjectType]: string} = {
  ref: 'refs',
  repository: 'repositories',
  organization: 'organizations',
}

export const EXAMPLE_CONDITION_TARGET_PATTERNS: {
  [targetType: string]:
    | {
        [rulesetTarget: string]: string[]
      }
    | undefined
} = {
  ref_name: {
    branch: ['main', 'releases/**/*', 'users/**/*'],
    tag: ['*-beta', 'releases/**/*', 'v*'],
  },
  repository_name: {
    branch: ['prod-*', 'test-*'],
    tag: ['prod-*', 'test-*'],
  },
}

export const TEST_IDS = {
  metadataRulePanelSpan: 'metadata-span',
}

export const TARGET_OBJECT_BY_TYPE = {
  repository_name: 'repository',
  repository_id: 'repository',
  repository_property: 'repository',
  ref_name: 'ref',
  organization_name: 'organization',
  organization_id: 'organization',
}
export const TARGET_OBJECT_TYPES: TargetObjectType[] = ['organization', 'repository', 'ref']

export const UNKNOWN_REF_NAME = 'refs/__gh__/UNKNOWN'
export const PENDING_OID = 'PENDING'

export const INHERITED_SOURCE_TYPE_ORDER_MAP = {
  Enterprise: 0,
  Organization: 1,
  Upstream: 2,
  Repository: 3,
}
