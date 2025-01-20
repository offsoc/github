import type {CheckPropertyUsagesResponse} from '@github-ui/custom-properties-types'
import {expectMockFetchCalledTimes, mockFetch} from '@github-ui/mock-fetch'
import {act, screen, waitFor} from '@testing-library/react'

import {renderPropertyDefinitionsComponent} from '../../test-utils/Render'
import {DeleteDefinitionDialog} from '../DeleteDefinitionDialog'

const sampleProps: React.ComponentProps<typeof DeleteDefinitionDialog> = {
  definition: {
    propertyName: 'environment',
    valueType: 'string',
    required: false,
    defaultValue: null,
    description: null,
    allowedValues: null,
    valuesEditableBy: 'org_actors',
    regex: null,
  },
  onCancel: jest.fn(),
  onDismiss: jest.fn(),
}

const noUsagesResponse: CheckPropertyUsagesResponse = {
  repositoriesCount: 0,
  propertyConsumerUsages: [],
}

const repoUsageResponse: CheckPropertyUsagesResponse = {
  ...noUsagesResponse,
  repositoriesCount: 33,
}

const consumerUsagesResponse: CheckPropertyUsagesResponse = {
  ...noUsagesResponse,
  propertyConsumerUsages: [
    {value: 'prod', consumerType: 'ruleset'},
    {value: 'dev', consumerType: 'ruleset'},
  ],
}

const navigateFn = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  return {
    useNavigate: () => navigateFn,
  }
})

beforeEach(navigateFn.mockClear)

describe('DeleteDefinitionDialog', () => {
  it('deletes definition', async () => {
    const {user} = renderPropertyDefinitionsComponent(<DeleteDefinitionDialog {...sampleProps} />)

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})
    mockFetch.mockRouteOnce(/settings\/custom-properties\/environment/)

    await act(() => mockFetch.resolvePendingRequest(/custom-properties-usage/, repoUsageResponse))

    await user.click(screen.getByText('Delete'))

    expectMockFetchCalledTimes('/sessions/in_sudo', 1)
    expectMockFetchCalledTimes(/custom-properties-usage/, 1)
    await waitFor(() => expectMockFetchCalledTimes(/settings\/custom-property\/environment/, 1))
  })

  it('shows flash banner if request fails', async () => {
    const {user} = renderPropertyDefinitionsComponent(<DeleteDefinitionDialog {...sampleProps} />)

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})
    const routeMock = mockFetch.mockRouteOnce(/settings\/custom-property\/environment/, undefined, {
      ok: false,
    })

    await act(() => mockFetch.resolvePendingRequest(/custom-properties-usage/, repoUsageResponse))

    await user.click(screen.getByText('Delete'))

    await waitFor(() => expect(routeMock).toHaveBeenCalled())
    await screen.findByTestId('server-error-banner')
    expect(navigateFn).not.toHaveBeenCalled()
  })

  it('prevents multiple submissions while the request is in flight', async () => {
    const {user} = renderPropertyDefinitionsComponent(<DeleteDefinitionDialog {...sampleProps} />)

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})
    mockFetch.mockRoute(/settings\/custom-property\/environment/)

    await act(() => mockFetch.resolvePendingRequest(/custom-properties-usage/, repoUsageResponse))

    await user.click(screen.getByText('Delete'))
    await user.click(screen.getByText('Deleting...'))

    await waitFor(() => expect(navigateFn).toHaveBeenCalled())
    expectMockFetchCalledTimes(/settings\/custom-property\/environment/, 1)
  })

  it('prevents deleting until usages are fetched', async () => {
    const {user} = renderPropertyDefinitionsComponent(<DeleteDefinitionDialog {...sampleProps} />)

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})

    const routeMock = mockFetch.mockRouteOnce(/settings\/custom-property\/environment/)

    expect(screen.queryByText('Delete')).not.toBeInTheDocument()

    await act(() => mockFetch.resolvePendingRequest(/custom-properties-usage/, repoUsageResponse))

    await user.click(screen.getByText('Delete'))

    await waitFor(() => expect(routeMock).toHaveBeenCalled())
    await waitFor(() => expect(navigateFn).toHaveBeenCalled())
  })

  it('show usages of property in repos', async () => {
    renderPropertyDefinitionsComponent(<DeleteDefinitionDialog {...sampleProps} />)
    expect(screen.getByText('Checking usages...')).toBeInTheDocument()

    await act(() => mockFetch.resolvePendingRequest(/custom-properties-usage/, repoUsageResponse))

    expect(screen.getByTestId('usage-banner').textContent).toBe(
      'The environment property is referenced by 33 repositories.',
    )
  })

  it('hides delete button if there are consumer property usages', async () => {
    renderPropertyDefinitionsComponent(<DeleteDefinitionDialog {...sampleProps} />)
    expect(screen.getByText('Checking usages...')).toBeInTheDocument()

    await act(() => mockFetch.resolvePendingRequest(/custom-properties-usage/, consumerUsagesResponse))

    expect(screen.getByTestId('usage-banner').textContent).toBe(
      'The environment property is referenced in 2 rulesets and cannot be deleted.',
    )

    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })

  it('show no usages of property if unused', async () => {
    renderPropertyDefinitionsComponent(<DeleteDefinitionDialog {...sampleProps} />)

    await act(() => mockFetch.resolvePendingRequest(/custom-properties-usage/, noUsagesResponse))

    expect(screen.getByTestId('usage-banner').textContent).toBe('No usages of the environment property found.')
  })
})
