/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getMeteredEnterpriseServerLicensesProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders metered-enterprise-server-licenses partial with SSR', async () => {
  const props = getMeteredEnterpriseServerLicensesProps()

  const view = await serverRenderReact({
    name: 'metered-enterprise-server-licenses',
    data: {props},
  })

  expect(view).toMatch('Enterprise Server licenses')
})
