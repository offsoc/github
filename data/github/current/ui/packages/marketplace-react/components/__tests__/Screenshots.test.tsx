import {render, screen, fireEvent} from '@testing-library/react'
import {ThemeProvider} from '@primer/react'
import Screenshots from '../Screenshots'
import type {Screenshot} from '../../types'

jest.mock('@github-ui/use-navigate')

beforeEach(() => {
  const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
  useSearchParams.mockImplementation(() => [new URLSearchParams(), jest.fn()])
})

const renderComponent = () => {
  const screenshots: Screenshot[] = [
    {
      id: 1,
      src: 'example.com/screenshot1.png',
      alt_text: 'Screenshot 1',
    },
    {
      id: 2,
      src: 'example.com/screenshot2.png',
      alt_text: 'Screenshot 2',
    },
  ]

  render(
    <ThemeProvider>
      <Screenshots screenshots={screenshots} />
    </ThemeProvider>,
  )
}

describe('Screenshots', () => {
  test('renders interactive screenshot carousel', () => {
    renderComponent()

    const screenshot1 = screen.getByTestId('screenshot-1')
    const screenshot2 = screen.getByTestId('screenshot-2')
    const screenshot1Container = screen.getByTestId('screenshot-container-1')
    const screenshot2Container = screen.getByTestId('screenshot-container-2')
    const screenshot1Thumbnail = screen.getByTestId('screenshot-thumbnail-1')
    const screenshot2Thumbnail = screen.getByTestId('screenshot-thumbnail-2')

    expect(screenshot1).toHaveAttribute('src', 'example.com/screenshot1.png')
    expect(screenshot1).toHaveAttribute('alt', 'Screenshot 1')
    expect(screenshot2).toHaveAttribute('src', 'example.com/screenshot2.png')
    expect(screenshot2).toHaveAttribute('alt', 'Screenshot 2')
    expect(screenshot1Container).not.toHaveAttribute('hidden')
    expect(screenshot2Container).toHaveAttribute('hidden')
    expect(screenshot1Thumbnail).toHaveAttribute('aria-selected', 'true')
    expect(screenshot2Thumbnail).toHaveAttribute('aria-selected', 'false')

    // Test that the carousel is interactive with the mouse
    fireEvent.click(screenshot2Thumbnail) // Switch to the second screenshot
    expect(screenshot1Container).toHaveAttribute('hidden')
    expect(screenshot2Container).not.toHaveAttribute('hidden')
    expect(screenshot1Thumbnail).toHaveAttribute('aria-selected', 'false')
    expect(screenshot2Thumbnail).toHaveAttribute('aria-selected', 'true')

    // Test that the carousel is interactive with the keyboard
    fireEvent.keyDown(screenshot1Thumbnail, {key: 'Enter', code: 'Enter'}) // Switch back to the first screenshot
    expect(screenshot1Container).not.toHaveAttribute('hidden')
    expect(screenshot2Container).toHaveAttribute('hidden')
    expect(screenshot1Thumbnail).toHaveAttribute('aria-selected', 'true')
    expect(screenshot2Thumbnail).toHaveAttribute('aria-selected', 'false')
  })
})
