import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import BlankSlate from '../components/BlankSlate'
import App from '../App'
import {defaultAppContext} from '../test-utils/mock-data'

describe('BlankSlate', () => {
  it('renders the header, message, link, and button correctly', () => {
    const header = 'Test Header'
    const message = 'Test Message'
    const url = '/test-link'
    const linkText = 'Test Link'
    const displayButton = true

    render(
      <App>
        <BlankSlate header={header} message={message} url={url} linkText={linkText} displayButton={displayButton} />
      </App>,
      {routePayload: defaultAppContext()},
    )

    expect(screen.getByText(header)).toBeInTheDocument()
    expect(screen.getByText(/Test Message/)).toBeInTheDocument()
    expect(screen.getByText(linkText)).toHaveAttribute('href', url)
    expect(screen.getByTestId('new-configuration')).toBeInTheDocument()
  })

  it('does not render the button when displayButton is false', () => {
    const header = 'Test Header'
    const message = 'Test Message'
    const url = '/test-link'
    const linkText = 'Test Link'
    const displayButton = false

    render(
      <App>
        <BlankSlate header={header} message={message} url={url} linkText={linkText} displayButton={displayButton} />
      </App>,
      {routePayload: defaultAppContext()},
    )

    expect(screen.queryByTestId('new-configuration')).not.toBeInTheDocument()
  })
})
