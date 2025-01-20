export const defaultOption = "Don't notify"
export const defaultPrefix = 'Notify me: '
export const defaultEmailNotificationPreferenceOption = 'No additional events'
export const digestOptions = {
  none: "Don't send",
  weekly: 'Send weekly',
  daily: 'Send daily',
}
export const watchingDropdownOptions = {web: 'On GitHub', email: 'Email'}
export const watchingDisplayOptions = {web: 'on GitHub', email: 'Email'}
export const actionsDropdownOptions = {continuousIntegrationWeb: 'On GitHub', continuousIntegrationEmail: 'Email'}
export const actionsDisplayOptions = {continuousIntegrationWeb: 'on GitHub', continuousIntegrationEmail: 'Email'}
export const actionsDropdownVariants = {continuousIntegrationFailuresOnly: 'Only notify for failed workflows'}
export const actionsDisplayVariants = {continuousIntegrationFailuresOnly: 'Failed workflows only'}
export const vulnerabilityDropdownOptions = {
  vulnerabilityWeb: 'On GitHub',
  vulnerabilityEmail: 'Email',
  vulnerabilityCli: 'CLI',
}
export const vulnerabilityDisplayOptions = {...vulnerabilityDropdownOptions, ...{vulnerabilityWeb: 'on GitHub'}}
export const emailNotificationPreferenceDropdownOptions = {
  pullRequestReview: 'Pull Request reviews',
  pullRequestPush: 'Pull Request pushes',
  commentEmail: 'Comments on Issues and Pull Requests',
  ownViaEmail: 'Includes your own updates',
}
export const emailNotificationPreferenceDisplayOptions = {
  pullRequestReview: 'Reviews',
  pullRequestPush: 'Pushes',
  commentEmail: 'Comments',
  ownViaEmail: 'My own updates',
}

export function getSelectedOptionsAndVariants(
  selected: {[key: string]: boolean},
  options: {[key: string]: string},
  variants: {[key: string]: string},
) {
  const selectedOptions: string[] = []
  const selectedVariants: string[] = []
  Object.keys(options).map(key => {
    if (selected[key]) {
      selectedOptions.push(key)
    }
  })
  Object.keys(variants).map(key => {
    if (selected[key]) {
      selectedVariants.push(key)
    }
  })
  return [selectedOptions, selectedVariants]
}
