import type {OrgCustomPropertiesDefinitionsPagePayload} from '@github-ui/custom-properties-types'
import {screen} from '@testing-library/react'

import {sampleRepos} from '../../test-utils/mock-data'
import {renderPropertyDefinitionsComponent} from '../../test-utils/Render'
import {OrgCustomPropertiesPage} from '../OrgCustomPropertiesPage'

let paramsMock = new URLSearchParams()
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  return {
    ...originalModule,
    useSearchParams: jest.fn().mockImplementation(() => {
      return [paramsMock, jest.fn()]
    }),
  }
})

const routePayload: OrgCustomPropertiesDefinitionsPagePayload = {
  definitions: [
    {
      propertyName: 'album',
      valueType: 'string',
      description: null,
      required: false,
      defaultValue: null,
      allowedValues: null,
      valuesEditableBy: 'org_actors',
      regex: null,
      sourceType: 'org',
    },
    {
      propertyName: 'band',
      valueType: 'string',
      description: null,
      required: false,
      defaultValue: null,
      allowedValues: null,
      valuesEditableBy: 'org_actors',
      regex: null,
      sourceType: 'org',
    },
  ],
  repositories: sampleRepos,
  repositoryCount: sampleRepos.length,
  pageCount: 1,
  permissions: 'all',
}

beforeEach(() => {
  paramsMock = new URLSearchParams()
})

describe('CustomPropertiesSchemaPage', () => {
  it('shows definitions limit banner if limit is reached', async () => {
    const payload: OrgCustomPropertiesDefinitionsPagePayload = {
      ...routePayload,
      definitions: new Array(100).fill(null).map((_, index) => ({
        propertyName: `name ${index}`,
        valueType: 'string',
        description: null,
        required: false,
        defaultValue: null,
        allowedValues: null,
        valuesEditableBy: 'org_actors',
        regex: null,
        sourceType: 'org',
      })),
    }

    renderPropertyDefinitionsComponent(<OrgCustomPropertiesPage />, {routePayload: payload})

    screen.getByText('The limit of 100 definitions is reached. You cannot add more.')
    expect(screen.queryByTestId('add-definition-button')).not.toBeInTheDocument()
  })

  it('renders page tabs if user has both permissions', async () => {
    renderPropertyDefinitionsComponent(<OrgCustomPropertiesPage />, {routePayload})

    expect(screen.getByRole('navigation', {name: 'Page selector'})).toBeInTheDocument()
  })

  it('tabs contain correct urls if user has both permissions', async () => {
    renderPropertyDefinitionsComponent(<OrgCustomPropertiesPage />, {routePayload})

    expect(screen.getByText('album')).toBeInTheDocument()
    expect(screen.getByText('band')).toBeInTheDocument()

    expect(screen.queryByTestId('repos-properties-list')).not.toBeInTheDocument()

    expect(screen.getByRole('tab', {name: 'Set values'}).getAttribute('href')).toEqual(
      '/organizations/acme/settings/custom-properties?tab=set-values',
    )
    expect(screen.getByRole('tab', {name: 'Properties (2)'}).getAttribute('href')).toEqual(
      '/organizations/acme/settings/custom-properties?tab=properties',
    )
  })

  it('renders correct initial tab if user has both permissions', async () => {
    paramsMock.set('tab', 'set-values')
    renderPropertyDefinitionsComponent(<OrgCustomPropertiesPage />, {routePayload, search: '?tab=set-values'})

    expect(screen.queryByText('album')).not.toBeInTheDocument()
    expect(screen.queryByText('band')).not.toBeInTheDocument()

    expect(screen.getByTestId('repos-properties-list')).toBeInTheDocument()
  })

  it('renders properties tab if user only has definitions permission', async () => {
    paramsMock.set('tab', 'set-values')
    renderPropertyDefinitionsComponent(<OrgCustomPropertiesPage />, {
      routePayload: {...routePayload, permissions: 'definitions'},
      search: '?tab=set-values',
    })

    expect(screen.queryByRole('navigation', {name: 'Page selector'})).not.toBeInTheDocument()

    expect(screen.getByTestId('repos-definitions-list')).toBeInTheDocument()
  })

  it('renders values tab if user only has values permission', async () => {
    paramsMock.set('tab', 'properties')
    renderPropertyDefinitionsComponent(<OrgCustomPropertiesPage />, {
      routePayload: {...routePayload, permissions: 'values'},
      search: '?tab=properties',
    })

    expect(screen.queryByRole('navigation', {name: 'Page selector'})).not.toBeInTheDocument()

    expect(screen.getByTestId('repos-properties-list')).toBeInTheDocument()
  })
})
