import {App} from './App'
import {Main} from './routes/stafftools/Main'
import {NewCuratedImage} from './routes/stafftools/NewCuratedImage'
import {NewCuratedPointer} from './routes/stafftools/NewCuratedPointer'
import {ListImageVersions} from './routes/stafftools/ListImageVersions'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

registerReactAppFactory('hosted-compute-ims-stafftools', () => ({
  App,
  routes: [
    jsonRoute({path: '/stafftools/hosted_compute_ims_admin', Component: Main}),
    jsonRoute({path: '/stafftools/hosted_compute_ims_admin/curated/new_image', Component: NewCuratedImage}),
    jsonRoute({path: '/stafftools/hosted_compute_ims_admin/curated/new_pointer', Component: NewCuratedPointer}),
    jsonRoute({
      path: '/stafftools/hosted_compute_ims_admin/curated/:image_definition_id',
      Component: ListImageVersions,
    }),
  ],
}))
