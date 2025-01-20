import type {RepoPropertiesPagePayload} from '@github-ui/custom-properties-types'
import {Wrapper} from '@github-ui/react-core/test-utils'
import type {Meta} from '@storybook/react'

import {sampleStorybookDefinitions} from '../test-utils/mock-data'
import {RepoCustomPropertiesPage} from './RepoCustomPropertiesPage'

const baseRoutePayload: RepoPropertiesPagePayload = {
  definitions: sampleStorybookDefinitions,
  values: {
    ['contains_phi']: 'true',
    notes: 'US East',
    ['very_long_property_name_that_should_break_the_layout']: 'very_long_property_value_that_should_break_the_layout',
  },
  canEditProperties: false,
}

const meta: Meta = {
  title: 'Apps/Custom Properties/RepoCustomPropertiesPage',
  decorators: [
    (Story, {parameters}) => (
      <Wrapper routePayload={parameters.routePayload}>
        <Story />
      </Wrapper>
    ),
  ],
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'link-in-text-block',
            enabled: false,
          },
        ],
      },
    },
    routePayload: baseRoutePayload,
  },
}

export default meta

export const Default = () => {
  return <RepoCustomPropertiesPage />
}

export const CanEditProperties = () => {
  return <RepoCustomPropertiesPage />
}

CanEditProperties.parameters = {
  routePayload: {...baseRoutePayload, canEditProperties: true},
}
