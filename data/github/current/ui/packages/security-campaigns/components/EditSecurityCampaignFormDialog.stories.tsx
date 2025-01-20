import type {Meta} from '@storybook/react'
import {
  EditSecurityCampaignFormDialog,
  type EditSecurityCampaignFormDialogProps,
} from './EditSecurityCampaignFormDialog'
import {getSecurityCampaign} from '@github-ui/security-campaigns-shared/test-utils/mock-data'
import {QueryClientProvider} from '@tanstack/react-query'
import {queryClient} from '@github-ui/security-campaigns-shared/utils/query-client'

const meta = {
  title: 'Security Campaigns/Security Campaign Form Dialog',
  component: EditSecurityCampaignFormDialog,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof EditSecurityCampaignFormDialog>

export default meta

const defaultArgs: Partial<EditSecurityCampaignFormDialogProps> = {
  setIsOpen: () => undefined,
  allowDueDateInPast: false,
  submitForm: () => Promise.resolve({ok: true}),
}

export const CreateNewCampaign = {
  args: defaultArgs,
  render: (args: EditSecurityCampaignFormDialogProps) => (
    <QueryClientProvider client={queryClient}>
      <EditSecurityCampaignFormDialog {...args} />
    </QueryClientProvider>
  ),
}

export const UpdateExistingCampaign = {
  args: {
    ...defaultArgs,
    campaign: getSecurityCampaign(),
    allowDueDateInPast: true,
  },
  render: (args: EditSecurityCampaignFormDialogProps) => (
    <QueryClientProvider client={queryClient}>
      <EditSecurityCampaignFormDialog {...args} />
    </QueryClientProvider>
  ),
}
