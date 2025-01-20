import type {CustomPropertyDetailsPagePayload} from '@github-ui/custom-properties-types'
import {mockFetch} from '@github-ui/mock-fetch'
import {AppPayloadContext} from '@github-ui/react-core/use-app-payload'
import {screen, waitFor, within} from '@testing-library/react'

import {renderPropertyDefinitionsComponent} from '../../test-utils/Render'
import {CustomPropertyDetailsPage} from '../CustomPropertyDetailsPage'

const navigateFn = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  return {
    useNavigate: () => navigateFn,
  }
})

beforeEach(navigateFn.mockClear)

const routePayload: CustomPropertyDetailsPagePayload = {
  definition: {
    propertyName: 'env',
    valueType: 'string',
    required: false,
    defaultValue: null,
    description: null,
    allowedValues: null,
    valuesEditableBy: 'org_actors',
    regex: null,
    sourceType: 'org',
  },
  propertyNames: [],
}

describe('CustomPropertyDetailsPage', () => {
  it('renders correctly', async () => {
    renderPropertyDefinitionsComponent(<CustomPropertyDetailsPage />, {routePayload})

    expect(screen.getByTestId('settings-page-content')).toBeInTheDocument()
  })

  it('renders the danger zone and the delete dialog', async () => {
    const {user} = renderPropertyDefinitionsComponent(
      <AppPayloadContext.Provider value={{['enabled_features']: {['custom_properties_danger_zone']: true}}}>
        <CustomPropertyDetailsPage />
      </AppPayloadContext.Provider>,
      {routePayload},
    )

    expect(screen.getByRole('heading', {name: 'Additional options'})).toBeInTheDocument()
    expect(screen.getByRole('heading', {name: 'Delete property'})).toBeInTheDocument()
    const deleteButton = screen.getByRole('button', {name: 'Delete property'})
    await user.click(deleteButton)

    const closeDialog = within(screen.getByRole('dialog')).getByLabelText('Close')
    expect(closeDialog).toHaveFocus()
    await user.click(closeDialog)

    expect(deleteButton).toHaveFocus()
  })

  it('shows validation error on save if allowed values are empty and focuses the field', async () => {
    const {user} = renderPropertyDefinitionsComponent(<CustomPropertyDetailsPage />, {
      routePayload: {...routePayload, definition: undefined},
    })
    await user.type(screen.getByLabelText('Name *'), 'env')

    await user.click(screen.getByRole('button', {name: 'Type: Text'}))
    await user.click(screen.getByText('Single select'))

    await user.click(screen.getByText('Save property'))
    await screen.findByText('Property must have at least one option')

    expect(screen.getByLabelText('Options')).toHaveFocus()
  })

  it('shows generic flash banner if request fails with no error property', async () => {
    const {user} = renderPropertyDefinitionsComponent(<CustomPropertyDetailsPage />, {routePayload})

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})
    const routeMock = mockFetch.mockRouteOnce('/organizations/acme/settings/custom-properties', undefined, {
      ok: false,
    })

    await user.type(screen.getByLabelText('Name *'), 'environment')
    await user.click(screen.getByText('Save property'))

    await waitFor(() => expect(routeMock).toHaveBeenCalled())

    const serverErrorBanner = await screen.findByTestId('server-error-banner')
    expect(within(serverErrorBanner).getByText('Something went wrong.')).toBeInTheDocument()
    expect(navigateFn).not.toHaveBeenCalled()
  })

  it('shows error message from server', async () => {
    const {user} = renderPropertyDefinitionsComponent(<CustomPropertyDetailsPage />, {routePayload})

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})
    const routeMock = mockFetch.mockRouteOnce(
      '/organizations/acme/settings/custom-properties',
      {
        error: 'Could not save properties because reasons',
      },
      {
        ok: false,
      },
    )

    await user.type(screen.getByLabelText('Name *'), 'environment')
    await user.click(screen.getByText('Save property'))

    await waitFor(() => expect(routeMock).toHaveBeenCalled())

    const serverErrorBanner = await screen.findByTestId('server-error-banner')
    expect(within(serverErrorBanner).getByText('Could not save properties because reasons')).toBeInTheDocument()
    expect(navigateFn).not.toHaveBeenCalled()
  })
})
