import type {SecretScanningMetricsProps} from '../SecretScanningMetrics'

export function getSecretScanningMetricsProps(): SecretScanningMetricsProps {
  return {
    initialQuery: '',
    initialDateSpan: {period: 'last30days'},
    feedbackUrl: 'Give feedback',
    feedbackText: '#',
    showIncompleteDataWarning: false,
    incompleteDataWarningDocHref: 'https://docs.github.com/en',
    filterProviders: [],
  }
}
