import type {RangeSelection} from '@github-ui/date-picker'
import type {FilterProvider} from '@github-ui/filter'
import {SingleSignOnBanner} from '@github-ui/single-sign-on-banner'
import {useSso} from '@github-ui/use-sso'
import {addDays, parseISO} from 'date-fns'
import {useMemo, useState} from 'react'
import {useSearchParams} from 'react-router-dom'

import {dateSpansAreEqual, toDateSpan} from '../common/components/date-span-picker'
import PageLayout from '../common/components/page-layout'
import {type DateSpan, isRangeSelection} from '../common/components/page-layout/DatePicker'
import {useDirtyStateTracking} from '../common/hooks/use-dirty-state-tracking'
import {toUTCDateString} from '../common/utils/date-formatter'
import {calculateDateRangeFromPeriod, type Period} from '../common/utils/date-period'
import {calculateTrend} from '../common/utils/trend-data'
import {type Dataset, EnablementTrendChart} from './components/EnablementTrendChart'
import {EnablementTrendTable, type TableColumn, type TableRow} from './components/EnablementTrendTable'
import type {
  EnablementCounts,
  EnablementTrendData,
  EnablementTrendDataState,
  RepoCounts,
} from './hooks/use-enablement-trend-data'
import {calculatePercentage, isReadyState, useEnablementTrendData} from './hooks/use-enablement-trend-data'
import {useUpdateUrl} from './hooks/use-update-url'

export interface SecurityCenterEnablementTrendsReportProps {
  initialQuery?: string
  initialDateSpan?: Period | {from: string; to: string}
  watermarkDate?: string
  feedbackLink: {
    text: string
    url: string
  }
  showIncompleteDataWarning: boolean
  incompleteDataWarningDocHref: string
  filterProviders: FilterProvider[]
  allowOwnerTypeFiltering?: boolean
}

const DEFAULT_QUERY: string = 'archived:false'
const DEFAULT_DATE_SPAN: Period = {period: 'last30days'}
const DEFAULT_FEATURE: Feature = 'dependabot'

type Feature = 'dependabot' | 'code-scanning' | 'secret-scanning'
type FeatureDatasetMap = {
  [key in Feature]: {
    label: string
    description: string
    datasets: Array<{
      label: string
      field: keyof EnablementCounts
      denominator: keyof RepoCounts
    }>
  }
}

const featureMap: FeatureDatasetMap = {
  dependabot: {
    label: 'Dependabot',
    description: 'The percentage of repositories with Dependabot enabled.',
    datasets: [
      {label: 'Dependabot', field: 'dependabotAlertsEnabled', denominator: 'dependabotAlertsRepositoriesCount'},
      {
        label: 'Security updates',
        field: 'dependabotSecurityUpdatesEnabled',
        denominator: 'dependabotSecurityUpdatesRepositoriesCount',
      },
    ],
  },
  'code-scanning': {
    label: 'Code scanning',
    description: 'The percentage of repositories with at least one code scanning analysis.',
    datasets: [{label: 'Code scanning', field: 'codeScanningEnabled', denominator: 'codeScanningRepositoriesCount'}],
  },
  'secret-scanning': {
    label: 'Secret scanning',
    description: 'The percentage of repositories with secret scanning enabled.',
    datasets: [
      {label: 'Secret scanning', field: 'secretScanningEnabled', denominator: 'secretScanningRepositoriesCount'},
      {
        label: 'Push protection',
        field: 'secretScanningPushProtectionEnabled',
        denominator: 'secretScanningPushProtectionRepositoriesCount',
      },
    ],
  },
}

export function useEnablementTrendDatasets(enablementData: EnablementTrendDataState, feature: Feature): Dataset[] {
  return useMemo(() => {
    let data: EnablementTrendData = {trendData: []}
    if (isReadyState(enablementData)) {
      data = enablementData.data
    }

    const datasets = featureMap[feature].datasets.map(d => ({
      label: d.label,
      data: data.trendData.map(entry => ({
        x: entry.date,
        y: calculatePercentage(entry[d.field], entry[d.denominator]),
      })),
    }))

    return datasets
  }, [enablementData, feature])
}

