import type {SecurityCenterCodeScanningMetricsProps} from '../SecurityCenterCodeScanningMetrics'

export function getSecurityCenterCodeScanningMetricsProps(): SecurityCenterCodeScanningMetricsProps {
  return {
    initialQuery: '',
    initialDateSpan: {period: 'last30days'},
    feedbackLink: {
      text: 'Give feedback',
      url: '#',
    },
    showIncompleteDataWarning: false,
    incompleteDataWarningDocHref: 'https://docs.github.com/en',
    allowAutofixFeatures: true,
    filterProviders: [],
  }
}
