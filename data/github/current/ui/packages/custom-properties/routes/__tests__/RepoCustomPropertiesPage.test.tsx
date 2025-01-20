import type {PropertyDefinition, RepoPropertiesPagePayload} from '@github-ui/custom-properties-types'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {renderRepoCustomPropertiesComponent} from '../../test-utils/Render'
import {RepoCustomPropertiesPage} from '../RepoCustomPropertiesPage'

describe('RepoCustomPropertiesPage', () => {
  const routePayload: RepoPropertiesPagePayload = {
    definitions: [{propertyName: 'env'}, {propertyName: 'team', defaultValue: 'sales'}] as PropertyDefinition[],
    values: {env: 'prod'},
    canEditProperties: false,
  }

  it('shows only properties with a value', () => {
    render(<RepoCustomPropertiesPage />, {routePayload})

    expect(screen.getByText('env')).toBeInTheDocument()
    expect(screen.queryByText('team')).not.toBeInTheDocument()

    expect(screen.queryByRole('link', {name: /Edit properties/})).not.toBeInTheDocument()
  })

  it('shows link to the edit page if use can edit properties', () => {
    renderRepoCustomPropertiesComponent(<RepoCustomPropertiesPage />, {
      routePayload: {...routePayload, canEditProperties: true},
    })

    const link = screen.getByRole<HTMLAnchorElement>('link', {name: /Edit properties/})
    expect(link).toBeInTheDocument()
    expect(link.href).toContain('/acme/smile/settings/custom-properties')
  })
})
