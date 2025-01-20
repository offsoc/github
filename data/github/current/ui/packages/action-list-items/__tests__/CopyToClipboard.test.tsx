import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {ActionListItemCopyToClipboard} from '../src/CopyToClipboard'

it('renders the ActionListItemCopyToClipboard', () => {
  const label = 'Copy link'
  render(<ActionListItemCopyToClipboard textToCopy="https://github.com">{label}</ActionListItemCopyToClipboard>)

  expect(screen.getByRole('listitem')).toHaveTextContent(label)

  const icon = screen.getByRole('img', {hidden: true})
  expect(icon).toBeVisible()
  expect(icon.classList.contains('octicon-copy')).toBe(true)
})

it('can pass additional props to ActionList.Item', () => {
  render(
    <ActionListItemCopyToClipboard textToCopy="https://github.com" role="menuitem" disabled>
      Copy link
    </ActionListItemCopyToClipboard>,
  )
  const label = screen.getByRole('menuitem')
  expect(label).toBeVisible()
  expect(label).toHaveAttribute('aria-disabled', 'true')
})

it('copies the link when clicked', async () => {
  const {user} = render(
    <ActionListItemCopyToClipboard textToCopy="https://github.com">Copy link</ActionListItemCopyToClipboard>,
  )
  const label = screen.getByRole('listitem')
  await user.click(label)
  await expect(navigator.clipboard.readText()).resolves.toEqual('https://github.com')
})
