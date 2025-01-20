export const SETTINGS = {
  DEFAULT_RUNNER_GROUP_ID: 1,
} as const

export const ERRORS = {
  INVALID_FORM: 'Some fields are invalid. Please check the form and try again.',
  CREATION_FAILED_REASON_UNKNOWN: 'Failed to create runner. Please try again later.',
  RUNNER_NAME_ALREADY_EXISTS: (runnerName: string) =>
    `The runner name ${runnerName} already exists. Please try a different name.`,
  UPDATE_FAILED_REASON_UNKNOWN: 'Failed to update runner. Please try again later.',
} as const

export const URLS = {
  // Larger runners documentation URLs
  NETWORKING_DOCS: '/actions/using-github-hosted-runners/using-larger-runners#networking-for-larger-runners',
  RUNNER_GROUPS_DOCS: '/actions/using-github-hosted-runners/controlling-access-to-larger-runners',
  USAGE_LIMITS: '/actions/learn-github-actions/usage-limits-billing-and-administration#usage-limits',
  LATEST_IMAGE_TAG: 'https://github.com/actions/runner-images#label-scheme',
  PARTNER_IMAGES_REPO: 'https://github.com/actions/partner-runner-images',

  // General documentation URLs
  ENTERPRISE_DOCS: '/enterprise-cloud@latest/admin/overview/setting-up-a-trial-of-github-enterprise-cloud',
  PRICING: '/pricing',
} as const
