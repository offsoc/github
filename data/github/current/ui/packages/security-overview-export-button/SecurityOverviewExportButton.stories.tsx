import {Wrapper} from '@github-ui/react-core/test-utils'
import {SecurityOverviewExportButton} from '@github-ui/security-overview-export-button'
import type {Meta, StoryObj} from '@storybook/react'

const meta = {
  title: 'Packages/SecurityOverviewExportButton',
  component: SecurityOverviewExportButton,
  parameters: {
    controls: {
      createExportUrl: String,
      errorBannerId: String,
      successBannerId: String,
      startedBannerId: String,
    },
  },
} satisfies Meta<typeof SecurityOverviewExportButton>

export default meta

type Story = StoryObj<typeof SecurityOverviewExportButton>

export const securityOverviewExportButtonExample: Story = {
  render: () => (
    <Wrapper appPayload={{helpUrl: ''}}>
      <SecurityOverviewExportButton createExportUrl="/security/overview/export?" />
    </Wrapper>
  ),
}
