import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {CreatePrivateNetwork} from '../../routes/CreatePrivateNetwork'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

jest.mock('@github-ui/react-core/use-route-payload')

describe('CreatePrivateNetwork', () => {
  test('hides None and Codespaces options when not available', () => {
    const mockedUseRoutePayload = jest.mocked(useRoutePayload)
    mockedUseRoutePayload.mockReturnValue({enabledForCodespaces: false})

    render(<CreatePrivateNetwork />)
    expect(screen.queryByText('None')).toBeNull()
    expect(screen.queryByText('Codespaces')).toBeNull()
  })

  test('shows None and Codespaces options when available', () => {
    jest.mock('@github-ui/react-core/use-route-payload')
    const mockedUseRoutePayload = jest.mocked(useRoutePayload)
    mockedUseRoutePayload.mockReturnValue({enabledForCodespaces: true})

    render(<CreatePrivateNetwork />)
    expect(screen.getByText('None')).toBeInTheDocument()
    expect(screen.getByText('GitHub Codespaces')).toBeInTheDocument()
  })
})
