import type {Meta, StoryObj} from '@storybook/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {CreateBranchButtonOptionProvider} from '../contexts/CreateBranchButtonOptionContext'
import {getCreateBranchButtonOptions, getRepository, getOverviewRoutePayload} from '../test-utils/mock-data'
import {ProtectThisBranchBanner} from './ProtectThisBranchBanner'

const meta: Meta<typeof ProtectThisBranchBanner> = {
  title: 'Repo Branches/Components/ProtectThisBranchBanner',
  component: ProtectThisBranchBanner,
}

export const Default: StoryObj<typeof ProtectThisBranchBanner> = {
  args: {
    onDismiss: () => null,
  },
  render: args => {
    const repo = getRepository()
    const routePayload = getOverviewRoutePayload()
    return (
      <Wrapper routePayload={routePayload}>
        <CurrentRepositoryProvider repository={repo}>
          <CreateBranchButtonOptionProvider options={getCreateBranchButtonOptions({repository: repo})}>
            <ProtectThisBranchBanner {...args} />
          </CreateBranchButtonOptionProvider>
        </CurrentRepositoryProvider>
      </Wrapper>
    )
  },
}

export default meta
