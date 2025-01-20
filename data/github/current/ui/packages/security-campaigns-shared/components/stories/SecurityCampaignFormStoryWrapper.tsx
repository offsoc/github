import type {ReactNode} from 'react'
import {QueryClientProvider} from '@tanstack/react-query'
import type {SecurityCampaign} from '../../types/security-campaign'
import type {User} from '../../types/user'
import {queryClient} from '../../test-utils/query-client'
import {getUser} from '../../test-utils/mock-data'
import {SecurityCampaignFormWrapper} from '../SecurityCampaignFormWrapper'

export type SecurityCampaignFormStoryWrapperProps = {
  campaign?: SecurityCampaign
  currentUser?: User
  children: ReactNode
}

export function SecurityCampaignFormStoryWrapper({
  campaign,
  children,
  currentUser = getUser(),
}: SecurityCampaignFormStoryWrapperProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityCampaignFormWrapper
        campaign={campaign}
        currentUser={currentUser}
        allowDueDateInPast={false}
        submitForm={() => {}}
        reset={() => {}}
        isPending={false}
        formError={null}
      >
        {children}
      </SecurityCampaignFormWrapper>
    </QueryClientProvider>
  )
}
