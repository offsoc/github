import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {SplashDialogImage, SplashDialogBody} from '../SplashDialog'
import {useTheme} from '@primer/react'

jest.mock('@primer/react', () => {
  const original = jest.requireActual('@primer/react')
  return {
    ...original,
    useTheme: jest.fn(),
  }
})

afterEach(() => {
  jest.clearAllMocks()
})

test('Renders a SplashDialogImage with dark image', () => {
  ;(useTheme as unknown as jest.Mock).mockImplementation(() => ({
    colorScheme: 'dark_dimmed',
  }))
  const lightPath = 'https://github.com/images/modules/growth/member_feature_requests/dark.png'
  const darkPath = 'https://github.com/images/modules/growth/member_feature_requests/light.png'
  render(<SplashDialogImage darkImagePath={darkPath} lightImagePath={lightPath} />)

  const image = screen.getByTestId('splash-dialog-image')
  expect(image).toBeInTheDocument()
  const styles = getComputedStyle(image)
  expect(styles.backgroundImage).toBe(`url(${darkPath})`)
})

test('Renders a SplashDialogBody', () => {
  render(<SplashDialogBody>Hello World!</SplashDialogBody>)

  const body = screen.getByTestId('splash-dialog-body')
  expect(body).toBeInTheDocument()
  expect(body).toHaveTextContent('Hello World!')
})

test('Renders a SplashDialogImage with light image', () => {
  ;(useTheme as unknown as jest.Mock).mockImplementation(() => ({
    colorScheme: 'light',
  }))
  const lightPath = 'https://github.com/images/modules/growth/member_feature_requests/dark.png'
  const darkPath = 'https://github.com/images/modules/growth/member_feature_requests/light.png'
  render(<SplashDialogImage darkImagePath={darkPath} lightImagePath={lightPath} />)

  const image = screen.getByTestId('splash-dialog-image')
  expect(image).toBeInTheDocument()
  const styles = getComputedStyle(image)
  expect(styles.backgroundImage).toBe(`url(${lightPath})`)
})
