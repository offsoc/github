import type {Meta} from '@storybook/react'
import {
  SecurityCampaignsNoAlertsDialog,
  type SecurityCampaignsNoAlertsDialogProps,
} from './SecurityCampaignNoAlertsDialog'

const meta = {
  title: 'Apps/Security Campaigns/No alerts dialog',
  component: SecurityCampaignsNoAlertsDialog,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof SecurityCampaignsNoAlertsDialog>

export default meta

const defaultArgs: Partial<SecurityCampaignsNoAlertsDialogProps> = {
  setIsOpen: () => undefined,
}

export const CampaignCreationInactiveDialog = {
  args: defaultArgs,
  render: (args: SecurityCampaignsNoAlertsDialogProps) => <SecurityCampaignsNoAlertsDialog {...args} />,
}
