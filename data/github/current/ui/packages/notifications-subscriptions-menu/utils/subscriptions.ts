import {createElement} from 'react'
import {ArrowRightIcon} from '@primer/octicons-react'

export enum SubscriptionTypeValue {
  NONE = 'none',
  WATCHING = 'watching',
  IGNORING = 'ignoring',
  CUSTOM = 'custom',
}

export type SubscriptionType = {
  name: string
  description: string
  trailingIcon?: JSX.Element
  subscriptionType: string
}

export const SUBSCRIPTION_TYPE_NAMES: Record<SubscriptionTypeValue, string> = {
  [SubscriptionTypeValue.NONE]: 'Participating and @mentions',
  [SubscriptionTypeValue.WATCHING]: 'All Activity',
  [SubscriptionTypeValue.IGNORING]: 'Ignore',
  [SubscriptionTypeValue.CUSTOM]: 'Custom',
} as const

export const SUBSCRIPTION_TYPE_LABELS: Record<SubscriptionTypeValue, string> = {
  ...SUBSCRIPTION_TYPE_NAMES,
  [SubscriptionTypeValue.NONE]: 'Participating', // Shortened label for screen readers
}

export const SUBSCRIPTION_TYPE_TEXT: Record<SubscriptionTypeValue, string> = {
  [SubscriptionTypeValue.NONE]: 'Watch',
  [SubscriptionTypeValue.WATCHING]: 'Unwatch',
  [SubscriptionTypeValue.IGNORING]: 'Stop ignoring',
  [SubscriptionTypeValue.CUSTOM]: 'Unwatch',
} as const

export const SUBSCRIPTION_TYPES: SubscriptionType[] = [
  {
    name: SUBSCRIPTION_TYPE_NAMES[SubscriptionTypeValue.NONE],
    description: 'Only receive notifications from this repository when participating or @mentioned.',
    subscriptionType: SubscriptionTypeValue.NONE,
  },
  {
    name: SUBSCRIPTION_TYPE_NAMES[SubscriptionTypeValue.WATCHING],
    description: 'Notified of all notifications on this repository.',
    subscriptionType: SubscriptionTypeValue.WATCHING,
  },
  {
    name: SUBSCRIPTION_TYPE_NAMES[SubscriptionTypeValue.IGNORING],
    description: 'Never be notified.',
    subscriptionType: SubscriptionTypeValue.IGNORING,
  },
  {
    name: SUBSCRIPTION_TYPE_NAMES[SubscriptionTypeValue.CUSTOM],
    description: 'Select events you want to be notified of in addition to participating and @mentions.',
    trailingIcon: createElement(ArrowRightIcon),
    subscriptionType: SubscriptionTypeValue.CUSTOM,
  },
] as const

// Return the text to show in the button based on the selected subscription
export const subscriptionTypeText = (subscription: string) => {
  return subscription in SUBSCRIPTION_TYPE_TEXT ? SUBSCRIPTION_TYPE_TEXT[subscription as SubscriptionTypeValue] : ''
}

// Return the text to read out loud based on the selected subscription
export const subscriptionStateText = (subscription: string) => {
  return subscription in SUBSCRIPTION_TYPE_NAMES ? SUBSCRIPTION_TYPE_NAMES[subscription as SubscriptionTypeValue] : ''
}

export const subscriptionLabelText = (subscription: string, repositoryName: string) => {
  const buttonText = subscriptionTypeText(subscription) // Accessible label must start with button text
  const selection = SUBSCRIPTION_TYPE_LABELS[subscription as SubscriptionTypeValue]

  if (subscription === SubscriptionTypeValue.IGNORING) {
    return `${buttonText} in ${repositoryName}` // Special case to avoid duplicate 'ignore' wording
  }
  return `${buttonText}: ${selection} in ${repositoryName}`
}
