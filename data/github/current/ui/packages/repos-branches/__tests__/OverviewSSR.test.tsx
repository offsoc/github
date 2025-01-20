/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getCreateBranchButtonOptions, getOverviewRoutePayload, getRepository} from '../test-utils/mock-data'
import {wrapActiveClassNameException} from '../test-utils/wrap-active-class-name-exception'

// Register with react-core before attempting to render
import '../ssr-entry'

test('renders with SSR', async () => {
  const repo = getRepository()
  const routePayload = getOverviewRoutePayload()
  await wrapActiveClassNameException(async () => {
    const view = await serverRenderReact({
      name: 'repos-branches',
      path: '/:user_id/:repository/branches',
      data: {
        payload: routePayload,
        appPayload: {
          repo,
          createBranchButtonOptions: getCreateBranchButtonOptions({repository: repo}),
        },
      },
    })
    // verify ssr was able to render some content from the payload
    expect(view).toMatch('Branches')
  })
})
