import {App} from './App'
import {OnboardingOrganizations} from './routes/OnboardingOrganizations'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

registerReactAppFactory('enterprise-onboarding', () => ({
  App,
  routes: [jsonRoute({path: '/enterprises/:slug/onboarding/organizations/new', Component: OnboardingOrganizations})],
}))
