import type {RepoSettingsPropertiesPagePayload} from '@github-ui/custom-properties-types'
import {Wrapper} from '@github-ui/react-core/test-utils'
import type {Meta} from '@storybook/react'
import {Route, Routes} from 'react-router-dom'

import {FlashProvider} from '../contexts/FlashContext'
import {repoCustomPropertiesRoute} from '../custom-properties'
import {sampleStorybookDefinitions} from '../test-utils/mock-data'
import {RepoSettingsCustomPropertiesPage} from './RepoSettingsCustomPropertiesPage'

const baseRoutePayload: RepoSettingsPropertiesPagePayload = {
  definitions: sampleStorybookDefinitions,
  editableProperties: [
    'contains_phi',
    'data_sensitivity',
    'notes',
    'cost_center_id',
    'very_long_property_name_that_should_break_the_layout',
  ],
  currentRepo: {
    id: 1,
    name: 'github',
    visibility: 'private',
    description: '',
    properties: {
      env: 'prod',
      region: 'US East',
      ['very_long_property_name_that_should_break_the_layout']: 'very_long_property_value_that_should_break_the_layout',
      ['data_sensitivity']: 'medium',
    },
  },
}

const meta: Meta = {
  title: 'Apps/Custom Properties/RepoSettingsCustomPropertiesPage',
  decorators: [
    (Story, {parameters}) => (
      <Wrapper
        pathname="/github/properties-game/custom-properties"
        routes={[repoCustomPropertiesRoute]}
        routePayload={parameters.routePayload}
      >
        <Routes>
          <Route
            path={repoCustomPropertiesRoute.path}
            element={
              <FlashProvider>
                <Story />
              </FlashProvider>
            }
          />
        </Routes>
      </Wrapper>
    ),
  ],
  parameters: {
    routePayload: baseRoutePayload,
  },
}

export default meta

export const CanEdit = () => {
  return <RepoSettingsCustomPropertiesPage />
}

export const CannotEdit = () => {
  return <RepoSettingsCustomPropertiesPage />
}

CannotEdit.parameters = {
  routePayload: {...baseRoutePayload, editableProperties: []},
}
