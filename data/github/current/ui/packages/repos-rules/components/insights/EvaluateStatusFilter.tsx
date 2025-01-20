import {ActionMenuSelector} from '@github-ui/action-menu-selector'
import type {EvaluateStatus} from '../../types/rules-types'

const orderedStatuses: EvaluateStatus[] = ['active', 'evaluate', 'all']

const evaluateStatuses: Record<EvaluateStatus, string> = {
  active: 'Active rules',
  evaluate: 'Evaluate rules',
  all: 'All rules',
}

export function EvaluateStatusFilter({
  currentEvaluateStatus,
  onSelect,
}: {
  currentEvaluateStatus: EvaluateStatus
  onSelect: (selectedEvaluateStatus: EvaluateStatus) => void
}) {
  return (
    <ActionMenuSelector
      currentSelection={currentEvaluateStatus}
      orderedValues={orderedStatuses}
      displayValues={evaluateStatuses}
      onSelect={onSelect}
    />
  )
}
