import {CopilotChatService} from '@github-ui/copilot-chat/utils/copilot-chat-service'
import {createContext, useContext} from 'react'

export class CopilotCodeReviewService extends CopilotChatService {
  async checkCodeReviewAccess(owner: string, repository: string) {
    const response = await this.makeDotcomRequest(`/${owner}/${repository}/copilot/review/access`, 'GET')

    if (!response.ok) {
      throw new Error(`An error occurred: ${response.status}`)
    }

    return (await response.json()) as {copilot_enabled: boolean}
  }

  async createCodeReview(owner: string, repository: string, number: number) {
    const response = await this.makeDotcomRequest(`/${owner}/${repository}/copilot/review/pull/${number}`, 'POST')

    const isTimeout = response.status === 502
    if (!response.ok && !isTimeout) {
      throw new Error(`An error occurred: ${response.status}`)
    }
  }
}

const CopilotCodeReviewServiceContext = createContext(new CopilotCodeReviewService('', []))

export const CopilotCodeReviewServiceProvider = CopilotCodeReviewServiceContext.Provider

export const useCopilotCodeReviewService = () => {
  const context = useContext(CopilotCodeReviewServiceContext)
  if (!context) {
    throw new Error('useCopilotCodeReviewService must be used inside a CopilotCodeReviewServiceProvider')
  }
  return context
}
