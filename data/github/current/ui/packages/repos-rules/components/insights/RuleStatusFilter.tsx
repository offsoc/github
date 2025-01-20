import {ActionMenuSelector} from '@github-ui/action-menu-selector'
import type {RuleStatus} from '../../types/rules-types'

const orderedStatuses: RuleStatus[] = ['all', 'pass', 'fail', 'bypass']

const ruleStatuses: Record<RuleStatus, string> = {
  all: 'All statuses',
  pass: 'Pass',
  fail: 'Fail',
  bypass: 'Bypass',
}

export function RuleStatusFilter({
  currentRuleStatus,
  onSelect,
}: {
  currentRuleStatus: RuleStatus
  onSelect: (selectedRuleStatus: RuleStatus) => void
}) {
  return (
    <ActionMenuSelector
      currentSelection={currentRuleStatus}
      orderedValues={orderedStatuses}
      displayValues={ruleStatuses}
      onSelect={onSelect}
    />
  )
}
