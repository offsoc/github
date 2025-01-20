import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {PromotionCard} from '../PromotionCard'
import {MarkGithubIcon} from '@primer/octicons-react'

test('Renders the PromotionCard with eventTitle', () => {
  const message =
    'Watch all the latest product announcements and expert-driven sessions from this year&apos;s event, available now on-demand.'
  render(
    <PromotionCard eventIcon={MarkGithubIcon} eventTitle="Universe 2023" title="Let's build from here">
      {message}
    </PromotionCard>,
  )
  expect(screen.getByTestId('promotion-card')).toHaveTextContent(message)
  expect(screen.getByTestId('promotion-card-event-title')).toHaveTextContent('Universe 2023')
  expect(screen.getByTestId('promotion-card-title')).toHaveTextContent("Let's build from here")
  expect(screen.getByRole('button', {name: 'Close Universe 2023 promotion'})).toBeInTheDocument()
})

test('Renders the PromotionCard with coverImage', () => {
  const message =
    'Watch all the latest product announcements and expert-driven sessions from this year&apos;s event, available now on-demand.'
  render(
    <PromotionCard
      title="Let's build from here"
      lightImagePath="https://github.com/images/modules/growth/member_feature_requests/light.png"
      darkImagePath="https://github.com/images/modules/growth/member_feature_requests/dark.png"
    >
      {message}
    </PromotionCard>,
  )
  expect(screen.getByTestId('promotion-card')).toHaveTextContent(message)
  expect(screen.queryByTestId('promotion-card-event-title')).not.toBeInTheDocument()
  expect(screen.getByTestId('promotion-card-title')).toHaveTextContent("Let's build from here")
  expect(screen.getByTestId('promotion-card-cover-image')).toBeInTheDocument()
  expect(screen.getByRole('button', {name: "Close Let's build from here promotion"})).toBeInTheDocument()
})

test('Renders the PromotionCard without coverImage or eventTitle', () => {
  const message =
    'Watch all the latest product announcements and expert-driven sessions from this year&apos;s event, available now on-demand.'
  render(<PromotionCard title="Let's build from here">{message}</PromotionCard>)
  expect(screen.getByTestId('promotion-card')).toHaveTextContent(message)
  expect(screen.queryByTestId('promotion-card-event-title')).not.toBeInTheDocument()
  expect(screen.getByTestId('promotion-card-title')).toHaveTextContent("Let's build from here")
  expect(screen.queryByTestId('promotion-card-cover-image')).not.toBeInTheDocument()
  expect(screen.getByRole('button', {name: "Close Let's build from here promotion"})).toBeInTheDocument()
})
