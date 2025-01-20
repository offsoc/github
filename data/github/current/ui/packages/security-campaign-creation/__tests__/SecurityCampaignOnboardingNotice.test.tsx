import {act, screen, waitFor} from '@testing-library/react'
import {render as reactRender} from '@github-ui/react-core/test-utils'
import {
  SecurityCampaignsOnboardingNotice,
  type SecurityCampaignsOnboardingNoticeProps,
} from '../SecurityCampaignsOnboardingNotice'
import {TestWrapper} from '@github-ui/security-campaigns-shared/test-utils/TestWrapper'
import {mockFetch} from '@github-ui/mock-fetch'

const dismissPath = '/settings/dismiss-notice/security_campaigns_onboarding'

const render = (props?: Partial<SecurityCampaignsOnboardingNoticeProps>) =>
  reactRender(<SecurityCampaignsOnboardingNotice show={true} dismissPath={dismissPath} {...props} />, {
    wrapper: TestWrapper,
  })

test('Renders the notice', () => {
  render()

  const heading = screen.getByRole('heading', {
    name: 'Introducing security campaigns!',
  })
  expect(heading).toBeInTheDocument()

  const text = screen.getByText(/Security campaigns help your team/i)
  expect(text).toBeInTheDocument()

  const dismissButton = screen.getByRole('button', {
    name: 'Got it!',
  })

  expect(dismissButton).toBeInTheDocument()
})

test('Dismisses the notice when the dismiss button is clicked', async () => {
  const {user} = render()

  const routeMock = mockFetch.mockRoute(dismissPath)

  const dismissButton = screen.getByRole('button', {
    name: 'Got it!',
  })

  act(() => {
    user.click(dismissButton)
  })

  await waitFor(() => {
    expect(dismissButton).not.toBeInTheDocument()
  })

  expect(routeMock).toHaveBeenCalledTimes(1)
})
