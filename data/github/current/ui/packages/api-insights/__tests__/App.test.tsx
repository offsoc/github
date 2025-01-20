import {screen, within} from '@testing-library/react'
import {App} from '../App'
import {getApiInsightsSidenavPayload} from '../test-utils/mock-data'
import {testIdProps} from '@github-ui/test-id-props'

import {render} from '@github-ui/react-core/test-utils'

test('Shows sidebar', () => {
  const message = 'Hello World!'
  render(
    <App>
      <div {...testIdProps('ChildContent')}>{message}</div>
    </App>,
    {
      routePayload: getApiInsightsSidenavPayload(),
    },
  )
  expect(screen.getByTestId('ChildContent')).toHaveTextContent(message)

  const sidenav = screen.getByTestId('InsightsSidenav')

  const dependencies = within(sidenav).getByRole('link', {name: `Dependencies`})
  expect(dependencies).toBeInTheDocument()
  expect(within(dependencies).getByRole('img', {hidden: true})).toBeInTheDocument()

  const actions = within(sidenav).getByRole('link', {name: `Actions Usage Metrics`})
  expect(actions).toBeInTheDocument()
  expect(within(actions).getByRole('img', {hidden: true})).toBeInTheDocument()

  const api = within(sidenav).getByRole('link', {name: `API`})
  expect(api).toBeInTheDocument()
  expect(within(api).getByRole('img', {hidden: true})).toBeInTheDocument()
})
