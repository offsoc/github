import type {
  CustomPropertyDetailsPagePayload,
  PropertyDefinitionWithSourceType,
} from '@github-ui/custom-properties-types'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {Flash} from '@primer/react'
import type {Meta} from '@storybook/react'
import {Route, Routes} from 'react-router-dom'

import {editBusinessPropertyDefinitionRoute, editDefinitionRoute} from '../custom-properties'
import {CustomPropertyDetailsPage} from './CustomPropertyDetailsPage'

interface StoryArgs {
  ['custom_properties_regex']: boolean
  ['custom_properties_danger_zone']: boolean
}

const envDefinition: PropertyDefinitionWithSourceType = {
  propertyName: 'environment',
  valueType: 'single_select',
  required: false,
  defaultValue: null,
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed tortor elit, bibendum non nibh at, consequat convallis nisi. Ut suscipit ex ante, eget ornare sem congue id.',
  allowedValues: ['prod', 'env'],
  valuesEditableBy: 'org_actors',
  regex: null,
  sourceType: 'org',
}

const baseRoutePayload = {
  propertyNames: [envDefinition.propertyName, 'framework'],
  business: {name: 'ACME Inc.', slug: 'acme'},
}

const editSingleSelectDefinitionPayload: CustomPropertyDetailsPagePayload = {
  definition: envDefinition,
  ...baseRoutePayload,
}

const sampleRoutes = {
  orgSettings: {
    pathname: '/organizations/acme/settings/custom-property/environment',
    route: editDefinitionRoute,
  },
  enterpriseSettings: {
    pathname: '/enterprises/acme/settings/custom-property/environment',
    route: editBusinessPropertyDefinitionRoute,
  },
}

const meta: Meta<StoryArgs> = {
  title: 'Apps/Custom Properties/CustomPropertyDetailsPage',
  decorators: [
    (Story, {args, parameters}) => (
      <Wrapper
        appPayload={{['enabled_features']: args}}
        pathname={parameters.pathname}
        routes={[parameters.route]}
        routePayload={parameters.routePayload}
      >
        <Routes>
          <Route path={parameters.route.path} element={<Story />} />
        </Routes>
      </Wrapper>
    ),
  ],
  args: {
    ['custom_properties_regex']: true,
    ['custom_properties_danger_zone']: true,
  },
  argTypes: {
    ['custom_properties_regex']: {control: {type: 'boolean'}},
    ['custom_properties_danger_zone']: {control: {type: 'boolean'}},
  },
  parameters: {
    routePayload: baseRoutePayload,
  },
}

export default meta

// This override is required to mock the regex pattern check.
global.fetch = async (url, init) => {
  if (url.toString().includes('repos/validate_regex/pattern')) {
    const pattern = JSON.parse(init?.body as string).pattern?.toString()
    return new Response(JSON.stringify({valid: pattern !== '[]invalid'}))
  }

  return new Response()
}

export const Create = () => {
  return (
    <>
      <InstructionsBanner />
      <CustomPropertyDetailsPage />
    </>
  )
}

Create.parameters = {
  ...sampleRoutes.orgSettings,
}

export const SingleSelect = () => {
  return <CustomPropertyDetailsPage />
}

SingleSelect.parameters = {
  routePayload: editSingleSelectDefinitionPayload,
  ...sampleRoutes.orgSettings,
}

export const SingleSelect200Options = () => {
  return <CustomPropertyDetailsPage />
}

SingleSelect200Options.parameters = {
  routePayload: {
    ...editSingleSelectDefinitionPayload,
    definition: {
      ...envDefinition,
      propertyName: 'hundreds',
      allowedValues: Array.from({length: 200}, (_, i) => `Option ${i + 1}`),
      defaultValue: ['Option 1', 'Option 10', 'Option 100'],
    },
  },
  ...sampleRoutes.orgSettings,
}

export const String = () => {
  return <CustomPropertyDetailsPage />
}

String.parameters = {
  routePayload: {
    propertyNames: [envDefinition.propertyName, 'framework'],
    definition: {
      propertyName: 'first-responder',
      description: 'Handle of the weekly first responder, prefixed with `@`',
      valueType: 'string',
      required: true,
      defaultValue: '@hubot',
      allowedValues: null,
      valuesEditableBy: 'org_actors',
      regex: '^[0-9]+$',
      sourceType: 'org',
    },
  },
  ...sampleRoutes.orgSettings,
}

export const ViewBizPropFromOrg = () => {
  return <CustomPropertyDetailsPage />
}

ViewBizPropFromOrg.parameters = {
  routePayload: {
    ...editSingleSelectDefinitionPayload,
    definition: {
      ...envDefinition,
      sourceType: 'business',
    },
  },
  ...sampleRoutes.orgSettings,
}

export const ViewBizPropFromBiz = () => {
  return <CustomPropertyDetailsPage />
}

ViewBizPropFromBiz.parameters = {
  routePayload: {
    ...editSingleSelectDefinitionPayload,
    definition: {
      ...envDefinition,
      sourceType: 'business',
    },
  },
  ...sampleRoutes.enterpriseSettings,
}

const InstructionsBanner = () => (
  <Flash>
    <h4>Story instructions</h4>
    <ul>
      <li>
        Try <code>framework</code> for an existing property name
      </li>
      <li>
        Try <code>[]invalid</code> for an invalid regex pattern
      </li>
    </ul>
  </Flash>
)
