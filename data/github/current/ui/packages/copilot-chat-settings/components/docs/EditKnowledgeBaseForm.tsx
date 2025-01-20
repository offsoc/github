import type {Docset, DocsetRepo, RepoData} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {Heading, Link, Pagehead, Text} from '@primer/react'
import {useNavigate} from 'react-router-dom'

import type {KnowledgeBaseOwner} from '../../routes/payloads'
import {KnowledgeBaseDefinition} from './KnowledgeBaseDefinition'
import {KnowledgeBaseForm} from './KnowledgeBaseForm'
import {CopilotChatSettingsServiceContext} from '../../utils/copilot-chat-settings-service'
import {useContext} from 'react'

interface EditDocsetFormProps {
  docset: Docset
  docsetOwner: KnowledgeBaseOwner
  repoData: RepoData[]
}

export function EditKnowledgeBaseForm({docset, docsetOwner, repoData}: EditDocsetFormProps) {
  const navigate = useNavigate()
  const service = useContext(CopilotChatSettingsServiceContext)

  /**
   * Handles updating a docset on the server. Returns an error message if there was an error, otherwise returns undefined
   */
  const updateDocset = async (owner: KnowledgeBaseOwner, name: string, description: string, repos: DocsetRepo[]) => {
    try {
      await service.updateKnowledgeBase(docset, docsetOwner, name, description, repos)
    } catch (error) {
      if (error instanceof Error) {
        return error.message
      }

      return 'An error occurred.'
    }

    navigate(`/organizations/${owner.displayLogin}/settings/copilot/chat_settings?action=updated`)
  }

  return (
    <>
      <Pagehead sx={{mt: 0, pt: 0, pb: 2}}>
        <Heading as="h1" sx={{fontWeight: 'normal', fontSize: 4}}>
          <Link href={`/organizations/${docsetOwner.displayLogin}/settings/copilot/chat_settings`}>
            Knowledge bases
          </Link>{' '}
          / Edit {docset.name}
        </Heading>
      </Pagehead>

      <Text as="p" sx={{mb: 4}}>
        <KnowledgeBaseDefinition />
      </Text>

      <KnowledgeBaseForm
        onSave={updateDocset}
        docsetOwner={docsetOwner}
        initialDocset={docset}
        initialRepos={repoData}
        primaryButtonText="Update knowledge base"
      />
    </>
  )
}
