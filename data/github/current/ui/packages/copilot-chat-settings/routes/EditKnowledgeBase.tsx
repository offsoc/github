import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

import {KnowledgeBaseFormProviders} from '../components/docs/KnowledgeBaseFormProviders'
import {EditKnowledgeBaseForm} from '../components/docs/EditKnowledgeBaseForm'
import type {EditKnowledgeBasePayload, ShowKnowledgeBasePayload} from './payloads'
import {CopilotChatSettingsServiceContext} from '../utils/copilot-chat-settings-service'
import {useContext, useEffect, useState} from 'react'
import {Box, Spinner} from '@primer/react'

export function EditKnowledgeBase() {
  const routePayload = useRoutePayload<EditKnowledgeBasePayload>()
  const service = useContext(CopilotChatSettingsServiceContext)
  const [isLoading, setIsLoading] = useState(true)
  const [payload, setPayload] = useState<ShowKnowledgeBasePayload | undefined>(undefined)

  useEffect(() => {
    let ignore = false

    const fetch = async () => {
      const response = await service.fetchKnowledgeBase(
        routePayload.currentOrganizationLogin,
        routePayload.knowledgeBaseId,
      )

      if (!ignore) {
        setIsLoading(false)
        setPayload(response)
      }
    }

    setIsLoading(true)
    fetch()

    return () => {
      ignore = true
    }
  }, [routePayload.currentOrganizationLogin, routePayload.knowledgeBaseId, service])

  return (
    <KnowledgeBaseFormProviders>
      {isLoading || !payload ? (
        <Box sx={{display: 'flex', justifyContent: 'center'}}>
          <Spinner />
        </Box>
      ) : (
        <EditKnowledgeBaseForm docset={payload.docset} repoData={payload.repoData} docsetOwner={payload.docsetOwner} />
      )}
    </KnowledgeBaseFormProviders>
  )
}
