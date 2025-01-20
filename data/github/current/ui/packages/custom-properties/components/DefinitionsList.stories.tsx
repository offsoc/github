import type {PropertyDefinitionWithSourceType} from '@github-ui/custom-properties-types'
import {Wrapper} from '@github-ui/react-core/test-utils'
import type {Meta} from '@storybook/react'
import type {ComponentProps} from 'react'
import {Route, Routes} from 'react-router-dom'

import {CurrentOrgRepoProvider} from '../contexts/CurrentOrgRepoContext'
import {definitionsRoute} from '../custom-properties'
import {sampleStorybookDefinitions} from '../test-utils/mock-data'
import {DefinitionsList} from './DefinitionsPage'

const meta: Meta = {
  title: 'Apps/Custom Properties/Components/DefinitionsList',
  decorators: [
    Story => {
      return (
        <Wrapper pathname="/organizations/github/settings/custom-properties" routes={[definitionsRoute]}>
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
}

export default meta

const bizProps: PropertyDefinitionWithSourceType[] = [
  {
    propertyName: 'global_id',
    valueType: 'string',
    sourceType: 'business',
    valuesEditableBy: 'org_and_repo_actors',
    description: 'Repo id in the internal business index',
    required: false,
    defaultValue: null,
    allowedValues: null,
    regex: null,
  },
]

const definitions: PropertyDefinitionWithSourceType[] = [
  ...(sampleStorybookDefinitions as PropertyDefinitionWithSourceType[]),
  ...bizProps,
]

const sampleProps: ComponentProps<typeof DefinitionsList> = {
  definitions,
  business: {
    name: 'GitHub',
    slug: 'github',
  },
}

export const Default = () => <DefinitionsList {...sampleProps} />

export const NoResults = () => <DefinitionsList {...sampleProps} definitions={[]} />
