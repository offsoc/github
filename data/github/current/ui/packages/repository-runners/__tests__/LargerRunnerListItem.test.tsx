import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import type {ComponentProps} from 'react'
import {LargerRunnerListItem} from '../components/LargerRunnerListItem'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {ListView} from '@github-ui/list-view'

describe('LargerRunnerListItem', () => {
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

  function renderLargerRunnerListItem(props: ComponentProps<typeof LargerRunnerListItem> = {}) {
    return render(
      <ListView title="Sample runners list">
        <LargerRunnerListItem {...props} />
      </ListView>,
    )
  }

  test('Renders the LargerRunnerListItem', () => {
    const message = 'Larger GitHub-hosted runners'

    renderLargerRunnerListItem()

    expect(screen.getByTestId('larger-runner-list-item')).toBeInTheDocument()
    expect(screen.getByTestId('larger-runner-list-item')).toHaveTextContent(message)
  })

  test('"View larger runner docs" CTA renders', async () => {
    const {user} = renderLargerRunnerListItem()

    const actionMenu = screen.getByTestId('overflow-menu-anchor')
    expect(actionMenu).toBeInTheDocument()
    await user.click(actionMenu)

    const docsCta = await screen.findByText('View larger runner docs')

    expect(docsCta).toBeInTheDocument()
  })

  test('"See pricing" CTA renders', async () => {
    const {user} = renderLargerRunnerListItem()

    const actionMenu = screen.getByTestId('overflow-menu-anchor')
    expect(actionMenu).toBeInTheDocument()
    await user.click(actionMenu)

    const docsCta = await screen.findByText('View larger runner docs')

    expect(docsCta).toBeInTheDocument()
  })

  test('"Set up larger runners" CTA renders when setUpRunnersLink is present', async () => {
    const {user} = renderLargerRunnerListItem({setUpRunnersLink: '/foo/bar'})

    const actionMenu = screen.getByTestId('overflow-menu-anchor')
    expect(actionMenu).toBeInTheDocument()
    await user.click(actionMenu)

    const setupCta = await screen.findByText('Set up larger runners')

    expect(setupCta).toBeInTheDocument()
  })

  test('"Set up larger runners" CTA does not render when setUpRunnersLink is not present', async () => {
    const {user} = renderLargerRunnerListItem()

    const actionMenu = screen.getByTestId('overflow-menu-anchor')
    expect(actionMenu).toBeInTheDocument()
    await user.click(actionMenu)

    const setupCta = screen.queryByText('Set up larger runners')

    expect(setupCta).not.toBeInTheDocument()
  })

  test('See pricing send analytics event', async () => {
    const {user} = renderLargerRunnerListItem()

    const actionMenu = screen.getByTestId('overflow-menu-anchor')
    expect(actionMenu).toBeInTheDocument()
    await user.click(actionMenu)

    const cta = await screen.findByText('See pricing')
    await user.click(cta)
    expectAnalyticsEvents({
      type: 'analytics.click',
      data: {
        category: 'repository_runners',
        action: `click_to_view_larger_runners_pricing`,
        label: `ref_cta:see_pricing;ref_loc:larger_runners_list_menu;`,
      },
    })
  })

  test('View larger runner docs send analytics event', async () => {
    const {user} = renderLargerRunnerListItem()

    const actionMenu = screen.getByTestId('overflow-menu-anchor')
    expect(actionMenu).toBeInTheDocument()
    await user.click(actionMenu)

    const cta = await screen.findByText('View larger runner docs')
    await user.click(cta)
    expectAnalyticsEvents({
      type: 'analytics.click',
      data: {
        category: 'repository_runners',
        action: `click_to_view_larger_runners_docs`,
        label: `ref_cta:view_larger_runner_docs;ref_loc:larger_runners_list_menu;`,
      },
    })
  })

  test('Set up larger runners send analytics event', async () => {
    const {user} = renderLargerRunnerListItem({setUpRunnersLink: '/foo/bar'})

    const actionMenu = screen.getByTestId('overflow-menu-anchor')
    expect(actionMenu).toBeInTheDocument()
    await user.click(actionMenu)

    const cta = await screen.findByText('Set up larger runners')
    await user.click(cta)
    expectAnalyticsEvents({
      type: 'analytics.click',
      data: {
        category: 'repository_runners',
        action: `click_to_set_up_larger_runners`,
        label: `ref_cta:set_up_larger_runners;ref_loc:larger_runners_list_menu;`,
      },
    })
  })
})
