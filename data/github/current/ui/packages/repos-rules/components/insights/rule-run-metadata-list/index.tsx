/* eslint eslint-comments/no-use: off */
/* eslint-disable filenames/match-regex */
import type {RuleRun, PullRequestMetadata, ChecksMetadata, DeploymentsMetadata} from '../../../types/rules-types'
import {PullRequestList} from './rule-types/PullRequestList'
import {StatusChecksList} from './rule-types/StatusChecksList'
import {DeploymentsList} from './rule-types/DeploymentsList'
import {ViolationsList} from './rule-types/ViolationsList'

export function RuleRunMetadataList({ruleRun}: {ruleRun: RuleRun}) {
  switch (ruleRun.ruleType) {
    case 'pull_request':
      return <PullRequestList metadata={ruleRun.metadata!} />

    case 'required_status_checks':
      return <StatusChecksList metadata={ruleRun.metadata!} />

    case 'required_deployments':
      return <DeploymentsList metadata={ruleRun.metadata!} />

    case 'file_extension_restriction':
    case 'file_path_restriction':
    case 'max_file_path_length':
    case 'max_file_size':
      return <ViolationsList violations={ruleRun.violations!} format="path" />

    case 'commit_author_email_pattern':
    case 'commit_message_pattern':
    case 'commit_oid':
    case 'committer_email_pattern':
    case 'required_linear_history':
    case 'required_signatures':
    case 'ruleset_required_signatures':
      return <ViolationsList violations={ruleRun.violations!} format="commit" />
  }

  return null
}

export function hasAdditionalMetadata(ruleRun: RuleRun) {
  switch (ruleRun.ruleType) {
    case 'pull_request':
      return (ruleRun.metadata as PullRequestMetadata)?.prReviewers.length

    case 'required_status_checks':
      return (ruleRun.metadata as ChecksMetadata)?.checks.length

    case 'required_deployments':
      return (ruleRun.metadata as DeploymentsMetadata)?.deploymentResults.length

    case 'commit_author_email_pattern':
    case 'commit_message_pattern':
    case 'commit_oid':
    case 'committer_email_pattern':
    case 'file_extension_restriction':
    case 'file_path_restriction':
    case 'max_file_path_length':
    case 'max_file_size':
    case 'required_linear_history':
    case 'required_signatures':
    case 'ruleset_required_signatures':
      return ruleRun.violations?.total
  }

  return false
}
