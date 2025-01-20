import type {DetectionTabProps} from '../components/DetectionTab'
import type {PreventionTabProps} from '../components/PreventionTab'
import type {RemediationTabProps} from '../components/RemediationTab'
import type {SecurityCenterOverviewDashboardProps} from '../SecurityCenterOverviewDashboard'

export function getSecurityCenterOverviewDashboardProps(): SecurityCenterOverviewDashboardProps {
  return {
    initialQuery: '',
    initialDateSpan: {period: 'last30days'},
    feedbackLink: {
      text: 'Give feedback',
      url: '#',
    },
    visibleSecurityFeatures: ['code-scanning', 'dependabot', 'secret-scanning'],
    customProperties: [],
    filterProviders: [],
  }
}

export function getDetectionTabProps(): DetectionTabProps {
  return {
    submittedQuery: '',
    startDateString: '2024-08-10',
    endDateString: '2024-08-16',
    selectedDateSpan: {period: 'last30days'},
    customProperties: [],
    initialSelectedImpactAnalysisTable: 'repositories',
  }
}

export function getRemediationTabProps(): RemediationTabProps {
  return {
    submittedQuery: '',
    startDateString: '2024-08-10',
    endDateString: '2024-08-16',
  }
}

export function getPreventionTabProps(): PreventionTabProps {
  return {
    submittedQuery: '',
    startDateString: '2024-08-10',
    endDateString: '2024-08-16',
    customProperties: [],
    selectedDateSpan: {period: 'last30days'},
  }
}
