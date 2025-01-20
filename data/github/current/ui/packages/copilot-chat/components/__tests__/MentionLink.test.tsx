import {render, screen} from '@testing-library/react'

import {getCopilotChatProviderProps} from '../../test-utils/mock-data'
import {CopilotChatProvider} from '../../utils/CopilotChatContext'
import {MentionLink} from '../MentionLink'

const fetchAgents = jest.fn()
jest.mock('../../utils/CopilotChatManagerContext', () => {
  return {
    ...jest.requireActual('../../utils/CopilotChatManagerContext'),
    useChatManager: () => {
      return {
        fetchAgents,
      }
    },
  }
})

beforeEach(() => {
  jest.resetAllMocks()
})

describe('MentionLink', () => {
  it('should render the mention as text if the agent does not exist', () => {
    const mention = '@octocat'

    render(
      <CopilotChatProvider {...getCopilotChatProviderProps()}>
        <MentionLink mention={mention} />
      </CopilotChatProvider>,
    )
    expect(screen.getByText(mention)).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('should render the mention as a link if the agent exists', () => {
    const mention = '@octocat'
    const agent = {slug: 'octocat', integrationUrl: 'test.com', name: 'octocat', avatarUrl: 'test.com'}
    const agents = [agent]

    render(
      <CopilotChatProvider {...getCopilotChatProviderProps()} agents={agents}>
        <MentionLink mention={mention} />
      </CopilotChatProvider>,
    )
    expect(screen.getByText(mention)).toBeInTheDocument()
    expect(screen.getByRole('link')).toBeInTheDocument()
  })

  it('should fetch agents if they are unset', () => {
    const mention = '@octocat'

    render(
      <CopilotChatProvider {...getCopilotChatProviderProps()} agents={undefined}>
        <MentionLink mention={mention} />
      </CopilotChatProvider>,
    )

    expect(fetchAgents).toHaveBeenCalled()
  })
})
