import {testIdProps} from '@github-ui/test-id-props'
import {Box, Heading} from '@primer/react'

import {ViewerPrivileges} from '../../../../helpers/viewer-privileges'
import {Origin404Redirect} from '../../../../routes'
import {AddCollaborators} from './add-collaborators'
import {CollaboratorsFilterProvider} from './collaborators-filter'
import {CollaboratorsTable} from './collaborators-table'
import {PrivacySettings} from './privacy-settings'

export const AccessSettingsView = () => {
  const {hasAdminPermissions} = ViewerPrivileges()

  if (hasAdminPermissions) {
    return (
      <Box
        sx={{flexDirection: 'column', flexGrow: 1, display: 'flex', paddingBottom: 5}}
        {...testIdProps('access-settings')}
      >
        <Heading as="h2" sx={{mb: 3, fontSize: 4, fontWeight: 'normal'}}>
          Who has access
        </Heading>

        <PrivacySettings />
        <AddCollaborators />

        <CollaboratorsFilterProvider>
          <CollaboratorsTable />
        </CollaboratorsFilterProvider>
      </Box>
    )
  }

  return <Origin404Redirect />
}
