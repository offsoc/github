import type {Meta, StoryObj} from '@storybook/react'

import {EditButton} from '../EditButton'
import {Wrapper} from '@github-ui/react-core/test-utils'

const meta = {
  title: 'Apps/Code View Shared/EditButton',
  component: EditButton,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof EditButton>

export default meta

const defaultArgs = {
  editPath: 'www.github.com',
  editTooltip: 'Edit this file',
}

type Story = StoryObj<typeof EditButton>

export const Default: Story = {
  render: () => (
    <Wrapper appPayload={{helpUrl: ''}}>
      <EditButton editPath={defaultArgs.editPath} editTooltip={defaultArgs.editTooltip} />{' '}
    </Wrapper>
  ),
}
