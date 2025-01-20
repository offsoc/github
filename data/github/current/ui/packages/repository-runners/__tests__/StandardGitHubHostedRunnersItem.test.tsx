import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {ListView} from '@github-ui/list-view'

import {StandardGitHubHostedRunnersItem} from '../components/StandardGitHubHostedRunnersItem'

// Mock the following properties to avoid focus errors for ListView
beforeAll(() => {
  Object.defineProperties(HTMLElement.prototype, {
    offsetHeight: {get: () => 42},
    offsetWidth: {get: () => 42},
    getClientRects: {get: () => () => [42]},
    offsetParent: {get: () => true},
    focus: {value: () => {}},
  })
})

function renderStandardGitHubHostedRunnersItem() {
  return render(
    <ListView title="Sample GitHub-hosted runners">
      <StandardGitHubHostedRunnersItem />
    </ListView>,
  )
}

test('Renders the StandardGitHubHostedRunnersItem', () => {
  renderStandardGitHubHostedRunnersItem()

  expect(screen.getByTestId('hosted-runners-list-item')).toBeInTheDocument()
})

test('Copies label', async () => {
  const {user} = renderStandardGitHubHostedRunnersItem()
  const actionMenu = screen.getByTestId('overflow-menu-anchor')
  expect(actionMenu).toBeInTheDocument()

  await user.click(actionMenu)

  const copyUbuntu = await screen.findByText('Copy ubuntu-latest')
  await user.click(copyUbuntu)

  await expect(navigator.clipboard.readText()).resolves.toEqual('ubuntu-latest')

  expectAnalyticsEvents({
    type: 'analytics.click',
    data: {
      category: 'repository_runners',
      action: 'click_to_copy_github_standard_runner_label',
      label: 'ref_cta:copy_label;ref_loc:actions_runners;ref_label:ubuntu-latest',
    },
  })
})
