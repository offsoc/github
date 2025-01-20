import {renderHook, screen, fireEvent, render} from '@testing-library/react'
import {useLinkInterception} from '../use-link-interception'

test('Renders the useLinkInterception hook', () => {
  // Create a mock function
  const onLinkClick = jest.fn()

  // eslint-disable-next-line jsx-a11y/anchor-is-valid
  render(<a href="#">Test Link</a>)
  const link = screen.getByText('Test Link')

  renderHook(() => useLinkInterception({htmlContainer: link, onLinkClick, openLinksInNewTab: false}))

  fireEvent.click(link)

  expect(onLinkClick).toHaveBeenCalled()
})
