import {App} from './App'
import {CustomImagesManagement} from './routes/CustomImagesManagement'
import {CustomImageVersionsList} from './routes/CustomImageVersionsList'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

registerReactAppFactory('custom-images', () => ({
  App,
  routes: [
    jsonRoute({
      path: '/organizations/:organization_id/settings/actions/custom-images',
      Component: CustomImagesManagement,
    }),
    jsonRoute({
      path: '/enterprises/:business/settings/actions/custom-images',
      Component: CustomImagesManagement,
    }),
    jsonRoute({
      path: '/organizations/:organization_id/settings/actions/custom-images/:image_id/versions',
      Component: CustomImageVersionsList,
    }),
    jsonRoute({
      path: '/enterprises/:business/settings/actions/custom-images/:image_id/versions',
      Component: CustomImageVersionsList,
    }),
  ],
}))
