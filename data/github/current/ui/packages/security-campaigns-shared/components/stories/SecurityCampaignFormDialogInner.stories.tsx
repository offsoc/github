import type {Meta} from '@storybook/react'
import {
  SecurityCampaignFormDialogInner,
  type SecurityCampaignFormDialogInnerProps,
} from '../SecurityCampaignFormDialogInner'
import {SecurityCampaignFormStoryWrapper} from './SecurityCampaignFormStoryWrapper'
import {SecurityCampaignFormContents} from '../SecurityCampaignFormContents'

const meta = {
  title: 'Security Campaigns/Security Campaign Form Dialog Inner',
  component: SecurityCampaignFormDialogInner,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof SecurityCampaignFormDialogInner>

export default meta

const defaultArgs: Partial<SecurityCampaignFormDialogInnerProps> = {
  setIsOpen: () => {},
}

export const SecurityCampaignFormDialogInnerExample = {
  args: defaultArgs,
  render: (args: SecurityCampaignFormDialogInnerProps) => (
    <SecurityCampaignFormStoryWrapper>
      <SecurityCampaignFormDialogInner {...args}>
        <SecurityCampaignFormContents campaignManagersPath="/github/security-campaigns/security/campaigns/managers" />
      </SecurityCampaignFormDialogInner>
    </SecurityCampaignFormStoryWrapper>
  ),
}
