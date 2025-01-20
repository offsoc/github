import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import Banner from '../components/Banner'
import App from '../App'
import {defaultAppContext} from '../test-utils/mock-data'

describe('Banner', () => {
  test('renders banner text', () => {
    const bannerText = 'This is a sample banner'
    render(<Banner bannerText={bannerText} />)
    expect(screen.getByTestId('banner-text')).toHaveTextContent(bannerText)
    expect(screen.queryByTestId('banner-link')).not.toBeInTheDocument()
    expect(screen.queryByTestId('banner-dismiss-button')).not.toBeInTheDocument()
  })

  test('renders link when linkText and linkHref are provided', () => {
    const linkText = 'Learn more'
    const linkHref = '/test-link'

    render(
      <App>
        <Banner bannerText="Sample banner" linkText={linkText} linkHref={linkHref} />
      </App>,
      {routePayload: defaultAppContext()},
    )
    const linkElement = screen.getByText(linkText)
    expect(linkElement).toBeInTheDocument()
    expect(linkElement).toHaveAttribute('href', linkHref)
    expect(screen.getByTestId('banner-link')).toBeInTheDocument()
    expect(screen.queryByTestId('banner-dismiss-button')).not.toBeInTheDocument()
  })

  test('calls onDismiss when dismiss button is clicked', async () => {
    const onDismiss = jest.fn()
    const {user} = render(<Banner bannerText="Sample banner" dismissible={true} onDismiss={onDismiss} />)
    const dismissButton = screen.getByTestId('banner-dismiss-button')
    await user.click(dismissButton)
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('banner-link')).not.toBeInTheDocument()
  })
})
