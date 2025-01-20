import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {announce} from '@github-ui/aria-live'

import {CopyToClipboardButton} from '../CopyToClipboardButton'

const copyFn = jest.fn()
jest.mock('../copy', () => {
  return {
    copyText: () => copyFn,
  }
})

jest.mock('@github-ui/aria-live', () => ({
  announce: jest.fn(),
}))

describe('CopyToClipboard Button', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Renders the button', () => {
    render(<CopyToClipboardButton ariaLabel="demo copy" textToCopy="hello" />)
    const button = screen.getByLabelText('demo copy', {selector: 'button'})
    expect(button).toBeDefined()
  })

  test('hides tooltip from assistive tech', () => {
    render(<CopyToClipboardButton ariaLabel="demo copy" textToCopy="hello" />)
    const tooltip = screen.queryByRole('tooltip')
    expect(tooltip).toBeNull()
  })

  test('when pressed, the accessible name does not change but visible tooltip text changes', () => {
    render(<CopyToClipboardButton ariaLabel="copy to clipboard" textToCopy="hello" />)
    const button = screen.getByRole('button', {name: 'copy to clipboard'})
    act(() => {
      button.click()
    })
    expect(screen.getByText('Copied!')).toBeDefined()
    expect(button).toHaveAccessibleName('copy to clipboard')
  })

  test('when pressed, announce function should be called', () => {
    render(<CopyToClipboardButton ariaLabel="copy to clipboard" textToCopy="hello" />)
    const button = screen.getByRole('button', {name: 'copy to clipboard'})
    act(() => {
      button.click()
    })
    expect(announce).toHaveBeenCalledWith('Copied!')
    expect(announce).toHaveBeenCalledTimes(1)
  })

  describe('portal tooltip', () => {
    test('hides tooltip from assistive tech', () => {
      render(<CopyToClipboardButton ariaLabel="demo copy" textToCopy="hello" hasPortalTooltip={true} />)
      const tooltip = screen.queryByRole('tooltip')
      expect(tooltip).toBeNull()
    })

    test('when pressed, announce function should be called', () => {
      render(<CopyToClipboardButton ariaLabel="copy to clipboard" textToCopy="hello" hasPortalTooltip={true} />)
      const button = screen.getByRole('button', {name: 'copy to clipboard'})
      act(() => {
        button.click()
      })
      expect(announce).toHaveBeenCalledWith('Copied!')
      expect(announce).toHaveBeenCalledTimes(1)
    })

    test('renders with Primer IconButton by default', () => {
      render(<CopyToClipboardButton ariaLabel="demo copy" textToCopy="hello" hasPortalTooltip={true} />)
      const button = screen.getByRole('button', {name: 'demo copy'})
      expect(button).toHaveAttribute('data-component', 'IconButton')
      expect(button).not.toHaveClass('Button--iconOnly')
    })

    test('renders with plain button + Primer CSS when avoidStyledComponent is true', () => {
      render(
        <CopyToClipboardButton
          ariaLabel="demo copy"
          textToCopy="hello"
          hasPortalTooltip={true}
          avoidStyledComponent={true}
        />,
      )
      const button = screen.getByRole('button', {name: 'demo copy'})
      expect(button).not.toHaveAttribute('data-component', 'IconButton')
      expect(button).toHaveAttribute('class', 'Button Button--iconOnly Button--invisible Button--medium ')
    })

    test('renders with Primer IconButton when sx prop is provided', () => {
      render(
        <CopyToClipboardButton
          ariaLabel="demo copy"
          textToCopy="hello"
          hasPortalTooltip={true}
          avoidStyledComponent={true} // will be ignored because of sx prop
          sx={{color: 'red'}}
        />,
      )
      const button = screen.getByRole('button', {name: 'demo copy'})
      expect(button).toHaveAttribute('data-component', 'IconButton')
      expect(button).not.toHaveClass('Button--iconOnly')
      expect(button).toHaveStyle({color: 'red'})
    })
  })
})
