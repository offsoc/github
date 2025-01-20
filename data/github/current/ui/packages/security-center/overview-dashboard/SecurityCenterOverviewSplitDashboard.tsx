import type {RangeSelection} from '@github-ui/date-picker'
import type {FilterProvider} from '@github-ui/filter'
import {OnboardingTipBanner} from '@github-ui/onboarding-tip-banner'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {SingleSignOnBanner} from '@github-ui/single-sign-on-banner'
import {useSso} from '@github-ui/use-sso'
import {InfoIcon, ShieldCheckIcon} from '@primer/octicons-react'
import {Text} from '@primer/react'
import {useCallback, useMemo, useState} from 'react'
import {useSearchParams} from 'react-router-dom'

import AlertPrioritizationCopilotPromptExperimentBanner from '../alert-prioritization/components/copilot-prompt-experiment/AlertPrioritizationCopilotPromptExperimentBanner'
import {dateSpansAreEqual, isRangeSelection} from '../common/components/date-span-picker'
import {ExportBanner} from '../common/components/export-banner'
import PageLayout from '../common/components/page-layout'
import {usePaths} from '../common/contexts/Paths'
import type {CustomProperty} from '../common/filter-providers/types'
import {useDirtyStateTracking} from '../common/hooks/use-dirty-state-tracking'
import {toUTCDateString} from '../common/utils/date-formatter'
import {calculateDateRangeFromPeriod, type Period} from '../common/utils/date-period'
import type {GroupingType} from './components/alert-trends-chart/grouping-type'
import {DetectionTab} from './components/DetectionTab'
import {PreventionTab} from './components/PreventionTab'
import {RemediationTab} from './components/RemediationTab'
import {useUpdateUrl} from './hooks/use-update-url'

type ImpactAnalysisTab = 'repositories' | 'advisories' | 'sast'

type IncompleteDataWarning = {show: true; docHref: string} | {show: false}
export interface SecurityCenterOverviewSplitDashboardProps {
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
  isAlertPrioritizationExperimentInProgress?: boolean
  customProperties: CustomProperty[]
  filterProviders: FilterProvider[]
  showOnboardingBanner?: boolean
  exportErrorMessage?: string
  scope?: string
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
const DEFAULT_TAB: Tab = 'detection'

type Tab = 'detection' | 'remediation' | 'prevention'
type TabDatasetMap = {
  [key in Tab]: {
    label: string
  }
}

const tabMap: TabDatasetMap = {
  detection: {
    label: 'Detection',
  },
  remediation: {
    label: 'Remediation',
  },
  prevention: {
    label: 'Prevention',
  },
}

function isTab(value: string | null): value is Tab {
  // You can't interrogate a constrained type, and we shouldn't repeat the values here.
  // The tab map uses the tab values as keys, so we know this is safe.
  return value != null && Object.keys(tabMap).includes(value)
}

export function SecurityCenterOverviewSplitDashboard({
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
}: SecurityCenterOverviewSplitDashboardProps): JSX.Element {
  const [initialParams] = useSearchParams()

  const showCsvExport = useFeatureFlag('security_center_show_csv_export')

  // track selected tabnav state
  const initialTab = initialParams.get('view')
  const [tab, setTab] = useState<Tab>(isTab(initialTab) ? initialTab : DEFAULT_TAB)
  const [tabIsDirty] = useDirtyStateTracking(tab, DEFAULT_TAB, !!initialTab)

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

  // keep browser URL in sync with selected filter and date span
  useUpdateUrl(
    submittedQuery,
    submittedQueryIsDirty,
    dateSpanIsDirty,
    startDateString,
    endDateString,
    '', // selected table is handled in the DetectionTab
    selectedDateSpan,
    tab,
    tabIsDirty,
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

      <PageLayout.Nav
        onSelectionChanged={key => setTab(key as Tab)}
        items={Object.keys(tabMap).map(key => {
          return {
            key,
            label: tabMap[key as Tab].label,
            selected: tab === key,
          }
        })}
      />

      <PageLayout.Content>
        {tab === 'detection' && (
          <DetectionTab
            submittedQuery={submittedQuery}
            startDateString={startDateString}
            endDateString={endDateString}
            selectedDateSpan={selectedDateSpan}
            customProperties={customProperties}
            alertTrendsGrouping={alertTrendsChart?.grouping}
            initialSelectedImpactAnalysisTable={initialSelectedImpactAnalysisTable}
          />
        )}
        {tab === 'remediation' && (
          <RemediationTab
            submittedQuery={submittedQuery}
            startDateString={startDateString}
            endDateString={endDateString}
            alertTrendsGrouping={alertTrendsChart?.grouping}
          />
        )}
        {tab === 'prevention' && (
          <PreventionTab
            submittedQuery={submittedQuery}
            startDateString={startDateString}
            endDateString={endDateString}
            selectedDateSpan={selectedDateSpan}
            customProperties={customProperties}
          />
        )}
      </PageLayout.Content>

      <PageLayout.Footer>
        <Text as="p" className="color-fg-muted" sx={{textAlign: 'center', width: '100%', display: 'block'}}>
          <InfoIcon /> All data is in UTC (GMT) time.
        </Text>
      </PageLayout.Footer>
    </PageLayout>
  )
}
