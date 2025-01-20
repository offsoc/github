import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {DefaultPrivileges} from '../../../client/api/common-contracts'
import {apiMemexWithoutLimitsBetaSignup} from '../../../client/api/memex/api-post-beta-signup'
import type {BetaSignupBannerState} from '../../../client/api/memex/contracts'
import {apiDismissNotice} from '../../../client/api/notice/api-dismiss-notice'
import {ViewType} from '../../../client/helpers/view-type'
import {ProjectView} from '../../../client/project-view'
import type {EnabledFeatures} from '../../../mocks/generate-enabled-features-from-url'
import {buildSystemColumns} from '../../factories/columns/system-column-factory'
import {buildMemex} from '../../factories/memexes/memex-factory'
import {viewFactory} from '../../factories/views/view-factory'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {createTestEnvironment, TestAppContainer} from '../../test-app-wrapper'

jest.mock('../../../client/api/memex/api-post-beta-signup')
jest.mock('../../../client/api/notice/api-dismiss-notice')

function setupFullProjectView({
  enabledFeatures = [],
  betaBannerState = 'hidden',
  killSwitchEnabled = false,
  killSwitchRecentlyDisabled = false,
}: {
  enabledFeatures?: Array<EnabledFeatures>
  betaBannerState?: BetaSignupBannerState
  killSwitchEnabled?: boolean
  killSwitchRecentlyDisabled?: boolean
} = {}) {
  const columns = buildSystemColumns()
  const viewData = [viewFactory.withViewType(ViewType.Table).withDefaultColumnsAsVisibleFields(columns).build()]
  const privileges = DefaultPrivileges
  createTestEnvironment({
    'memex-data': buildMemex(),
    'memex-views': viewData,
    'memex-columns-data': columns,
    'memex-items-data': [],
    'memex-viewer-privileges': privileges,
    'memex-enabled-features': enabledFeatures,
    'memex-service': {betaSignupBanner: betaBannerState, killSwitchEnabled, killSwitchRecentlyDisabled},
  })
}

describe('Project View', () => {
  setupFullProjectView()

  it('beta disabled banner does not show if killSwitchEnabled: false in JSON island', () => {
    setupFullProjectView()

    render(
      <TestAppContainer>
        <ProjectView />
      </TestAppContainer>,
    )

    expect(screen.queryByTestId('mwl-disabled-banner')).not.toBeInTheDocument()
  })

  it('beta disabled banner does show if killSwitchEnabled: true in JSON island', () => {
    setupFullProjectView({killSwitchEnabled: true})

    render(
      <TestAppContainer>
        <ProjectView />
      </TestAppContainer>,
    )

    expect(screen.queryByTestId('mwl-disabled-banner')).toBeVisible()
  })

  it('mwl re-enabled banner does show if killSwitchRecentlyDisabled: true', () => {
    // In reality, this value will never be read as true from the JSON island -
    // it will be set as a result of a live update detecting that we went from
    // killSwitchEnabled : true -> false. However, the logic for which banner is shown
    // is only predicated based on the value of killSwitchRecentlyDisabled in the client state.
    // It would be a lot more difficult to simulate the live update happening here to
    // update the state, and this test should be sufficient for verifying we're showing the correct
    // banner.
    setupFullProjectView({killSwitchRecentlyDisabled: true})

    render(
      <TestAppContainer>
        <ProjectView />
      </TestAppContainer>,
    )

    expect(screen.queryByTestId('mwl-re-enabled-banner')).toBeVisible()
  })

  it('beta banner does not show if state is hidden in JSON island', () => {
    setupFullProjectView()

    render(
      <TestAppContainer>
        <ProjectView />
      </TestAppContainer>,
    )

    expect(screen.queryByTestId('no-project-limits-waitlist-banner')).not.toBeInTheDocument()
  })

  it('beta banner shows if state is visible in JSON island and is dismissed if posted', async () => {
    setupFullProjectView({betaBannerState: 'visible'})
    const betaSignupApiStub = stubResolvedApiResponse(apiMemexWithoutLimitsBetaSignup, {success: true})

    render(
      <TestAppContainer>
        <ProjectView />
      </TestAppContainer>,
    )

    expect(screen.queryByTestId('no-project-limits-waitlist-banner')).toBeVisible()

    await userEvent.click(screen.getByRole('button', {name: 'Join waitlist'}))

    expect(betaSignupApiStub).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('no-project-limits-waitlist-banner')).not.toBeInTheDocument()
  })

  it('staffship beta banner shows if state is staffship in JSON island and is dismissed if posted', async () => {
    setupFullProjectView({betaBannerState: 'staffship'})
    const betaSignupApiStub = stubResolvedApiResponse(apiMemexWithoutLimitsBetaSignup, {success: true})

    render(
      <TestAppContainer>
        <ProjectView />
      </TestAppContainer>,
    )

    expect(screen.queryByTestId('no-project-limits-waitlist-staffship-banner')).toBeVisible()

    await userEvent.click(screen.getByRole('button', {name: 'Join beta'}))

    expect(betaSignupApiStub).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('no-project-limits-waitlist-staffship-banner')).not.toBeInTheDocument()
  })

  it('beta banner is hidden if user clicks dismiss button', async () => {
    setupFullProjectView({betaBannerState: 'visible'})
    const dismissNoticeApiStub = stubResolvedApiResponse(apiDismissNotice, {success: true})

    const {rerender} = render(
      <TestAppContainer>
        <ProjectView />
      </TestAppContainer>,
    )

    expect(screen.queryByTestId('no-project-limits-waitlist-banner')).toBeVisible()

    await userEvent.click(screen.getByLabelText('Dismiss alert'))

    expect(dismissNoticeApiStub).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('no-project-limits-waitlist-banner')).not.toBeInTheDocument()

    rerender(
      <TestAppContainer>
        <ProjectView />
      </TestAppContainer>,
    )

    expect(screen.queryByTestId('no-project-limits-waitlist-banner')).not.toBeInTheDocument()
  })
})
