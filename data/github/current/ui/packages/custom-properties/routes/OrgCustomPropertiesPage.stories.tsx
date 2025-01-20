import type {OrgCustomPropertiesDefinitionsPagePayload} from '@github-ui/custom-properties-types'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {Banner} from '@primer/react/experimental'
import type {Meta} from '@storybook/react'
import {Route, Routes} from 'react-router-dom'

import {FlashProvider} from '../contexts/FlashContext'
import {definitionsRoute} from '../custom-properties'
import {sampleRepos} from '../test-utils/mock-data'
import {OrgCustomPropertiesPage} from './OrgCustomPropertiesPage'

interface StoryArgs {
  ['custom_properties_danger_zone']: boolean
}

const routePayload: OrgCustomPropertiesDefinitionsPagePayload = {
  definitions: [
    {
      propertyName: 'album',
      valueType: 'string',
      required: false,
      defaultValue: null,
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      allowedValues: null,
      valuesEditableBy: 'org_actors',
      regex: null,
      sourceType: 'org',
    },
    {
      propertyName: 'band',
      valueType: 'single_select',
      required: true,
      defaultValue: 'Rammstein',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut suscipit ex ante, eget ornare sem congue id. Sed tortor elit, bibendum non nibh at, consequat convallis nisi',
      allowedValues: ['Rammstein', 'Metallica'],
      valuesEditableBy: 'org_actors',
      regex: null,
      sourceType: 'org',
    },
    {
      propertyName: 'singer',
      valueType: 'string',
      required: false,
      defaultValue: null,
      description: null,
      allowedValues: null,
      valuesEditableBy: 'org_actors',
      regex: null,
      sourceType: 'org',
    },
    {
      propertyName: 'long_property_name',
      valueType: 'string',
      required: false,
      defaultValue: null,
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed tortor elit, bibendum non nibh at, consequat convallis nisi. Ut suscipit ex ante, eget ornare sem congue id.',
      allowedValues: null,
      valuesEditableBy: 'org_actors',
      regex: null,
      sourceType: 'org',
    },
    {
      propertyName: 'required_long_property_name',
      valueType: 'string',
      required: true,
      defaultValue: 'default',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut suscipit ex ante, eget ornare sem congue id. Sed tortor elit, bibendum non nibh at, consequat convallis nisi',
      allowedValues: null,
      valuesEditableBy: 'org_actors',
      regex: null,
      sourceType: 'business',
    },
  ],
  repositories: sampleRepos,
  repositoryCount: sampleRepos.length,
  pageCount: 1,
  permissions: 'all',
}

const meta: Meta<StoryArgs> = {
  title: 'Apps/Custom Properties/OrgCustomPropertiesPage',
  component: OrgCustomPropertiesPage,
  decorators: [
    (Story, {args}) => (
      <Wrapper
        appPayload={{['enabled_features']: args}}
        routePayload={routePayload}
        pathname="/organizations/acme/settings/custom-properties"
        routes={[definitionsRoute]}
      >
        <Routes>
          <Route
            path={definitionsRoute.path}
            element={
              <FlashProvider>
                <Banner className="mb-3" variant="warning" title="Storybook nuance">
                  <Banner.Description>
                    After switching <code>custom_properties_danger_zone</code> a reload may be needed to avoid a weird
                    margin. This cannot happen in production.
                  </Banner.Description>
                </Banner>
                <Story />
              </FlashProvider>
            }
          />
        </Routes>
      </Wrapper>
    ),
  ],
  args: {
    ['custom_properties_danger_zone']: true,
  },
  argTypes: {
    ['custom_properties_danger_zone']: {control: {type: 'boolean'}},
  },
}

export default meta

export const Default = {}

export const LimitReached = {
  parameters: {
    storyWrapper: {
      routePayload: {
        ...routePayload,
        definitions: Array.from({length: 101}, (v, i) => ({
          propertyName: `property-${i}`,
          valueType: 'string',
          required: false,
          defaultValue: null,
          description: null,
          allowedValues: null,
          valuesEditableBy: 'org_actors',
        })),
      },
    },
  },
}

export const OnlyDefinitionsPermission = {
  parameters: {
    storyWrapper: {
      routePayload: {
        ...routePayload,
        permissions: 'definitions',
      },
    },
  },
}

export const OnlyValuesPermission = {
  parameters: {
    storyWrapper: {
      routePayload: {
        ...routePayload,
        permissions: 'values',
      },
    },
  },
}
