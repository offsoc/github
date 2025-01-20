import type {Meta, StoryObj} from '@storybook/react'
import {action} from '@storybook/addon-actions'
import {ClosedOrMergedStateMergeBox} from './ClosedOrMergedStateMergeBox'
import {Box} from '@primer/react'
import {within} from '@testing-library/react'
import {expect} from '@storybook/jest'

type Story = StoryObj<typeof ClosedOrMergedStateMergeBox>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const successfulWithDelay = (delay: number) => (propName: string) => (callbacks: any) => {
  setTimeout(() => action(propName)(callbacks.onCompleted()), delay)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const successful = (propName: string) => (callbacks: any) => {
  action(propName)(callbacks.onCompleted())
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const failure = (propName: string) => (callbacks: any) => {
  action(propName)(callbacks.onError())
}

const meta = {
  title: 'Pull Requests/mergebox/ClosedOrMergedStateMergeBox',
  component: ClosedOrMergedStateMergeBox,
} satisfies Meta<typeof ClosedOrMergedStateMergeBox>

export const Default: Story = {
  args: {
    state: 'CLOSED',
    headRefName: 'monalisa/my-branch-to-update-broken-tests',
    viewerCanDeleteHeadRef: true,
    viewerCanRestoreHeadRef: true,
    onDeleteHeadRef: successful('onDeleteHeadRef'),
    onRestoreHeadRef: successful('onRestoreHeadRef'),
  },
  argTypes: {
    state: {
      table: {disable: true},
    },
    onDeleteHeadRef: {
      table: {disable: true},
    },
    onRestoreHeadRef: {
      table: {disable: true},
    },
    headRepository: {
      table: {disable: true},
    },
  },
  render: function Component(args) {
    return (
      <>
        <ClosedOrMergedStateMergeBox {...args} state="CLOSED" />
        <Box sx={{mt: 3}} />
        <ClosedOrMergedStateMergeBox {...args} state="MERGED" />
      </>
    )
  },
}

export const Interactions: Story = {
  ...Default,
  args: {
    ...Default.args,
    onDeleteHeadRef: successfulWithDelay(50)('onDeleteHeadRef'),
  },
  render: args => <ClosedOrMergedStateMergeBox {...args} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement)

    await canvas.getByRole('button', {name: /delete branch/i}).click()

    expect(canvas.getByRole('button', {name: /Deleting branch.../i})).toBeDisabled()
  },
}

export const CanDeleteBranch: Story = {
  ...Default,
  args: {
    ...Default.args,
  },
}

export const CanRestoreBranch: Story = {
  ...Default,
  args: {
    ...Default.args,
    viewerCanDeleteHeadRef: false,
  },
}

export const ErrorDeletingBranch: Story = {
  ...Default,
  args: {
    ...Default.args,
    onDeleteHeadRef: failure('onDeleteHeadRef'),
  },
}

export const ErrorRestoringBranch: Story = {
  ...Default,
  args: {
    ...Default.args,
    viewerCanDeleteHeadRef: false,
    onRestoreHeadRef: failure('onRestoreHeadRef'),
  },
}

export default meta
