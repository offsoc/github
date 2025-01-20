import type {Meta, StoryObj} from '@storybook/react'
import {CloseAlertOverlay, type CloseAlertOverlayProps} from '../CloseAlertOverlay'
import {QueryClientProvider} from '@tanstack/react-query'
import {queryClient} from '@github-ui/security-campaigns-shared/utils/query-client'

const meta = {
  title: 'Apps/Security Campaigns/CloseAlertOverlay',
  component: CloseAlertOverlay,
} satisfies Meta<typeof CloseAlertOverlay>

export default meta
type Story = StoryObj<typeof CloseAlertOverlay>

const closeAlertsPath = '/close-alerts'

global.fetch = async url => {
  if (url.toString().includes(closeAlertsPath)) {
    return {ok: false, status: 400, json: async () => ({message: 'Something went wrong'})} as Response
  }

  return new Response()
}

export const OneAlert: Story = {
  name: 'One alert',
  render: (args: CloseAlertOverlayProps) => <CloseAlertOverlay {...args} />,
  args: {
    setOpen: () => undefined,
    closeAlertsPath,
    alertNumbers: [1],
  },
  decorators: [
    Story => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
}

export const MultipleAlerts: Story = {
  name: 'Multiple alerts',
  render: (args: CloseAlertOverlayProps) => <CloseAlertOverlay {...args} />,
  args: {
    setOpen: () => undefined,
    closeAlertsPath,
    alertNumbers: [1, 2, 3],
  },
  decorators: [
    Story => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
}
