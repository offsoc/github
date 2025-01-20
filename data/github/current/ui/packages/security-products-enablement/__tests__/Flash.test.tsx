import Flash from '../components/Flash'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {useLocation} from 'react-router-dom'

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  return {
    ...originalModule,
    useLocation: jest.fn(),
  }
})
const mockLocationState = (stateData: object) => {
  jest.mocked(useLocation).mockReturnValue({state: stateData, key: '', pathname: '', search: '', hash: ''})
}

describe('ReplyOcticon', () => {
  it('does not render without props or location state', async () => {
    render(<Flash />)

    // Use queryByTestId so we don't fail when the element isn't found:
    const element = screen.queryByTestId('flash')
    expect(element).not.toBeInTheDocument()
  })

  it('renders when passed props', async () => {
    render(<Flash message="Hello, World!" />)

    const element = screen.getByTestId('flash')
    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent('Hello, World!')
  })

  it('renders when location state flash is set', () => {
    mockLocationState({
      flash: {
        message: 'Hello from another page!',
        variant: 'success',
      },
    })

    render(<Flash />)
    const element = screen.getByTestId('flash')
    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent('Hello from another page!')
  })
})
