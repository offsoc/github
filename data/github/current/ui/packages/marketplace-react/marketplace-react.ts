import {App} from './App'
import {Index} from './routes/Index'
import {ShowApp} from './routes/ShowApp'
import {ShowAction} from './routes/ShowAction'
import {ModelsIndexRoute} from './models/routes/index/ModelsIndexRoute'
import {ModelsPlaygroundRoute} from './models/routes/playground/ModelsPlaygroundRoute'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {ModelsShowRoute} from './models/routes/show/ModelsShowRoute'

registerReactAppFactory('marketplace-react', () => ({
  App,
  routes: [
    jsonRoute({path: '/marketplace', Component: Index}),
    jsonRoute({path: '/marketplace/:slug', Component: ShowApp}),
    jsonRoute({path: '/marketplace/actions/:slug', Component: ShowAction}),
    jsonRoute({path: '/marketplace/models', Component: ModelsIndexRoute}),
    jsonRoute({path: '/marketplace/models/:registry/:model', Component: ModelsShowRoute}),
    jsonRoute({path: '/marketplace/models/:registry/:model/playground', Component: ModelsPlaygroundRoute}),
    jsonRoute({path: '/marketplace/models/:registry/:model/playground/code', Component: ModelsPlaygroundRoute}),
    jsonRoute({path: '/marketplace/models/:registry/:model/playground/json', Component: ModelsPlaygroundRoute}),
  ],
}))
