import type {Repository} from '@github-ui/custom-properties-types'
import {Wrapper} from '@github-ui/react-core/test-utils'
import type {Meta} from '@storybook/react'
import type {ComponentProps} from 'react'
import {Route, Routes} from 'react-router-dom'

import {CurrentOrgRepoProvider} from '../contexts/CurrentOrgRepoContext'
import {definitionsRoute} from '../custom-properties'
import {sampleStorybookDefinitions} from '../test-utils/mock-data'
import {PropertiesEditingPage} from './PropertiesEditingPage'

interface StoryArgs {
  ['custom_properties_edit_modal']: boolean
  ['boolean_property_value_toggle']: boolean
}

const meta: Meta<StoryArgs> = {
  title: 'Apps/Custom Properties/Components/PropertiesEditingPage',
  decorators: [
    (Story, {args}) => {
      return (
        <Wrapper
          pathname="/organizations/github/settings/custom-properties"
          routes={[definitionsRoute]}
          appPayload={{['enabled_features']: args}}
        >
          <Routes>
            <Route
              path={definitionsRoute.path}
              element={
                <CurrentOrgRepoProvider>
                  <Story />
                </CurrentOrgRepoProvider>
              }
            />
          </Routes>
        </Wrapper>
      )
    },
  ],
  args: {
    ['custom_properties_edit_modal']: true,
    ['boolean_property_value_toggle']: true,
  },
  argTypes: {
    ['custom_properties_edit_modal']: {control: {type: 'boolean'}},
  },
}

export default meta

const repo: Repository = {
  id: 3,
  name: 'public-server',
  description:
    "Let's just say my master will always do what needs to be done. I'm not even sure how peacetime will agree with him.",
  visibility: 'public',
  properties: {
    team: 'sales',
    ['cost_center']: 'us_east',
    env: 'test',
    framework: 'rails',
  },
}

const editableProperties = sampleStorybookDefinitions.map(d => d.propertyName)

const sampleProps: ComponentProps<typeof PropertiesEditingPage> = {
  definitions: sampleStorybookDefinitions,
  editableProperties,
  editingRepos: [repo],
  onClose: () => undefined,
  onSuccess: () => undefined,
  renderPageHeader: () => <h3>Custom properties</h3>,
}

export const SingleRepo = () => {
  return <PropertiesEditingPage {...sampleProps} />
}

export const MultipleRepos = () => {
  return (
    <PropertiesEditingPage
      {...sampleProps}
      editingRepos={[
        repo,
        {
          ...repo,
          id: 4,
          properties: {
            team: 'marketing',
            ['cost_center']: 'us_east',
            env: 'prod',
            framework: 'rails',
          },
        },
      ]}
    />
  )
}

export const ReadOnlyProperties = () => {
  return <PropertiesEditingPage {...sampleProps} editableProperties={['team', 'env']} />
}
