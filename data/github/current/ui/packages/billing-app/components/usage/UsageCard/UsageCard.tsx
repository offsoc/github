import {useMemo} from 'react'
import {Box, Octicon, Text, ActionMenu, IconButton, ActionList, Heading} from '@primer/react'
import type {Icon} from '@primer/octicons-react'
import {OrganizationIcon, RepoIcon, KebabHorizontalIcon} from '@primer/octicons-react'

import useRoute from '../../../hooks/use-route'
import {USAGE_ROUTE} from '../../../routes'

import {UsageCardSkeleton, UsageListTable, UsageProgressBar} from '.'
import {ErrorComponent, NoDataComponent} from '../..'

import {GROUP_BY_REPO_TYPE, GROUP_BY_ORG_TYPE} from '../../../constants'
import {RequestState, UsageCardVariant, UsagePeriod} from '../../../enums'
import {boxStyle} from '../../../utils/style'

import type {PeriodSelection, RepoUsageLineItem, OtherUsageLineItem} from '../../../types/usage'

const containerBoxStyle = {
  display: 'flex',
  flexDirection: 'column',
  ...boxStyle,
}

const headerContainerStyle = {
  mb: 3,
  display: 'flex',
  justifyContent: 'space-between',
}

const headerBoxStyle = {
  display: 'flex',
}

const iconBoxStyle = {
  pr: 2,
}

const headingStyle = {
  display: 'flex',
  flexDirection: 'column',
  fontSize: 2,
  fontWeight: 'normal',
}

const subtitleStyle = {
  color: 'fg.subtle',
}

const titleText: Record<UsageCardVariant, string> = {
  org: 'Usage by organization',
  repo: 'Usage by repository',
}

const numberToString: Record<number, string | null> = {
  1: 'Top',
  2: 'Top two',
  3: 'Top three',
  4: 'Top four',
  5: 'Top five',
}

const icon: Record<UsageCardVariant, Icon> = {
  org: OrganizationIcon,
  repo: RepoIcon,
}

const timePeriod: Record<PeriodSelection['type'], string> = {
  [UsagePeriod.THIS_HOUR]: 'this hour',
  [UsagePeriod.TODAY]: 'today',
  [UsagePeriod.THIS_MONTH]: 'this month',
  [UsagePeriod.THIS_YEAR]: 'this year',
  [UsagePeriod.LAST_MONTH]: 'last month',
  [UsagePeriod.LAST_YEAR]: 'last year',
}

interface Props {
  usagePeriod: UsagePeriod
  requestState: RequestState
  usage: RepoUsageLineItem[]
  otherUsage: OtherUsageLineItem[]
  variant: UsageCardVariant
  enableOrgRepoUsageRefactor?: boolean
}

export default function UsageCard({
  usagePeriod,
  requestState,
  usage,
  variant,
  otherUsage,
  enableOrgRepoUsageRefactor,
}: Props) {
  const sortedUsage = useMemo<RepoUsageLineItem[]>(() => usage.sort((a, b) => b.billedAmount - a.billedAmount), [usage])
  const totalUsage = useMemo<number>(() => usage.reduce((sum, item) => sum + item.billedAmount, 0), [usage])

  const totalOtherUsage = useMemo<number>(() => {
    if (enableOrgRepoUsageRefactor) {
      return otherUsage.reduce((sum, item) => sum + item.billedAmount, 0)
    } else {
      return sortedUsage.length > 5 ? sortedUsage.slice(5).reduce((sum, item) => sum + item.billedAmount, 0) : 0
    }
  }, [sortedUsage, otherUsage, enableOrgRepoUsageRefactor])

  // Only show up to the 5th element as we will show the remainder of the usage in the "other" section.
  const topSortedUsage = sortedUsage.slice(0, 5)
  const topUsageCount = topSortedUsage.length

  const FULL_VARIANT_NAME = variant === UsageCardVariant.ORG ? 'organization' : 'repository'

  const groupType = variant === UsageCardVariant.ORG ? GROUP_BY_ORG_TYPE : GROUP_BY_REPO_TYPE
  const {path: usageUrl} = useRoute(USAGE_ROUTE, {}, {group: groupType.toString()})

  const subtitleText = () => {
    let entityText = ''
    if (variant === UsageCardVariant.ORG) {
      entityText = topUsageCount === 1 ? 'organization' : 'organizations'
    } else {
      entityText = topUsageCount === 1 ? 'repository' : 'repositories'
    }

    return `${numberToString[topUsageCount]} ${entityText} ${timePeriod[usagePeriod]}`
  }

  return (
    <Box sx={containerBoxStyle} data-testid={`${variant}-usage-card`}>
      <Box sx={headerContainerStyle}>
        <Box sx={headerBoxStyle}>
          <Box sx={iconBoxStyle}>
            <Octicon icon={icon[variant]} size={16} />
          </Box>
          <div>
            <Heading as="h3" sx={headingStyle}>
              {titleText[variant]}
              {usage.length > 0 && (
                <Text as="small" sx={subtitleStyle} data-testid="usage-card-subtitle">
                  {subtitleText()}
                </Text>
              )}
            </Heading>
          </div>
        </Box>
        <ActionMenu>
          <ActionMenu.Anchor>
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              unsafeDisableTooltip={true}
              icon={KebabHorizontalIcon}
              variant="invisible"
              aria-label={`Open ${FULL_VARIANT_NAME} usage options`}
            />
          </ActionMenu.Anchor>
          <ActionMenu.Overlay>
            <ActionList sx={{whiteSpace: 'nowrap'}}>
              <ActionList.LinkItem href={usageUrl}>View all {FULL_VARIANT_NAME} usage</ActionList.LinkItem>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </Box>

      {/* Render the org usage card with loading/error states */}
      {(requestState === RequestState.LOADING || requestState === RequestState.INIT) && <UsageCardSkeleton />}
      {requestState === RequestState.ERROR && (
        <ErrorComponent sx={{border: 0}} testid="org-usage-loading-error" text="Something went wrong" />
      )}
      {requestState === RequestState.IDLE && (
        <>
          {usage.length === 0 && <NoDataComponent sx={{border: 0}} testid="no-usage-data" text="No usage found" />}
          {usage.length > 0 && (
            <>
              <UsageProgressBar
                allOtherUsage={totalOtherUsage}
                sx={{mb: 3}}
                totalUsage={totalUsage}
                usage={topSortedUsage}
              />
              <UsageListTable allOtherUsage={totalOtherUsage} usage={topSortedUsage} variant={variant} />
            </>
          )}
        </>
      )}
    </Box>
  )
}
