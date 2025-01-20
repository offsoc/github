/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getEnterpriseServerStatsProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders chart titles for 5 charts', async () => {
  const view = await serverRenderReact({
    name: 'enterprise-server-stats',
    data: {props: {...getEnterpriseServerStatsProps()}},
  })

  expect(view).toContain('Issues')
  expect(view).toContain('Pull Requests')
  expect(view).toContain('Repositories')
  expect(view).toContain('Users')
  expect(view).toContain('Orgs &amp; Teams')
})

test('Renders loading indicators for 5 charts', async () => {
  const view = await serverRenderReact({
    name: 'enterprise-server-stats',
    data: {props: {...getEnterpriseServerStatsProps()}},
  })

  expect(view.match(/data-testid="loading-indicator"/gi) || []).toHaveLength(5)
})

test('Handles no props', async () => {
  const view = await serverRenderReact({
    name: 'enterprise-server-stats',
    data: {props: {}},
  })
  expect(view.match(/<h3/gi)).toHaveLength(5)
  expect(view.match(/data-testid="loading-indicator"/gi) || []).toHaveLength(5)
})
