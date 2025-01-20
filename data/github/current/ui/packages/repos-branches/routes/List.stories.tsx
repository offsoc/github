import type {Meta, StoryObj} from '@storybook/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {ScreenSizeProvider} from '@github-ui/screen-size'
import {HttpResponse, http} from '@github-ui/storybook/msw'
import {
  getCreateBranchButtonOptions,
  getDeferredMetadata,
  getListRoutePayload,
  getRepository,
} from '../test-utils/mock-data'
import {CreateBranchButtonOptionProvider} from '../contexts/CreateBranchButtonOptionContext'
import {List} from './List'

const repo = getRepository()
const deferredMetadata = getDeferredMetadata()

const meta: Meta<typeof List> = {
  title: 'Repo Branches/List',
  component: List,
  args: {
    type: 'yours',
  },
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

export const Default: StoryObj<typeof List> = {
  render: args => {
    const routePayload = getListRoutePayload()

    return (
      <Wrapper routePayload={routePayload}>
        <CurrentRepositoryProvider repository={repo}>
          <CreateBranchButtonOptionProvider options={getCreateBranchButtonOptions({repository: repo})}>
            <ScreenSizeProvider>
              <List {...args} />
            </ScreenSizeProvider>
          </CreateBranchButtonOptionProvider>
        </CurrentRepositoryProvider>
      </Wrapper>
    )
  },
}

export default meta
