import type {Meta} from '@storybook/react'

import {GitHubAvatar, type GitHubAvatarProps} from './GitHubAvatar'

const meta = {
  title: 'Recipes/GitHubAvatar',
  component: GitHubAvatar,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    src: {control: 'text', defaultValue: 'https://avatars.githubusercontent.com/mona'},
    alt: {control: 'text', defaultValue: ''},
    size: {control: 'number', defaultValue: 20},
    square: {control: 'boolean', defaultValue: false},
  },
} satisfies Meta<typeof GitHubAvatar>

export default meta

const defaultArgs: Partial<GitHubAvatarProps> = {
  src: 'https://avatars.githubusercontent.com/mona',
}

export const GitHubAvatarExample = {
  name: 'GitHubAvatar Example',
  args: {
    ...defaultArgs,
  },
  render: (args: GitHubAvatarProps) => <GitHubAvatar {...args} />,
}
