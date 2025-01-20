import type {RangeSelection} from '@github-ui/date-picker'
import type {FilterProvider} from '@github-ui/filter'
import {OnboardingTipBanner} from '@github-ui/onboarding-tip-banner'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {SingleSignOnBanner} from '@github-ui/single-sign-on-banner'
import {useSso} from '@github-ui/use-sso'
import {InfoIcon, ShieldCheckIcon} from '@primer/octicons-react'
import {Box, TabNav, Text} from '@primer/react'
import {useCallback, useMemo, useState} from 'react'

import AlertPrioritizationCopilotPromptExperimentBanner from '../alert-prioritization/components/copilot-prompt-experiment/AlertPrioritizationCopilotPromptExperimentBanner'
import {dateSpansAreEqual, isRangeSelection} from '../common/components/date-span-picker'
import {ExportBanner} from '../common/components/export-banner'
import PageLayout from '../common/components/page-layout'
import {usePaths} from '../common/contexts/Paths'
import type {CustomProperty} from '../common/filter-providers/types'
import {useDirtyStateTracking} from '../common/hooks/use-dirty-state-tracking'
import {toUTCDateString} from '../common/utils/date-formatter'
import {calculateDateRangeFromPeriod, type Period} from '../common/utils/date-period'
import {AdvisoriesTable} from './components/AdvisoriesTable'
import {AgeOfAlertsCard} from './components/AgeOfAlertsCard'
import {AlertActivityChart} from './components/alert-activity-chart'
import {AlertTrendsChart} from './components/alert-trends-chart'
import type {GroupingType} from './components/alert-trends-chart/grouping-type'
import {AutofixSuggestionsCard} from './components/AutofixSuggestionsCard'
import {MeanTimeToRemediateCard} from './components/MeanTimeToRemediateCard'
import {NetResolveRateCard} from './components/NetResolveRateCard'
import {ReopenedAlertsCard} from './components/ReopenedAlertsCard'
import {RepositoriesTable} from './components/RepositoriesTable'
import {SastTable} from './components/SastTable'
import {SecretsBypassedCard} from './components/SecretsBypassedCard'
import {useUpdateUrl} from './hooks/use-update-url'

type ImpactAnalysisTab = 'repositories' | 'advisories' | 'sast'

type IncompleteDataWarning = {show: true; docHref: string} | {show: false}
export interface SecurityCenterOverviewDashboardProps {
  initialQuery?: string
  initialDateSpan?: Period | {from: string; to: string}
  initialSelectedImpactAnalysisTable?: ImpactAnalysisTab
  feedbackLink: {
    text: string
    url: string
  }
  visibleSecurityFeatures: string[]
  alertTrendsChart?: {
    isOpenSelected: boolean
    grouping?: GroupingType
  }
  incompleteDataWarning?: IncompleteDataWarning
  customProperties: CustomProperty[]
  filterProviders: FilterProvider[]
  showOnboardingBanner?: boolean
  exportErrorMessage?: string
  scope?: string
  isAlertPrioritizationExperimentInProgress?: boolean
  allowOwnerTypeFiltering?: boolean
}

// the RangeSelection passed by params uses strings; convert to Dates
function ensureDateRangeUsesDates(
  dateSpan: Period | RangeSelection | {from: string; to: string},
): Period | RangeSelection {
  if ('period' in dateSpan) {
    return dateSpan
  } else {
    return {
      from: new Date(dateSpan.from),
      to: new Date(dateSpan.to),
    }
  }
}

const DEFAULT_DATE_SPAN: Period = {period: 'last30days'}

