import type {OrgCustomPropertiesDefinitionsPagePayload} from '@github-ui/custom-properties-types'
import {screen, within} from '@testing-library/react'

import {sampleRepos} from '../../test-utils/mock-data'
import {
  renderPropertyDefinitionsComponent,
  renderPropertyDefinitionsComponentAtEnterpriseLevel,
} from '../../test-utils/Render'
import {DefinitionsPage} from '../DefinitionsPage'

// Mock the following properties to avoid focus errors for ListView
beforeAll(() => {
  Object.defineProperties(HTMLElement.prototype, {
    offsetHeight: {get: () => 42},
    offsetWidth: {get: () => 42},
    getClientRects: {get: () => () => [42]},
    offsetParent: {get: () => true},
  })
})

const routePayload: OrgCustomPropertiesDefinitionsPagePayload = {
  definitions: [
    {
      propertyName: 'definitionA',
      valueType: 'single_select',
      description: null,
      allowedValues: ['red', 'green', 'blue'],
      required: false,
      defaultValue: null,
      valuesEditableBy: 'org_actors',
      regex: null,
      sourceType: 'org',
    },
    {
      propertyName: 'definitionB',
      valueType: 'string',
      required: true,
      defaultValue: 'default',
      description: null,
      allowedValues: null,
      valuesEditableBy: 'org_actors',
      regex: null,
      sourceType: 'business',
    },
  ],
  permissions: 'all',
  pageCount: 1,
  repositoryCount: 33,
  repositories: sampleRepos,
  business: {
    name: 'GitHub',
    slug: 'github',
  },
}

describe('DefinitionsPage', () => {
  it('renders correctly', () => {
    renderPropertyDefinitionsComponent(<DefinitionsPage />, {
      routePayload,
    })

    const listItems = within(screen.getByTestId('list-view-items')).getAllByRole('listitem')

    expect(listItems[0]?.textContent).toContain('definitionA')
    expect(listItems[0]?.textContent).toContain('Single select')

    expect(listItems[1]?.textContent).toContain('definitionB')
    expect(listItems[1]?.textContent).toContain('Text')
  })

  it('renders empty state', () => {
    renderPropertyDefinitionsComponent(<DefinitionsPage />, {
      routePayload: {
        definitions: [],
        permissions: 'all',
      },
    })

    expect(screen.getByText('No properties have been added')).toBeInTheDocument()
  })

  it('renders managed by badge for enterprise properties at the org level', () => {
    renderPropertyDefinitionsComponent(<DefinitionsPage />, {
      routePayload,
    })

    expect(screen.getByTestId('definitionB-managed-by-label')).toHaveTextContent('Managed by GitHub')
    expect(screen.queryByTestId('definitionA-managed-by-label')).not.toBeInTheDocument()
  })

  it('does not render managed by labels for enterprise level', () => {
    renderPropertyDefinitionsComponentAtEnterpriseLevel(<DefinitionsPage />, {
      routePayload,
    })

    expect(screen.queryByTestId('definitionA-managed-by-label')).not.toBeInTheDocument()
    expect(screen.queryByTestId('definitionB-managed-by-label')).not.toBeInTheDocument()
  })
})
