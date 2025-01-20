import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {ActionList} from '@primer/react'

import {VALUES} from '../../../constants/values'

type SelectTeamsQueryLoadingProps = {
  nrRows?: number
}

export function SelectTeamsQueryLoading({nrRows = VALUES.selectedTeamsLoadingSize}: SelectTeamsQueryLoadingProps) {
  const rows = Array(nrRows)
    .fill(0)
    .map((_, i) => (
      <ActionList.Item key={i} selected={false}>
        <ActionList.LeadingVisual>
          <LoadingSkeleton height="lg" width="lg" variant="rounded" />
        </ActionList.LeadingVisual>
        <LoadingSkeleton height="md" width="random" variant="rounded" />
      </ActionList.Item>
    ))
  return <ActionList selectionVariant="multiple">{rows}</ActionList>
}
