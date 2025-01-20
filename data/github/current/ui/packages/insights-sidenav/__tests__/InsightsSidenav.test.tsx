import {screen, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {InsightsSidenav} from '../InsightsSidenav'

test('Renders with items', () => {
  render(
    <InsightsSidenav
      selectedKey="dependency_insights"
      showDependencies={true}
      showActionsUsageMetrics={true}
      showApi={true}
      urls={{
        dependency_insights: '#',
        actions_usage_metrics: '#',
        api: '#',
      }}
    />,
  )

  expect(screen.getByTestId('InsightsSidenav')).toBeInTheDocument()

  const dependencies = screen.getByRole('link', {name: `Dependencies`})
  expect(dependencies).toBeInTheDocument()
  expect(within(dependencies).getByRole('img', {hidden: true})).toBeInTheDocument()

  const actions = screen.getByRole('link', {name: `Actions Usage Metrics`})
  expect(actions).toBeInTheDocument()
  expect(within(actions).getByRole('img', {hidden: true})).toBeInTheDocument()

  const api = screen.getByRole('link', {name: `API`})
  expect(api).toBeInTheDocument()
  expect(within(api).getByRole('img', {hidden: true})).toBeInTheDocument()
})

test('Does not render item unless prop is true', () => {
  render(
    <InsightsSidenav
      selectedKey="dependency_insights"
      showDependencies={true}
      urls={{
        dependency_insights: '#',
        actions_usage_metrics: '#',
        api: '#',
      }}
    />,
  )

  expect(screen.getByTestId('InsightsSidenav')).toBeInTheDocument()

  const dependencies = screen.getByRole('link', {name: `Dependencies`})
  expect(dependencies).toBeInTheDocument()
  expect(within(dependencies).getByRole('img', {hidden: true})).toBeInTheDocument()

  expect(screen.queryByRole('link', {name: `Actions Usage Metrics`})).not.toBeInTheDocument()

  expect(screen.queryByRole('link', {name: `API`})).not.toBeInTheDocument()
})
