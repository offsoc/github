/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getCreateBranchButtonOptions, getListRoutePayload, getRepository} from '../test-utils/mock-data'
import {wrapActiveClassNameException} from '../test-utils/wrap-active-class-name-exception'
import {BRANCH_PAGES} from '../constants'

// Register with react-core before attempting to render
import '../ssr-entry'

test.each(BRANCH_PAGES.filter(page => page.type !== 'overview').map(page => [page.type, page]))(
  'renders %s page with SSR',
  async (_, page) => {
    const repo = getRepository()
    const routePayload = getListRoutePayload()
    await wrapActiveClassNameException(async () => {
      const view = await serverRenderReact({
        name: 'repos-branches',
        path: `/:user_id/:repository/${page.href}`,
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
  },
)
