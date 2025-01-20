import {App} from './App'
import {Overview} from './routes/Overview/Overview'
import {Detail} from './routes/Detail/Detail'
import {Category} from './routes/Category/Category'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

registerReactAppFactory('solutions', () => ({
  App,
  routes: [
    jsonRoute({path: '/solutions', Component: Overview}),
    jsonRoute({path: '/solutions/:category', Component: Category}),
    jsonRoute({path: '/solutions/:category/:detail', Component: Detail}),
  ],
}))
