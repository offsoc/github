import {Box, Text} from '@primer/react'
import {AlertIcon} from './common/AlertIcon'
import {MergeBoxSectionHeader} from './common/MergeBoxSectionHeader'
import type {PullRequestMergeRequirements} from '../../types'

const RULE_ROLLUP_TYPES_EXCLUDED_FROM_DISPLAY = ['MERGE_QUEUE']

// Temporarily allow %other and very generous message types to avoid type casting
export interface BlockedSectionProps {
  isDraft: boolean
  failingMergeConditionsWithoutRulesCondition: Array<{message: string | null | undefined} | {__typename: '%other'}>
  // There should only be one rules condition, but keep an array for keeping interfaces similar
  failingRulesConditions: Array<
    | {
        message: string | null | undefined
        ruleRollups?:
          | ReadonlyArray<{message: string | null | undefined; ruleType: string; result: string}>
          | undefined
          | null
      }
    | {__typename: '%other'}
  >
  mergeRequirementsState: PullRequestMergeRequirements['state']
}

/**
 *
 * Describes why a pull request is unmergeable
 *
 * If the pull request is unmergeable, this component will render a section describing why
 * If the pull request is mergeable or the status is unknown, it will return null
 */
export function BlockedSection({
  failingMergeConditionsWithoutRulesCondition,
  failingRulesConditions,
  isDraft,
  mergeRequirementsState,
}: BlockedSectionProps) {
  if (isDraft || mergeRequirementsState !== 'UNMERGEABLE') return null

  const failingRuleRollups = failingRulesConditions
    .flatMap(c => ('ruleRollups' in c ? c.ruleRollups : []))
    .filter(rule => rule?.result === 'FAILED' && !RULE_ROLLUP_TYPES_EXCLUDED_FROM_DISPLAY.includes(rule.ruleType))

  const failingConditionsAndRules = [...failingMergeConditionsWithoutRulesCondition, ...failingRuleRollups]

  return (
    <Box aria-label="Merging is blocked" as="section" sx={{borderBottom: '1px solid', borderColor: 'border.muted'}}>
      <MergeBoxSectionHeader title="Merging is blocked" icon={<AlertIcon />}>
        <ul className="list-style-none">
          {failingConditionsAndRules.map(
            (condition, i) =>
              condition &&
              'message' in condition && (
                <Text key={i} as="li" sx={{color: 'fg.muted', mb: 0}}>
                  {condition.message}
                </Text>
              ),
          )}
        </ul>
      </MergeBoxSectionHeader>
    </Box>
  )
}
