import {Box} from '@primer/react'
import {useMemo} from 'react'

import {useRepoUsageCard} from '../../../hooks/usage'

import {UsageCard} from '.'

import {UsageCardVariant, UsageGrouping, UsagePeriod} from '../../../enums'
import {groupLineItems} from '../../../utils/group'

import type {Filters, RepoUsageLineItem} from '../../../types/usage'

const containerStyle = {
  display: 'grid',
  // Responsively sets the number of columns the cards are divided into
  gridTemplateColumns: ['1', '1', '1', '1'],
  gridGap: 3,
  // Sets the grid to 2 columns when the screen width is >= 1651px instead of the 1280px standard xl breakpoint to prevent horizontal scrolling and respect the same margin as the other cards
  '@media (min-width: 1651px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
}

interface Props {
  filters: Filters
  enableOrgRepoUsageRefactor: boolean
}

/**
 * Container for querying usage that powers both the org and repo usage cards.
 */
export default function OrgRepoUsageContainer({filters, enableOrgRepoUsageRefactor}: Props) {
  const {
    usage: repoUsage,
    otherUsage: repoOtherUsage,
    requestState: repoUsageRequestState,
  } = useRepoUsageCard({
    filters: {...filters, group: {type: UsageGrouping.REPO, displayText: ''}},
  })
  const {
    usage: orgUsage,
    otherUsage: orgOtherUsage,
    requestState: orgUsageRequestState,
  } = useRepoUsageCard({
    filters: {...filters, group: {type: UsageGrouping.ORG, displayText: ''}},
  })

  const groupedOrgUsage = useMemo<RepoUsageLineItem[]>(
    () => groupLineItems(orgUsage, UsageGrouping.ORG) as RepoUsageLineItem[],
    [orgUsage],
  )
  const groupedRepoUsage = useMemo<RepoUsageLineItem[]>(
    () => groupLineItems(repoUsage, UsageGrouping.REPO) as RepoUsageLineItem[],
    [repoUsage],
  )

  const usagePeriod = filters.period?.type ?? UsagePeriod.DEFAULT

  return (
    <Box sx={containerStyle}>
      <UsageCard
        usagePeriod={usagePeriod}
        requestState={orgUsageRequestState}
        usage={groupedOrgUsage}
        otherUsage={orgOtherUsage}
        variant={UsageCardVariant.ORG}
        enableOrgRepoUsageRefactor={enableOrgRepoUsageRefactor}
      />
      <UsageCard
        usagePeriod={usagePeriod}
        requestState={repoUsageRequestState}
        usage={groupedRepoUsage}
        otherUsage={repoOtherUsage}
        variant={UsageCardVariant.REPO}
        enableOrgRepoUsageRefactor={enableOrgRepoUsageRefactor}
      />
    </Box>
  )
}
