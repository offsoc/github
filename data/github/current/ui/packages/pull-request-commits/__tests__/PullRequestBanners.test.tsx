import {screen} from '@testing-library/react'
import {renderWithClient} from '@github-ui/pull-request-page-data-tooling/render-with-query-client'

import {PullRequestBanners} from '../components/PullRequestBanners'
import {getCommitsRoutePayload} from '../test-utils/mock-data'

describe('PullRequestBanners', () => {
  // Copied from https://github.com/primer/react/blob/main/packages/react/src/Banner/Banner.test.tsx:
  beforeEach(() => {
    // Note: this error occurs due to our usage of `@container` within a
    // `<style>` tag in Banner. The CSS parser for jsdom does not support this
    // syntax and will fail with an error containing the message below.
    // eslint-disable-next-line no-console
    const originalConsoleError = console.error
    jest.spyOn(console, 'error').mockImplementation((value, ...args) => {
      if (!value?.message?.includes('Could not parse CSS stylesheet')) {
        originalConsoleError(value, ...args)
      }
    })
  })

  const {bannersData, pullRequest, repository} = getCommitsRoutePayload()

  test('renders without errors', () => {
    renderWithClient(<PullRequestBanners bannersData={bannersData} pullRequest={pullRequest} repository={repository} />)

    expect(screen.queryByText(/See open Dependabot/)).not.toBeInTheDocument()
  })

  test('displays the PullRequestPausedDependabotBanner when the pull request is paused by Dependabot', () => {
    const pausedByDependabotBannerData = {
      banners: {
        pausedDependabotUpdate: {render: true},
        hiddenCharacterWarning: {render: false},
      },
    }

    renderWithClient(
      <PullRequestBanners
        bannersData={pausedByDependabotBannerData}
        pullRequest={pullRequest}
        repository={repository}
      />,
    )

    expect(screen.getByText(/Dependabot updates are paused/)).toBeInTheDocument()
  })

  test('displays the PullRequestHiddenCharactersBanner when there are hidden characters in the pull request', () => {
    const hiddenCharactersBannerData = {
      banners: {
        pausedDependabotUpdate: {render: false},
        hiddenCharacterWarning: {render: true},
      },
    }

    renderWithClient(
      <PullRequestBanners bannersData={hiddenCharactersBannerData} pullRequest={pullRequest} repository={repository} />,
    )

    expect(screen.getByText(/head ref may contain hidden characters/)).toBeInTheDocument()
  })
})
