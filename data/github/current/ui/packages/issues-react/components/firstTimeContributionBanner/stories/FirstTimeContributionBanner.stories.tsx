import type {Meta} from '@storybook/react'
import {
  FirstTimeContributionBannerDisplay,
  type FirstTimeContributionBannerDisplayProps,
} from '../FirstTimeContributionBannerDisplay'

const meta = {
  title: 'FirstTimeContributionBanner',
  component: FirstTimeContributionBannerDisplay,
} satisfies Meta<typeof FirstTimeContributionBannerDisplay>

const defaultArgs = {
  hasGoodFirstIssueIssues: false,
  repoNameWithOwner: 'pytorch/pytorch',
  contributeUrl: 'https://github.com/pytorch/pytorch/contribute',
} satisfies FirstTimeContributionBannerDisplayProps

export default meta

export const WithoutContributionGuidelines = {
  args: {
    ...defaultArgs,
  },
  render: FirstTimeContributionBannerDisplay,
}

export const WithContributionGuidelines = {
  args: {
    ...defaultArgs,
    contributingGuidelinesUrl: 'https://github.com/pytorch/pytorch/blob/main/CONTRIBUTING.md',
  },
  render: FirstTimeContributionBannerDisplay,
}

export const WithGoodFirstIssues = {
  args: {
    ...defaultArgs,
    hasGoodFirstIssueIssues: true,
  },
  render: FirstTimeContributionBannerDisplay,
}

export const WithGuidelinesGoodFirstIssues = {
  args: {
    ...defaultArgs,
    contributingGuidelinesUrl: 'https://github.com/pytorch/pytorch/blob/main/CONTRIBUTING.md',
    hasGoodFirstIssueIssues: true,
  },
  render: FirstTimeContributionBannerDisplay,
}