export function SecurityCenterOverviewDashboard({
  alertTrendsChart,
  feedbackLink,
  initialDateSpan,
  initialQuery,
  initialSelectedImpactAnalysisTable = 'repositories',
  incompleteDataWarning = {show: false},
  isAlertPrioritizationExperimentInProgress = false,
  customProperties,
  filterProviders,
  showOnboardingBanner,
  exportErrorMessage,
  scope,
}: SecurityCenterOverviewDashboardProps): JSX.Element {
  const showCsvExport = useFeatureFlag('security_center_show_csv_export')
  const showAutofixCard = useFeatureFlag('security_center_dashboards_show_autofix_card')
  const showSastTable = useFeatureFlag('security_center_dashboards_show_sast_table')

  const {ssoOrgs} = useSso()
  const ssoOrgNames = ssoOrgs.map(o => o['login']).filter(n => n !== undefined)

  const defaultQuery = 'archived:false tool:github'

  // track selected filter state
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery ?? defaultQuery)
  const [submittedQueryIsDirty, resetSubmittedQueryIsDirty] = useDirtyStateTracking(
    submittedQuery,
    defaultQuery,
    !!initialQuery,
  )

  // track selected impact analysis tabnav state
  const [selectedTable, setSelectedTable] = useState<ImpactAnalysisTab>(initialSelectedImpactAnalysisTable)

  // track selected date span state
  const [selectedDateSpan, setSelectedDateSpan] = useState(
    initialDateSpan != null ? ensureDateRangeUsesDates(initialDateSpan) : DEFAULT_DATE_SPAN,
  )
  const [dateSpanIsDirty, resetDateSpanIsDirty] = useDirtyStateTracking(
    selectedDateSpan,
    DEFAULT_DATE_SPAN,
    !!initialDateSpan,
    dateSpansAreEqual,
  )

  const dateRange = useMemo(() => {
    if (isRangeSelection(selectedDateSpan)) {
      return selectedDateSpan
    } else {
      return calculateDateRangeFromPeriod(selectedDateSpan)
    }
  }, [selectedDateSpan])
  const startDateString = useMemo(() => toUTCDateString(dateRange.from), [dateRange])
  const endDateString = useMemo(() => toUTCDateString(dateRange.to), [dateRange])

  const onRevert = (): void => {
    setSubmittedQuery(defaultQuery)
    resetSubmittedQueryIsDirty()
    setSelectedDateSpan(DEFAULT_DATE_SPAN)
    resetDateSpanIsDirty()
  }

  useUpdateUrl(
    submittedQuery,
    submittedQueryIsDirty,
    dateSpanIsDirty,
    startDateString,
    endDateString,
    selectedTable,
    selectedDateSpan,
  )

  const dateSpanPickerCallback = useCallback((selection: RangeSelection | Period) => {
    if (isRangeSelection(selection) && selection.from === selection.to) {
      setSelectedDateSpan(DEFAULT_DATE_SPAN)
    } else {
      setSelectedDateSpan(selection)
    }
  }, [])

  const startedBannerId = 'security-center-export-started-banner'
  const successBannerId = 'security-center-export-success-banner'
  const errorBannerId = 'security-center-export-error-banner'

  // eslint-disable-next-line ssr-friendly/no-dom-globals-in-react-fc
  window.performance.mark('security_overview_dashboard_loaded')
  const paths = usePaths()
  return (
    <PageLayout>
      <PageLayout.Banners>
        {ssoOrgNames.length > 0 && <SingleSignOnBanner protectedOrgs={ssoOrgNames} />}
        {showOnboardingBanner && (
          <OnboardingTipBanner
            link={paths.onboardingAdvancedSecurityPath()}
            icon={ShieldCheckIcon}
            linkText="Back to onboarding"
            heading="View your security risk in a security overview"
          >
            {`Uncover insights to help prioritize efforts in your AppSec program and share progress with the various stakeholders across your ${scope} with detailed reporting in a security overview.`}
          </OnboardingTipBanner>
        )}
        {showCsvExport && <ExportBanner id={startedBannerId} type="accent" />}
        {showCsvExport && <ExportBanner id={successBannerId} type="success" />}
        {showCsvExport && <ExportBanner id={errorBannerId} type="danger" errorMessage={exportErrorMessage} />}
        <AlertPrioritizationCopilotPromptExperimentBanner
          isExperimentInProgress={isAlertPrioritizationExperimentInProgress}
        />
      </PageLayout.Banners>

      <PageLayout.Header
        title="Overview"
        description={`Alert trends and insights across your ${scope}.`}
        feedbackLink={feedbackLink}
      />

      <PageLayout.ExportButton
        exportUrl={
          showCsvExport
            ? paths.csvExportPath({startDate: startDateString, endDate: endDateString, query: submittedQuery})
            : undefined
        }
        startedBannerId={startedBannerId}
        successBannerId={successBannerId}
        errorBannerId={errorBannerId}
      />

      <PageLayout.FilterBar
        filter={<PageLayout.Filter providers={filterProviders} query={submittedQuery} onSubmit={setSubmittedQuery} />}
        datePicker={<PageLayout.DatePicker value={selectedDateSpan} onChange={dateSpanPickerCallback} />}
        revert={<PageLayout.FilterRevert show={submittedQueryIsDirty || dateSpanIsDirty} onRevert={onRevert} />}
      />

      <PageLayout.LimitedRepoWarning
        show={incompleteDataWarning.show}
        href={incompleteDataWarning.show ? incompleteDataWarning.docHref : ''}
      />

      <PageLayout.Content>
        {/*
         * NOTE: AlertTrendsChart is considered the highest priority content.
         * The `data-hpc` attribute is added to AlertTrendsChart once its content loads.
         */}
        <AlertTrendsChart
          isOpenSelected={alertTrendsChart?.isOpenSelected ?? true}
          query={submittedQuery}
          startDate={startDateString}
          endDate={endDateString}
          grouping={alertTrendsChart?.grouping}
        />

        <Box sx={{display: 'flex', gap: 3, mt: 3}}>
          <AgeOfAlertsCard query={submittedQuery} startDate={startDateString} endDate={endDateString} />
          <ReopenedAlertsCard query={submittedQuery} startDate={startDateString} endDate={endDateString} />
          <SecretsBypassedCard
            query={submittedQuery}
            customProperties={customProperties}
            startDate={startDateString}
            endDate={endDateString}
            datePeriod={isRangeSelection(selectedDateSpan) ? undefined : selectedDateSpan}
          />
        </Box>

        <Box sx={{mt: 4}}>
          <Text as="div" className="text-bold" sx={{fontSize: 3}}>
            Remediation
          </Text>
          <Box sx={{display: 'flex', gap: 3, mt: 2}}>
            <MeanTimeToRemediateCard query={submittedQuery} startDate={startDateString} endDate={endDateString} />
            <NetResolveRateCard query={submittedQuery} startDate={startDateString} endDate={endDateString} />
            {showAutofixCard && (
              <AutofixSuggestionsCard query={submittedQuery} startDate={startDateString} endDate={endDateString} />
            )}
          </Box>
        </Box>

        <AlertActivityChart query={submittedQuery} startDate={startDateString} endDate={endDateString} sx={{mt: 3}} />

        <Box sx={{mt: 4}}>
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
          {selectedTable === 'repositories' && (
            <RepositoriesTable query={submittedQuery} startDate={startDateString} endDate={endDateString} />
          )}
          {selectedTable === 'advisories' && (
            <AdvisoriesTable query={submittedQuery} startDate={startDateString} endDate={endDateString} />
          )}
          {selectedTable === 'sast' && showSastTable && (
            <SastTable query={submittedQuery} startDate={startDateString} endDate={endDateString} />
          )}
        </Box>
      </PageLayout.Content>

      <PageLayout.Footer>
        <Text as="p" className="color-fg-muted" sx={{textAlign: 'center', width: '100%', display: 'block'}}>
          <InfoIcon /> All data is in UTC (GMT) time.
        </Text>
      </PageLayout.Footer>
    </PageLayout>
  )
}
