import type {Meta, StoryObj} from '@storybook/react'

import type {Docset} from '../utils/copilot-chat-types'
import {KnowledgeBaseAvatar, type KnowledgeBaseAvatarProps} from './KnowledgeBaseAvatar'

const meta = {
  title: 'Apps/Copilot/KnowledgeBaseAvatar',
  component: KnowledgeBaseAvatar,
  parameters: {},
  argTypes: {},
} satisfies Meta<typeof KnowledgeBaseAvatar>

export default meta

const defaultArgs: KnowledgeBaseAvatarProps = {
  size: 32,
  docset: {
    // GitHub's organization id
    ownerID: 9919,
    ownerType: 'organization',
    visibility: 'private',
  } as Docset,
}

export const Standalone: StoryObj<KnowledgeBaseAvatarProps> = {
  args: {
    ...defaultArgs,
  },
  render: args => <KnowledgeBaseAvatar {...args} />,
}
