/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getShowRoutePayload, getIndexRoutePayload, getNewRoutePayload} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

const name = 'copilot-custom-models'
const paths = {
  indexPage: '/organizations/:organization_id/settings/copilot/custom_models',
  newPage: '/organizations/:organization_id/settings/copilot/custom_model/new',
  showPage: '/organizations/:organization_id/settings/copilot/custom_model/training/1',
}

describe('Index page', () => {
  it('renders via SSR', async () => {
    const payload = getIndexRoutePayload()

    const view = await serverRenderReact({name, path: paths.indexPage, data: {payload}})

    expect(view).toMatch('Train a new custom model')
  })
})

describe('Show page', () => {
  it('renders via SSR', async () => {
    const payload = getShowRoutePayload()

    const view = await serverRenderReact({name, path: paths.showPage, data: {payload}})

    const {organization} = payload

    expect(view).toMatch('Created by')
    expect(view).toMatch(organization.slug)
  })
})

describe('New page', () => {
  describe('when enough repos', () => {
    it('renders via SSR', async () => {
      const payload = getNewRoutePayload()

      const view = await serverRenderReact({name, path: paths.newPage, data: {payload}})

      expect(view).toMatch('New custom model')
    })
  })

  describe('when not enough repos', () => {
    it('renders via SSR', async () => {
      const payload = getNewRoutePayload()
      payload.enoughDataToTrain = false

      const view = await serverRenderReact({name, path: paths.newPage, data: {payload}})

      expect(view).toMatch('Sorry, you do not have enough repository data in your org to train a model.')
    })
  })
})
