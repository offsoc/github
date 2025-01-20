import type {RangeSelection} from '@github-ui/date-picker'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {TabNav, Text} from '@primer/react'
import {Stack} from '@primer/react/experimental'
import {useEffect, useMemo, useState} from 'react'

import {isRangeSelection} from '../../common/components/date-span-picker'
import type {CustomProperty} from '../../common/filter-providers/types'
import type {Period} from '../../common/utils/date-period'
import {AdvisoriesTableV2} from './advisories-table/AdvisoriesTableV2'
import {AgeOfAlertsCardV2} from './age-of-alerts-card/AgeOfAlertsCardV2'
import {AlertTrendsChartV2} from './alert-trends-chart/AlertTrendsChartV2'
import type {GroupingType} from './alert-trends-chart/grouping-type'
import {ReopenedAlertsCardV2} from './reopened-alerts-card/ReopenedAlertsCardV2'
import {RepositoriesTableV2} from './repositories-table/RepositoriesTableV2'
import {SastTableV2} from './sast-table/SastTableV2'
import {SecretsBypassedCardV2} from './secrets-bypassed/SecretsBypassedCardV2'

type ImpactAnalysisTab = 'repositories' | 'advisories' | 'sast'

export interface DetectionTabProps {
  submittedQuery: string
  startDateString: string
  endDateString: string
  selectedDateSpan: Period | RangeSelection
  customProperties: CustomProperty[]
  alertTrendsGrouping?: GroupingType
  initialSelectedImpactAnalysisTable: ImpactAnalysisTab
}

export function DetectionTab({
  submittedQuery,
  startDateString,
  endDateString,
  selectedDateSpan,
  customProperties,
  alertTrendsGrouping,
  initialSelectedImpactAnalysisTable,
}: DetectionTabProps): JSX.Element {
  // track selected impact analysis tabnav state
  const [selectedTable, setSelectedTable] = useState<ImpactAnalysisTab>(initialSelectedImpactAnalysisTable)
  const showSastTable = useFeatureFlag('security_center_dashboards_show_sast_table')

  // Change the URL.
  useEffect(() => {
    const url = new URL(window.location.href, window.location.origin)
    const nextParams = url.searchParams

    selectedTable !== 'repositories'
      ? nextParams.set('impactAnalysisTab', selectedTable)
      : nextParams.delete('impactAnalysisTab')

    history.pushState(null, '', `${url.pathname}${url.search}`)
  }, [selectedTable])

  const cardProps = useMemo(() => {
    return {
      query: submittedQuery,
      startDate: startDateString,
      endDate: endDateString,
    }
  }, [submittedQuery, startDateString, endDateString])

  return (
    <Stack direction="vertical">
      <AlertTrendsChartV2
        isOpenSelected={true}
        query={submittedQuery}
        startDate={startDateString}
        endDate={endDateString}
        grouping={alertTrendsGrouping}
        showStateToggle={false}
        updateStateUrl={false}
        showChartTitle={true}
      />

      <Stack direction="horizontal">
        <AgeOfAlertsCardV2 {...cardProps} />
        <ReopenedAlertsCardV2 {...cardProps} />
        <SecretsBypassedCardV2
          query={submittedQuery}
          customProperties={customProperties}
          startDate={startDateString}
          endDate={endDateString}
          datePeriod={isRangeSelection(selectedDateSpan) ? undefined : selectedDateSpan}
        />
      </Stack>

      <Stack direction="vertical" gap="none">
        <Text className="text-bold" sx={{fontSize: 3}}>
          Impact analysis
        </Text>
        <p>Top 10 repositories and vulnerabilities that pose the biggest impact on your application security.</p>
        <TabNav aria-label="Impact Analysis">
          <TabNav.Link
            as="button"
            onClick={() => setSelectedTable('repositories')}
            selected={selectedTable === 'repositories'}
          >
            Repositories
          </TabNav.Link>
          <TabNav.Link
            as="button"
            onClick={() => setSelectedTable('advisories')}
            selected={selectedTable === 'advisories'}
          >
            Advisories
          </TabNav.Link>
          {showSastTable && (
            <TabNav.Link as="button" onClick={() => setSelectedTable('sast')} selected={selectedTable === 'sast'}>
              SAST vulnerabilities
            </TabNav.Link>
          )}
        </TabNav>
        {selectedTable === 'repositories' && <RepositoriesTableV2 {...cardProps} />}
        {selectedTable === 'advisories' && <AdvisoriesTableV2 {...cardProps} />}
        {selectedTable === 'sast' && showSastTable && <SastTableV2 {...cardProps} />}
      </Stack>
    </Stack>
  )
}
