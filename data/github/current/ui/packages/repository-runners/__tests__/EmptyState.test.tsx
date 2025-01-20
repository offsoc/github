import {render} from '@github-ui/react-core/test-utils'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {screen} from '@testing-library/react'

import {EmptyState, type EmptyStateProps} from '../components/EmptyState'

function getEmptyStateProps(): EmptyStateProps {
  return {
    selectedTab: 'github-hosted',
  }
}

test('Renders EmptyState when tab is github-hosted', () => {
  const heading = "You don't have any runners for this repository"
  const description = 'Runners are the machines that execute GitHub Actions workflows.'

  render(<EmptyState {...getEmptyStateProps()} selectedTab="github-hosted" />)

  expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  expect(screen.getByTestId('empty-state')).toHaveAttribute('data-hpc')

  expect(screen.getByText(heading)).toBeInTheDocument()
  expect(screen.getByText(description)).toBeInTheDocument()
})

test('Renders EmptyState when tab is self-hosted', () => {
  const heading = "You don't have any self-hosted runners for this repository"
  const description =
    'Self-hosted runners are virtual machines for GitHub Actions workflows that you manage and maintain outside of GitHub.'

  render(<EmptyState {...getEmptyStateProps()} selectedTab="self-hosted" />)

  expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  expect(screen.getByText(heading)).toBeInTheDocument()
  expect(screen.getByText(description)).toBeInTheDocument()
})

test('primary and secondary CTAs render when setUpRunnersLink is present and tab is github-hosted', async () => {
  const {user} = render(
    <EmptyState {...getEmptyStateProps()} setUpRunnersLink="/foo/bar" selectedTab="github-hosted" />,
  )

  const newRunnerCta = screen.getByTestId('empty-state-new-runner-cta')
  expect(newRunnerCta).toBeInTheDocument()
  await user.click(newRunnerCta)

  const learnMoreCta = await screen.findByText('Learn more about using runners')
  await user.click(learnMoreCta)

  expectAnalyticsEvents(
    {
      type: 'analytics.click',
      data: {
        category: 'repository_runners',
        action: 'click_new_runner_cta',
        label: 'ref_cta:new_runner;ref_loc:empty_state;path:/foo/bar;selected_tab:github-hosted',
      },
    },
    {
      type: 'analytics.click',
      data: {
        category: 'repository_runners',
        action: 'click_view_runner_docs',
        label: 'ref_cta:learn_more_about_using_runners;ref_loc:empty_state;selected_tab:github-hosted',
      },
    },
  )
})

test('"Learn more" secondary CTA does not render when setUpRunnersLink is present and tab is self-hosted', async () => {
  const {user} = render(<EmptyState {...getEmptyStateProps()} setUpRunnersLink="/foo/bar" selectedTab="self-hosted" />)

  const newRunnerCta = screen.getByTestId('empty-state-new-runner-cta')
  expect(newRunnerCta).toBeInTheDocument()
  await user.click(newRunnerCta)

  expect(screen.queryByText('Learn more about using runners')).not.toBeInTheDocument()

  expectAnalyticsEvents({
    type: 'analytics.click',
    data: {
      category: 'repository_runners',
      action: 'click_new_runner_cta',
      label: 'ref_cta:new_runner;ref_loc:empty_state;path:/foo/bar;selected_tab:self-hosted',
    },
  })
})

test('"Learn more" primary CTA renders when setUpRunnersLink is not present and tab is github-hosted', async () => {
  const {user} = render(<EmptyState {...getEmptyStateProps()} selectedTab="github-hosted" />)

  const learnMoreCta = screen.getByTestId('empty-state-learn-more-cta')
  expect(learnMoreCta).toBeInTheDocument()
  await user.click(learnMoreCta)

  expectAnalyticsEvents({
    type: 'analytics.click',
    data: {
      category: 'repository_runners',
      action: 'click_view_runner_docs',
      label: 'ref_cta:learn_more_about_using_runners;ref_loc:empty_state;selected_tab:github-hosted',
    },
  })
})

test('does not render "Learn more" primary CTA when setUpRunnersLink is not present and tab is self-hosted', () => {
  render(<EmptyState {...getEmptyStateProps()} selectedTab="self-hosted" />)

  expect(screen.queryByTestId('empty-state-learn-more-cta')).not.toBeInTheDocument()
})
