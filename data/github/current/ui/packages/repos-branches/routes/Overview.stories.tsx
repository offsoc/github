import {Wrapper} from '@github-ui/react-core/test-utils'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {ScreenSizeProvider} from '@github-ui/screen-size'
import {HttpResponse, http} from '@github-ui/storybook/msw'
import {
  getCreateBranchButtonOptions,
  getDeferredMetadata,
  getOverviewRoutePayload,
  getRepository,
} from '../test-utils/mock-data'
import {CreateBranchButtonOptionProvider} from '../contexts/CreateBranchButtonOptionContext'
import {Overview} from './Overview'

const repo = getRepository()
const deferredMetadata = getDeferredMetadata()

const meta = {
  title: 'Repo Branches/Overview',
  component: Overview,
  parameters: {
    msw: {
      handlers: [
        // Users
        http.post(`/${repo.ownerLogin}/${repo.name}/branches/deferred_metadata`, () =>
          HttpResponse.json({deferredMetadata: Object.fromEntries(deferredMetadata)}),
        ),
      ],
    },
  },
}

export const Default = () => {
  const routePayload = getOverviewRoutePayload()

  return (
    <Wrapper routePayload={routePayload}>
      <CurrentRepositoryProvider repository={repo}>
        <CreateBranchButtonOptionProvider options={getCreateBranchButtonOptions({repository: repo})}>
          <ScreenSizeProvider>
            <Overview />
          </ScreenSizeProvider>
        </CreateBranchButtonOptionProvider>
      </CurrentRepositoryProvider>
    </Wrapper>
  )
}

export default meta
