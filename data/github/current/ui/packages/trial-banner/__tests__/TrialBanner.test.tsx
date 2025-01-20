import {screen} from '@testing-library/react'
import {testIdProps} from '@github-ui/test-id-props'
import {render} from '@github-ui/react-core/test-utils'
import {TrialBanner} from '../TrialBanner'

test('Renders with active variant', () => {
  const message = 'Your enterprise trial will expire in 27 days'
  render(<TrialBanner>{message}</TrialBanner>)
  expect(screen.getByTestId('growth-trial-banner-active')).toHaveTextContent(message)
})

test('Renders with warning variant', () => {
  const message = 'Your enterprise trial will expire in 5 days'
  render(<TrialBanner variant="warning">{message}</TrialBanner>)
  expect(screen.getByTestId('growth-trial-banner-warning')).toHaveTextContent(message)
})

test('Renders with expired variant', () => {
  const message = 'Your enterprise trial has expired'
  render(<TrialBanner variant="expired">{message}</TrialBanner>)
  expect(screen.getByTestId('growth-trial-banner-expired')).toHaveTextContent(message)
})

test('Renders with primary, secondary, and close buttons', async () => {
  const closeButtonClick = jest.fn()
  const primaryButtonClick = jest.fn()
  const secondaryButtonClick = jest.fn()
  const message = 'Your enterprise trial will expire in 27 days'
  const {user} = render(
    <TrialBanner
      closeButtonClick={closeButtonClick}
      primaryButtonProps={{
        onClick: primaryButtonClick,
        children: 'Buy Enterprise',
        ...testIdProps(`growth-trial-banner-primary`),
      }}
      secondaryButtonProps={{
        onClick: secondaryButtonClick,
        children: 'Talk to sales',
        ...testIdProps(`growth-trial-banner-secondary`),
      }}
    >
      {message}
    </TrialBanner>,
  )
  expect(screen.getByTestId('growth-trial-banner-active')).toHaveTextContent(message)
  expect(screen.getByTestId('growth-trial-banner-close')).toBeInTheDocument()
  expect(screen.getByTestId('growth-trial-banner-primary')).toBeInTheDocument()
  expect(screen.getByTestId('growth-trial-banner-secondary')).toBeInTheDocument()

  await user.click(screen.getByTestId('growth-trial-banner-close'))
  expect(closeButtonClick).toHaveBeenCalled()

  await user.click(screen.getByTestId('growth-trial-banner-primary'))
  expect(primaryButtonClick).toHaveBeenCalled()

  await user.click(screen.getByTestId('growth-trial-banner-secondary'))
  expect(secondaryButtonClick).toHaveBeenCalled()
})

test('Renders the TrialBanner without close button', () => {
  const message = 'Your enterprise trial will expire in 27 days'
  render(<TrialBanner showCloseButton={false}>{message}</TrialBanner>)
  expect(screen.getByTestId('growth-trial-banner-active')).toHaveTextContent(message)
  expect(screen.queryByTestId('growth-trial-banner-close')).not.toBeInTheDocument()
})

test('Can override styles', () => {
  const message = 'Your enterprise trial will expire in 27 days'
  render(<TrialBanner sx={{borderColor: 'pink'}}>{message}</TrialBanner>)
  expect(screen.getByTestId('growth-trial-banner-active')).toHaveTextContent(message)
  expect(screen.getByTestId('growth-trial-banner-active')).toHaveStyle('border-color: pink')
})
