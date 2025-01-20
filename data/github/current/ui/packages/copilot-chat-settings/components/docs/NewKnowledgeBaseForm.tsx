import type {DocsetRepo} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {Heading, Link, Pagehead, Text} from '@primer/react'
import {useNavigate} from 'react-router-dom'

import type {KnowledgeBaseOwner} from '../../routes/payloads'
import {KnowledgeBaseDefinition} from './KnowledgeBaseDefinition'
import {KnowledgeBaseForm} from './KnowledgeBaseForm'
import {CopilotChatSettingsServiceContext} from '../../utils/copilot-chat-settings-service'
import {useContext} from 'react'

interface NewDocsetFormProps {
  docsetOwner: KnowledgeBaseOwner
}

export function NewKnowledgeBaseForm({docsetOwner}: NewDocsetFormProps) {
  const navigate = useNavigate()
  const service = useContext(CopilotChatSettingsServiceContext)

  /**
   * Handles creating a docset on the server. Returns an error message if there was an error, otherwise returns undefined
   */
  const createDocset = async (owner: KnowledgeBaseOwner, name: string, description: string, repos: DocsetRepo[]) => {
    const message = await service.createKnowledgeBase(docsetOwner, name, description, repos)

    if (message) return message

    navigate(`/organizations/${owner.displayLogin}/settings/copilot/chat_settings?action=created`)
  }

  return (
    <>
      <Pagehead sx={{mt: 0, pt: 0, pb: 2}}>
        <Heading as="h1" sx={{fontWeight: 'normal', fontSize: 4}}>
          <Link href={`/organizations/${docsetOwner.displayLogin}/settings/copilot/chat_settings`}>
            Knowledge bases
          </Link>{' '}
          / New
        </Heading>
      </Pagehead>

      <Text as="p" sx={{mb: 4}}>
        <KnowledgeBaseDefinition />
      </Text>

      <KnowledgeBaseForm onSave={createDocset} docsetOwner={docsetOwner} primaryButtonText="Create knowledge base" />
    </>
  )
}