export function useEnablementTrendTableData(
  enablementData: EnablementTrendDataState,
  feature: Feature,
): {columns: TableColumn[]; rows: TableRow[]} {
  const columns = useMemo(() => {
    return featureMap[feature].datasets.map(d => ({
      label: `${d.label} enabled`,
      field: d.field,
    }))
  }, [feature])

  const rows = useMemo(() => {
    let data: EnablementTrendData = {trendData: []}
    if (isReadyState(enablementData)) {
      data = enablementData.data
    }

    return data.trendData
      .map(entry => {
        const row: TableRow = {
          id: entry.date,
          date: entry.date,
          totalRepositories: entry[featureMap[feature].datasets[0]!.denominator],
        }

        for (const d of featureMap[feature].datasets) {
          row[d.field] = entry[d.field]
        }

        return row
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [enablementData, feature])

  return {columns, rows}
}

export function calculatePreviousDateRange(dateRange: RangeSelection): RangeSelection {
  // We don't actually need a full "range" of the same duration. We're only comparing
  // the end of one period to the end of another. One day would be fine, but the
  // API doesn't allow requesting a single-day range.
  return {
    from: addDays(dateRange.from, -2),
    to: addDays(dateRange.from, -1),
  }
}

export function usePeriodEnablementPercentage(enablementData: EnablementTrendDataState, feature: Feature): number {
  return useMemo(() => {
    if (!isReadyState(enablementData)) {
      return 0
    }

    // the first dataset is the primary feature, what we want to track the period-over-period trend
    const field = featureMap[feature].datasets[0]!.field

    // the data entries are returned in chronological order
    // the last entry represents the state at the end of the period
    const lastEntry = enablementData.data.trendData.at(-1)
    if (lastEntry == null) {
      return 0
    }

    return calculatePercentage(
      lastEntry[field], // numerator
      lastEntry[featureMap[feature].datasets[0]!.denominator], // denominator
    )
  }, [enablementData, feature])
}

function usePeriodOverPeriodTrendValue(
  dateRange: RangeSelection,
  query: string,
  enablementData: EnablementTrendDataState,
  feature: Feature,
): number {
  const previousDateRange = calculatePreviousDateRange(dateRange)
  const previousEnablementData = useEnablementTrendData(
    toUTCDateString(previousDateRange.from),
    toUTCDateString(previousDateRange.to),
    query,
  )

  const currentPeriodEnablementPercentage = usePeriodEnablementPercentage(enablementData, feature)
  const previousPeriodEnablementPercentage = usePeriodEnablementPercentage(previousEnablementData, feature)
  return calculateTrend(currentPeriodEnablementPercentage, previousPeriodEnablementPercentage)
}

function isFeature(value: string | null): value is Feature {
  // You can't interrogate a constrained type, and we shouldn't repeat the values here.
  // The feature map uses the Feature values as keys, so we know this is safe.
  return value != null && Object.keys(featureMap).includes(value)
}

export function SecurityCenterEnablementTrendsReport({
  initialQuery,
  initialDateSpan,
  watermarkDate,
  feedbackLink,
  showIncompleteDataWarning,
  incompleteDataWarningDocHref,
  filterProviders,
}: SecurityCenterEnablementTrendsReportProps): JSX.Element {
  const [initialParams] = useSearchParams()

  const {ssoOrgs} = useSso()
  const ssoOrgNames = ssoOrgs.map(o => o['login']).filter(n => n !== undefined)

  // track selected feature tabnav state
  const initialFeature = initialParams.get('feature')
  const [feature, setFeature] = useState<Feature>(isFeature(initialFeature) ? initialFeature : DEFAULT_FEATURE)
  const [featureIsDirty] = useDirtyStateTracking(feature, DEFAULT_FEATURE, !!initialFeature)

  // track selected filter state
  const [query, setQuery] = useState<string>(initialQuery ?? DEFAULT_QUERY)
  const [queryIsDirty, resetQueryIsDirty] = useDirtyStateTracking(query, DEFAULT_QUERY, !!initialQuery)

  // track selected date span state
  const [dateSpan, setDateSpan] = useState<DateSpan>(
    initialDateSpan != null ? toDateSpan(initialDateSpan) : DEFAULT_DATE_SPAN,
  )
  const [dateSpanIsDirty, resetDateSpanIsDirty] = useDirtyStateTracking(
    dateSpan,
    DEFAULT_DATE_SPAN,
    !!initialDateSpan,
    dateSpansAreEqual,
  )
  const dateRange = useMemo(() => {
    if (isRangeSelection(dateSpan)) {
      return dateSpan
    } else {
      return calculateDateRangeFromPeriod(dateSpan)
    }
  }, [dateSpan])

  // keep browser URL in sync with selected filter and date span
  useUpdateUrl(query, queryIsDirty, dateSpan, dateSpanIsDirty, feature, featureIsDirty)

  // fetch enablement data for all features from server
  const enablementData = useEnablementTrendData(toUTCDateString(dateRange.from), toUTCDateString(dateRange.to), query)

  // massage enablement data into chart data for the selected feature
  const datasets = useEnablementTrendDatasets(enablementData, feature)

  // massage enablement data into table data for the selected feature
  const {columns, rows} = useEnablementTrendTableData(enablementData, feature)

  // previous data for period-over-period trend comparison
  const trendValue = usePeriodOverPeriodTrendValue(dateRange, query, enablementData, feature)

  return (
    <PageLayout>
      <PageLayout.Banners>
        {ssoOrgNames.length > 0 && <SingleSignOnBanner protectedOrgs={ssoOrgNames} data-testid="sso-banner" />}
      </PageLayout.Banners>

      <PageLayout.Header
        title="Enablement trends"
        description="Trends of security feature enablement across your organization."
        feedbackLink={feedbackLink}
      />

      <PageLayout.FilterBar
        filter={<PageLayout.Filter providers={filterProviders} query={query} onSubmit={setQuery} />}
        datePicker={
          <PageLayout.DatePicker
            value={dateSpan}
            onChange={setDateSpan}
            watermarkDate={watermarkDate ? parseISO(watermarkDate) : undefined}
          />
        }
        revert={
          <PageLayout.FilterRevert
            show={queryIsDirty || dateSpanIsDirty}
            onRevert={() => {
              setQuery(DEFAULT_QUERY)
              resetQueryIsDirty()
              setDateSpan(DEFAULT_DATE_SPAN)
              resetDateSpanIsDirty()
            }}
          />
        }
      />

      <PageLayout.LimitedRepoWarning show={showIncompleteDataWarning} href={incompleteDataWarningDocHref} />

      <PageLayout.Nav
        onSelectionChanged={key => setFeature(key as Feature)}
        items={Object.keys(featureMap).map(key => {
          return {
            key,
            label: featureMap[key as Feature].label,
            selected: feature === key,
          }
        })}
      />

      <PageLayout.Content>
        <EnablementTrendChart
          state={enablementData.kind}
          description={featureMap[feature].description}
          datasets={datasets}
          trendValue={trendValue}
        />
        <EnablementTrendTable state={enablementData.kind} columns={columns} rows={rows} />
      </PageLayout.Content>
    </PageLayout>
  )
}
