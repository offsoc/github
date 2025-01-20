import type {OrgEditPermissions} from '@github-ui/custom-properties-types'
import {Wrapper} from '@github-ui/react-core/test-utils'
import type {Meta} from '@storybook/react'
import {Route, Routes} from 'react-router-dom'

import {CurrentOrgRepoProvider} from '../contexts/CurrentOrgRepoContext'
import {FlashProvider} from '../contexts/FlashContext'
import {definitionsRoute} from '../custom-properties'
import {sampleRepos, sampleStorybookDefinitions} from '../test-utils/mock-data'
import {SetValuesPage} from './SetValuesPage'

const baseRoutePayload = {
  definitions: sampleStorybookDefinitions,
  permissions: 'all' as OrgEditPermissions,
}

const meta: Meta = {
  title: 'Apps/Custom Properties/Components/SetValuesPage',
  decorators: [
    (Story, {parameters}) => (
      <Wrapper
        search={parameters.search}
        routePayload={parameters.routePayload}
        pathname="/organizations/acme/settings/custom-properties"
        routes={[definitionsRoute]}
      >
        <Routes>
          <Route
            path={definitionsRoute.path}
            element={
              <FlashProvider>
                <CurrentOrgRepoProvider>
                  <Story />
                </CurrentOrgRepoProvider>
              </FlashProvider>
            }
          />
        </Routes>
      </Wrapper>
    ),
  ],
  parameters: {
    routePayload: baseRoutePayload,
    search: '',
  },
}

export default meta

export const List = () => {
  return <SetValuesPage />
}

List.parameters = {
  routePayload: {...baseRoutePayload, repositories: sampleRepos, pageCount: 1, repositoryCount: sampleRepos.length},
}

export const Empty = () => {
  return <SetValuesPage />
}

Empty.parameters = {
  routePayload: {...baseRoutePayload, repositories: [], pageCount: 1, repositoryCount: 0},
  search: '?q=github',
}
