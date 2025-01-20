import {render} from '@github-ui/react-core/test-utils'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {screen} from '@testing-library/react'
import type {ComponentProps} from 'react'
import {ListView} from '@github-ui/list-view'

import {RunnerListItem} from '../components/RunnerListItem'

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

function getRunnerListItemProps() {
  const runnerType: 'larger_runner' | 'shared_runner' | 'repo_self_hosted' | 'repo_scale_set' = 'larger_runner'
  return {
    name: 'linux-runner',
    os: 'linux',
    description: 'Test description',
    labels: ['label-1', 'label-2'],
    source: 'Organization',
    runnerType,
  }
}

function renderRunnerListItem(props: ComponentProps<typeof RunnerListItem>) {
  return render(
    <ListView title="Sample runners">
      <RunnerListItem {...props} />
    </ListView>,
  )
}

test('Renders the RunnerListItem', () => {
  const props = getRunnerListItemProps()

  renderRunnerListItem(props)

  const listItem = screen.getByTestId(`${props.name}-runner-list-item`)

  expect(listItem).toBeInTheDocument()
  expect(listItem).toHaveTextContent(props.name)
  expect(listItem).toHaveTextContent(props.description)
  for (const label of props.labels) {
    expect(listItem).toHaveTextContent(label)
  }
})

test('Copies label', async () => {
  const props = getRunnerListItemProps()
  const {user} = renderRunnerListItem(props)
  const actionMenu = screen.getByTestId('overflow-menu-anchor')
  expect(actionMenu).toBeInTheDocument()
  await user.click(actionMenu)

  const copyLabel = await screen.findByText('Copy label')

  await user.click(copyLabel)

  await expect(navigator.clipboard.readText()).resolves.toEqual(props.name)

  expectAnalyticsEvents({
    type: 'analytics.click',
    data: {
      category: 'repository_runners',
      action: 'click_to_copy_runner_label',
      label: `ref_cta:copy_label;ref_loc:actions_runners;ref_label:${props.name};runner_type:${props.runnerType};source:${props.source}`,
    },
  })
})

test('Renders linux icon when OS is linux', () => {
  renderRunnerListItem({...getRunnerListItemProps(), os: 'linux'})

  expect(screen.getByTestId('linux-icon')).toBeInTheDocument()
})

test('Renders macOS icon when OS is macos', () => {
  renderRunnerListItem({...getRunnerListItemProps(), os: 'macos'})

  expect(screen.getByTestId('macos-icon')).toBeInTheDocument()
})

test('Renders windows icon when OS is windows', () => {
  renderRunnerListItem({...getRunnerListItemProps(), os: 'windows'})

  expect(screen.getByTestId('windows-icon')).toBeInTheDocument()
})

test('Renders arc icon when OS is arc', () => {
  renderRunnerListItem({...getRunnerListItemProps(), os: 'arc'})

  expect(screen.getByTestId('arc-icon')).toBeInTheDocument()
})

test('Renders GitHub icon when OS is not recognized', () => {
  renderRunnerListItem({...getRunnerListItemProps(), os: 'foobar'})

  expect(screen.getByTestId('github-icon')).toBeInTheDocument()
})
