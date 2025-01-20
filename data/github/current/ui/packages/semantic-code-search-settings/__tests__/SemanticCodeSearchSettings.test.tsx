import {fireEvent, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {SemanticCodeSearchSettings} from '../routes/SemanticCodeSearchSettings'
import {getSemanticCodeSearchSettingsRoutePayload} from '../test-utils/mock-data'

const mockVerifiedFetchJSON = jest.fn().mockReturnValue(Promise.resolve({ok: true}))

jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetch: (...args: unknown[]) => mockVerifiedFetchJSON(...args),
}))

describe('SemanticCodeSearchSettings', () => {
  test('Renders the SemanticCodeSearchSettings', () => {
    const routePayload = getSemanticCodeSearchSettingsRoutePayload()
    render(<SemanticCodeSearchSettings />, {
      routePayload,
    })
    expect(screen.getByText('Semantic code search')).toBeInTheDocument()
  })

  test('Shows the indexed repos', () => {
    const routePayload = getSemanticCodeSearchSettingsRoutePayload()
    render(<SemanticCodeSearchSettings />, {
      routePayload,
    })
    expect(screen.getByText('repo1')).toBeInTheDocument()
    expect(screen.getByText('repo2')).toBeInTheDocument()
  })

  test('Removes selected repos', () => {
    const routePayload = getSemanticCodeSearchSettingsRoutePayload()
    render(<SemanticCodeSearchSettings />, {
      routePayload,
    })
    // Click the select all checkbox
    fireEvent.click(screen.getAllByRole('checkbox')[0]!)
    fireEvent.click(screen.getByText('Remove indexes'))
    expect(screen.getByText('Remove code search indexes')).toBeInTheDocument()
  })

  test('Shows add repos dialog', async () => {
    const routePayload = getSemanticCodeSearchSettingsRoutePayload()
    render(<SemanticCodeSearchSettings />, {
      routePayload,
    })
    fireEvent.click(screen.getByText('Add repositories'))
    expect(screen.getByText('Pick repositories')).toBeInTheDocument()
  })

  test('Hides add and remove buttons when user cannot index repos', () => {
    const routePayload = getSemanticCodeSearchSettingsRoutePayload()
    routePayload.canIndexRepos = false
    render(<SemanticCodeSearchSettings />, {
      routePayload,
    })
    expect(screen.queryByText('Add repositories')).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })
})
