import type {CopilotForBusinessTrial} from '../types'

export function formatBusinessTrialEndsAt(businessTrial: CopilotForBusinessTrial) {
  let trialEndsAt = new Date()
  if (businessTrial?.active && businessTrial?.ends_at) {
    trialEndsAt = new Date(businessTrial.ends_at)
  } else if (businessTrial?.pending && businessTrial?.trial_length) {
    trialEndsAt.setDate(trialEndsAt.getDate() + businessTrial.trial_length)
  }

  const trialEndsAtDate = trialEndsAt.toLocaleDateString('default', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  return trialEndsAtDate
}

export const formatDate = (targetDate: string) => {
  const date = new Date(targetDate)
  const day = date.getDate()
  const month = date.toLocaleString('default', {month: 'long'})
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}
