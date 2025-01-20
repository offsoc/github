import {Link} from '@primer/react'
import DOMPurify from 'dompurify'

import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'

export function MentionLink({mention}: {mention: string}) {
  const manager = useChatManager()
  const {agents, agentsPath} = useChatState()
  if (!agents) {
    const fetchAgents = async () => {
      return agentsPath ? await manager.fetchAgents(agentsPath) : []
    }
    // fetch the agents, but don't hold up showing the message.
    void fetchAgents()
    return <>{mention}</>
  }

  // If the agents array contains the mention without the '@'
  const mentionSlug = mention.substring(1)
  const matchingAgent = agents.find(agent => agent.slug === mentionSlug)
  if (matchingAgent) {
    // Replace the mention in the original string with a Link
    const sanitizedMention = DOMPurify.sanitize(mention)
    return (
      <Link
        href={matchingAgent.integrationUrl}
        data-hovercard-url={`/integrations/${mentionSlug}/hovercard`}
        className="bgColor-accent-muted"
      >
        {sanitizedMention}
      </Link>
    )
  }
  return <>{mention}</>
}
