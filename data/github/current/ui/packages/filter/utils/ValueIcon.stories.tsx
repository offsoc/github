import {IssueOpenedIcon, OrganizationIcon} from '@primer/octicons-react'
import type {Meta, StoryObj} from '@storybook/react'

import {AvatarType} from '../types'
import {ValueIcon} from '.'

const meta = {
  title: 'Recipes/Filter/ValueIcon',
  component: ValueIcon,
  tags: ['!autodocs'],
} satisfies Meta<typeof ValueIcon>

export default meta

type Story = StoryObj<typeof ValueIcon>

export const GitHubAvatar: Story = {
  args: {
    value: {
      avatar: {
        type: AvatarType.User,
        url: 'https://avatars.githubusercontent.com/u/2447456?s=40&v=4',
      },
      value: '@dusave',
    },
  },
}
GitHubAvatar.storyName = 'GitHub Avatar'

export const Icon: Story = {
  args: {
    value: {
      icon: IssueOpenedIcon,
      iconColor: 'var(--fgColor-success, var(--color-success-fg))',
      value: 'Issue Open',
    },
  },
}

export const ProviderIcon: Story = {
  args: {
    value: {
      icon: OrganizationIcon,
      value: 'Organization',
    },
  },
}

export const ColorDot: Story = {
  args: {
    value: {
      iconColor: 'var(--fgColor-closed, var(--color-closed-fg))',
      value: 'Closed',
    },
  },
}
