import {App} from './App'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {Article, Category} from './routes'

registerReactAppFactory('resources', () => ({
  App,
  routes: [
    jsonRoute({path: '/resources/articles/:topic/:path', Component: Article}),
    jsonRoute({path: '/resources/articles/:topic', Component: Category}),
    jsonRoute({path: '/resources/articles', Component: Category}),
  ],
}))
