import type {Meta} from '@storybook/react'

import {NoReposMessage} from './NoReposMessage'

const meta: Meta<typeof NoReposMessage> = {
  title: 'Apps/Repos List Shared/Components/NoReposMessage',
  component: NoReposMessage,
}

export default meta

export const Default = () => {
  return (
    <NoReposMessage
      currentPage={0}
      pageCount={2}
      filtered={false}
      userInfo={{
        directOrTeamMember: true,
        admin: true,
        canCreateRepository: true,
      }}
    />
  )
}
