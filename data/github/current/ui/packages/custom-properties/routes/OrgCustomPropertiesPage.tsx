import type {OrgCustomPropertiesDefinitionsPagePayload} from '@github-ui/custom-properties-types'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

import {DefinitionsPage} from '../components/DefinitionsPage'
import {SetValuesPage} from '../components/SetValuesPage'
import {CurrentOrgRepoProvider} from '../contexts/CurrentOrgRepoContext'
import {useActiveTab} from '../hooks/use-active-tab'

export function OrgCustomPropertiesPage() {
  return (
    <CurrentOrgRepoProvider>
      <CustomPropertiesSchemaPageContent />
    </CurrentOrgRepoProvider>
  )
}

function CustomPropertiesSchemaPageContent() {
  const {permissions} = useRoutePayload<OrgCustomPropertiesDefinitionsPagePayload>()
  const [activeTab] = useActiveTab(permissions)
  return activeTab === 'set-values' ? <SetValuesPage /> : <DefinitionsPage />
}
