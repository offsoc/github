import type {Meta} from '@storybook/react'
import {SecurityCampaignFormContents, type SecurityCampaignFormContentsProps} from '../SecurityCampaignFormContents'
import {SecurityCampaignFormStoryWrapper} from './SecurityCampaignFormStoryWrapper'

const meta = {
  title: 'Security Campaigns/Security Campaign Form Contents',
  component: SecurityCampaignFormContents,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof SecurityCampaignFormContents>

export default meta

const defaultArgs: Partial<SecurityCampaignFormContentsProps> = {
  campaignManagersPath: '/github/security-campaigns/security/campaigns/managers',
}

export const SecurityCampaignFormContentsExample = {
  args: defaultArgs,
  render: (args: SecurityCampaignFormContentsProps) => (
    <SecurityCampaignFormStoryWrapper>
      <SecurityCampaignFormContents {...args} />
    </SecurityCampaignFormStoryWrapper>
  ),
}
