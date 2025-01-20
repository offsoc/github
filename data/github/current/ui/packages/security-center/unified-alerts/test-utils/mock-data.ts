import type {UnifiedAlertsPayload} from '../../routes/UnifiedAlerts'

export function getUnifiedAlertsProps(): UnifiedAlertsPayload {
  return {
    initialQuery: '',
    feedbackLink: {
      text: 'Give feedback',
      url: '#',
    },
    showIncompleteDataWarning: false,
    incompleteDataWarningDocHref: 'https://docs.github.com/en',
    filterProviders: [],
    customProperties: [],
  }
}
