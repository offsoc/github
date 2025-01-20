/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getCodespacesOrganizationOwnershipSettingProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders codespaces-organization-ownership-setting partial with SSR', async () => {
  const props = getCodespacesOrganizationOwnershipSettingProps()
  const view = await serverRenderReact({
    name: 'codespaces-organization-ownership-setting',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch('Organization ownership')
})
