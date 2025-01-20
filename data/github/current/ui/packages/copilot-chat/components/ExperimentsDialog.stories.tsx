import type {Meta, StoryObj} from '@storybook/react'
import {createRef} from 'react'

import {ExperimentsDialog, type ExperimentsDialogProps} from './ExperimentsDialog'

const meta = {
  title: 'Apps/Copilot/ExperimentsDialog',
  component: ExperimentsDialog,
  parameters: {},
  argTypes: {},
} satisfies Meta<typeof ExperimentsDialog>

export default meta

const defaultArgs: ExperimentsDialogProps = {
  onDismiss: () => {},
  experimentsDialogRef: createRef(),
}

export const Standalone: StoryObj<ExperimentsDialogProps> = {
  args: {
    ...defaultArgs,
  },
  render: args => <ExperimentsDialog {...args} />,
}
