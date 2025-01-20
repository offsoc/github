import {createContext, useContext} from 'react'
import type {User} from '../types/user'
import type {SecurityCampaign} from '../types/security-campaign'

// To ensure that we can compose different components to create different form layouts depending on where the form
// is shown, we use a context to pass the form state and handlers down to the components that need them.
// Use SecurityCampaignFormWrapper as the top-level component to provide the context.
export type SecurityCampaignFormContextValue = {
  campaign: SecurityCampaign | undefined
  allowDueDateInPast: boolean

  campaignName: string
  setCampaignName: (name: string) => void
  campaignDescription: string
  setCampaignDescription: (description: string) => void
  campaignDueDate: Date | null
  setCampaignDueDate: (date: Date | null) => void
  campaignManager: User | null
  setCampaignManager: (manager: User | null) => void

  validationError: string | null

  handleSubmit: () => void
  isPending: boolean
  formError: Error | null

  resetForm: () => void
}

export const SecurityCampaignFormContext = createContext<SecurityCampaignFormContextValue | null>(null)

export function useSecurityCampaignFormContext(): SecurityCampaignFormContextValue {
  const context = useContext(SecurityCampaignFormContext)
  if (context === null) {
    throw new Error('SecurityCampaignFormContext must be used within a SecurityCampaignFormContextProvider')
  }

  return context
}
