import type {Meta} from '@storybook/react'
import {
  SecurityCampaignsAlertsLimitDialog,
  type SecurityCampaignsAlertsLimitDialogProps,
} from './SecurityCampaignsAlertsLimitDialog'

const meta = {
  title: 'Security Campaign alerts limit Dialog',
  component: SecurityCampaignsAlertsLimitDialog,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof SecurityCampaignsAlertsLimitDialog>

export default meta

const defaultArgs: Partial<SecurityCampaignsAlertsLimitDialogProps> = {
  maxAlerts: 1000,
  setIsOpen: () => undefined,
  continueToCreationDialog: () => undefined,
}

export const CreateCampaignAlertsLimitDialog = {
  args: defaultArgs,
  render: (args: SecurityCampaignsAlertsLimitDialogProps) => <SecurityCampaignsAlertsLimitDialog {...args} />,
}
