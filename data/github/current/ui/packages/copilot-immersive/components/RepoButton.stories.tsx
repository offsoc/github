import type {CopilotChatRepo} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {Box} from '@primer/react'
import type {Meta} from '@storybook/react'

import {RepoButton} from './RepoButton'

const meta = {
  title: 'Copilot/RepoButton',
  component: RepoButton,
} satisfies Meta<typeof RepoButton>

export default meta

const defaultArgs: CopilotChatRepo = {
  id: 5,
  name: 'github',
  ownerLogin: 'github',
  ownerType: 'Organization',
  commitOID: '',
  ref: 'main',
  refInfo: {
    name: 'main',
    type: 'branch',
  },
  visibility: 'private',
}

export const RepoButtonExample = {
  args: {
    ...defaultArgs,
  },
  render: (props: CopilotChatRepo) => {
    return (
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 4}}>
        <RepoButton repo={props} />
      </Box>
    )
  },
}
