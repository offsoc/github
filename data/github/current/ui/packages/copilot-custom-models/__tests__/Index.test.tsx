import {getIndexRoutePayload, getPipelineDetails} from '../test-utils/mock-data'
import {Index} from '../routes/Index/Page'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

// <Banner /> is experimental and has some console errors
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation()
})

describe('<Index />', () => {
  describe('latest pipeline / blank slate', () => {
    it('renders latest pipeline when latest pipeline present', () => {
      const routePayload = getIndexRoutePayload()
      routePayload.latestPipeline = getPipelineDetails()

      const login = 'monalisa'
      routePayload.latestPipeline.actorLogin = login

      render(<Index />, {routePayload})

      const {organization} = routePayload

      const title = `${organization} model`
      expect(screen.getByRole('heading', {name: title})).toBeInTheDocument()

      const createdBy = `Created by`
      expect(screen.getByText(createdBy, {exact: false})).toBeInTheDocument()
      expect(screen.getByText(login, {exact: false})).toBeInTheDocument()
    })

    it('renders a proper blank slate when latest pipeline not present', () => {
      const routePayload = getIndexRoutePayload()
      routePayload.latestPipeline = undefined

      render(<Index />, {routePayload})

      const title = 'Create your custom model'
      expect(screen.getByRole('heading', {name: title})).toBeInTheDocument()
    })
  })

  describe('training history list', () => {
    it('renders the list when 2+ pipelines present', () => {
      const routePayload = getIndexRoutePayload()
      const pipeline1 = getPipelineDetails()
      routePayload.pipelines = [pipeline1, getPipelineDetails()]
      routePayload.latestPipeline = pipeline1

      render(<Index />, {routePayload})

      const title = '2 training runs'
      expect(screen.getByRole('heading', {name: title})).toBeInTheDocument()
    })

    it('does not render the list when 1 pipeline present', () => {
      const routePayload = getIndexRoutePayload()
      routePayload.pipelines = [getPipelineDetails()]

      render(<Index />, {routePayload})

      const title = '1 training run'
      expect(screen.queryByRole('heading', {name: title})).not.toBeInTheDocument()
    })

    it('does not render the list when no pipelines present', () => {
      const routePayload = getIndexRoutePayload()
      routePayload.pipelines = []

      render(<Index />, {routePayload})

      const title = '0 training runs'
      expect(screen.queryByRole('heading', {name: title})).not.toBeInTheDocument()
    })
  })
})
