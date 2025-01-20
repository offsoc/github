import type {PropertyDefinition, RepoSettingsPropertiesPagePayload} from '@github-ui/custom-properties-types'
import {expectMockFetchCalledWith, mockFetch} from '@github-ui/mock-fetch'
import {screen, waitFor, within} from '@testing-library/react'

import {renderRepoSettingsCustomPropertiesComponent} from '../../test-utils/Render'
import {RepoSettingsCustomPropertiesPage} from '../RepoSettingsCustomPropertiesPage'

// This is necessary to mock because of the soft navigation in the dialog.
window.performance.clearResourceTimings = jest.fn()
window.performance.mark = jest.fn()

describe('RepoSettingsCustomPropertiesPage', () => {
  const routePayload: RepoSettingsPropertiesPagePayload = {
    definitions: [
      {propertyName: 'env', defaultValue: 'test', valueType: 'string'},
      {propertyName: 'team', defaultValue: 'sales', valueType: 'string'},
      {propertyName: 'editable_prop', valueType: 'string'},
      {propertyName: 'platform', valueType: 'multi_select'},
    ] as PropertyDefinition[],
    currentRepo: {
      id: 1,
      name: 'github',
      description: null,
      visibility: 'public',
      properties: {env: 'prod', platform: ['ios', 'web']},
    },
    editableProperties: ['editable_prop'],
  }

  it('shows all properties and effective values', () => {
    renderRepoSettingsCustomPropertiesComponent(<RepoSettingsCustomPropertiesPage />, {routePayload})

    expect(screen.getByText('env')).toBeInTheDocument()
    expect(screen.getByText('prod')).toBeInTheDocument()

    expect(screen.getByText('team')).toBeInTheDocument()
    expect(screen.getByText('sales')).toBeInTheDocument()

    expect(screen.getByText('editable_prop')).toBeInTheDocument()

    expect(screen.getByText('platform')).toBeInTheDocument()
    expect(screen.getByText('ios')).toBeInTheDocument()
    expect(screen.getByText('web')).toBeInTheDocument()
  })

  it('shows editable fields if user can edit', async () => {
    renderRepoSettingsCustomPropertiesComponent(<RepoSettingsCustomPropertiesPage />, {routePayload})

    const editingForm = screen.getByTestId('properties-editing-page')
    expect(editingForm).toBeInTheDocument()
    expect(within(editingForm).queryAllByTestId('readonly-property-name')).toHaveLength(0)
    expect(within(editingForm).getAllByTestId('property-name')).toHaveLength(routePayload.definitions.length)
  })

  it('hides edit button if there are no properties user can edit', () => {
    const payload: RepoSettingsPropertiesPagePayload = {...routePayload, definitions: []}
    renderRepoSettingsCustomPropertiesComponent(<RepoSettingsCustomPropertiesPage />, {routePayload: payload})

    const editingForm = screen.getByTestId('properties-editing-page')
    expect(editingForm).toBeInTheDocument()
    expect(within(editingForm).queryAllByTestId('property-name')).toHaveLength(0)
  })

  it('shows success flash', async () => {
    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})
    mockFetch.mockRouteOnce(/\/settings\/custom-properties\/values/)

    const {user} = renderRepoSettingsCustomPropertiesComponent(<RepoSettingsCustomPropertiesPage />, {routePayload})

    await user.type(screen.getByLabelText('editable_prop'), 'my_value')
    await user.click(screen.getByRole('button', {name: 'Save'}))

    await waitFor(() => {
      expectMockFetchCalledWith(
        /\/settings\/custom-properties\/values/,
        {
          repoIds: [routePayload.currentRepo.id],
          properties: {['editable_prop']: 'my_value'},
        },
        'equal',
      )
    })
    await screen.findByText('Properties updated successfully.')
  })
})
