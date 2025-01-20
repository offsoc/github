import {mockFetch} from '@github-ui/mock-fetch'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {AlphaBadgeAndActions} from '../AlphaBadgeAndActions'

const oldWindowLocation = {...window.location}

// @ts-expect-error overriding window.location in test
delete window.location
window.location = {...oldWindowLocation} as Location
const setHrefSpy = jest.fn()
Object.defineProperty(window.location, 'href', {
  set: setHrefSpy,
})

test('Alpha badge and links render', () => {
  render(<AlphaBadgeAndActions pullRequestNumber={1} repoNameWithOwner="owner/repo" />, {
    appPayload: {feedbackUrl: 'test-url'},
  })
  expect(screen.getByText('Alpha')).toBeInTheDocument()
  expect(screen.getByText('Send feedback')).toBeInTheDocument()
  expect(screen.getByText('Opt out')).toBeInTheDocument()
})

test('Opt out link sends a request to toggle_prx endpoint', async () => {
  const {user} = render(<AlphaBadgeAndActions pullRequestNumber={1} repoNameWithOwner="owner/repo" />)

  await user.click(screen.getByText('Opt out'))

  expect(mockFetch.fetch).toHaveBeenCalledWith('/owner/repo/toggle_prx', {
    method: 'POST',
    body: JSON.stringify({id: 1}),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    headers: expect.any(Object),
  })
})
