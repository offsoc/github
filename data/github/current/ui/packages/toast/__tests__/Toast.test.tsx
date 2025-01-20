import {render} from '@github-ui/react-core/test-utils'
import {screen, waitFor} from '@testing-library/react'

import {Toast} from '../Toast'

test('Renders the default info toast', async () => {
  render(<Toast message="Bread" />)

  const toast = screen.getByRole('log')
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(toast).toHaveTextContent('Bread')
  expect(toast).not.toHaveClass('Toast--success')
  expect(toast).not.toHaveClass('Toast--error')

  const icon = screen.getByRole('img', {hidden: true})
  expect(icon).toHaveAttribute('focusable', 'false')
  expect(icon).toHaveClass('octicon-info')
})

test('Hides toast after the set timeToLive', async () => {
  render(<Toast timeToLive={1} message="Bread" />)

  const toast = screen.getByRole('log')
  expect(toast).not.toHaveClass('Toast--animateOut')

  await waitFor(() => {
    expect(toast).toHaveClass('Toast--animateOut')
  })
})

test('Renders custom icons', async () => {
  render(<Toast icon="I swear I am a custom icon" message="Bread" />)

  screen.getByText('I swear I am a custom icon')

  const icon = screen.queryByRole('img', {hidden: true})
  expect(icon).toBeNull()
})

describe('Render different types', () => {
  test('success', () => {
    render(<Toast type="success" message="Bread" />)

    const toast = screen.getByRole('log')
    expect(toast).toHaveClass('Toast--success')

    const icon = screen.getByRole('img', {hidden: true})
    expect(icon).toHaveClass('octicon-check')
  })

  test('error', () => {
    render(<Toast type="error" message="Bread" />)

    const toast = screen.getByRole('log')
    expect(toast).toHaveClass('Toast--error')

    const icon = screen.getByRole('img', {hidden: true})
    expect(icon).toHaveClass('octicon-stop')
  })
})

test('Renders status role', async () => {
  render(<Toast role="status" message="Bread" />)

  expect(screen.queryByRole('log')).not.toBeInTheDocument()
  expect(screen.getByRole('status')).toBeInTheDocument()
})
