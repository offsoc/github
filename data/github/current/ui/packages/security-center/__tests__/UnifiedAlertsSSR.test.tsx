/** @jest-environment node */
// Register with react-core before attempting to render
import '../ssr-entry'

import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

import {getUnifiedAlertsRoutePayload} from '../test-utils/mock-data'

jest.mock('@github-ui/react-core/use-app-payload')
const mockedUseAppPayload = jest.mocked(useAppPayload)

describe('UnifiedAlerts with SSR', () => {
  describe('at organization scope', () => {
    it('renders the view', async () => {
      mockedUseAppPayload.mockReturnValue({
        variant: 'content',
      })

      const routePayload = getUnifiedAlertsRoutePayload()

      const view = await serverRenderReact({
        name: 'security-center',
        path: '/orgs/:org/security/alerts',
        data: {payload: routePayload},
      })

      // verify ssr was able to render some content from the payload
      expect(view).toMatch(routePayload.feedbackLink.text)
    })
  })
})
