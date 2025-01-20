import type {Meta, StoryObj} from '@storybook/react'
import {CompressedAssigneeAnchor} from './CompressedAssigneeAnchor'

const meta: Meta<typeof CompressedAssigneeAnchor> = {
  title: 'ItemPicker/CompressedAssigneeAnchor',
  component: CompressedAssigneeAnchor,
}

export default meta

export const Default = {
  args: {
    assignees: [{avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4', login: 'monalisa'}],
  },
} satisfies StoryObj<typeof CompressedAssigneeAnchor>

export const Readonly = {
  args: {
    readonly: true,
    assignees: [
      {avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4', login: 'octocat'},
      {avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4', login: 'copilot'},
    ],
    anchorProps: undefined,
  },
} satisfies StoryObj<typeof CompressedAssigneeAnchor>
