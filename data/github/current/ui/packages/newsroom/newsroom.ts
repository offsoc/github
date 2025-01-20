import {App} from './App'
import {Newsroom} from './routes/Home/Newsroom'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {PressReleases} from './routes/PressReleases/PressReleases'

registerReactAppFactory('newsroom', () => ({
  App,
  routes: [
    jsonRoute({path: '/newsroom', Component: Newsroom}),
    jsonRoute({path: '/newsroom/press-releases/:topic', Component: PressReleases}),
  ],
}))
