import type {Meta, StoryObj} from '@storybook/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {ScreenSizeProvider} from '@github-ui/screen-size'
import {getBranches, getOverviewRoutePayload} from '../test-utils/mock-data'
import BranchDescription from './BranchDescription'

const branch = getBranches()[0]!

const meta: Meta<typeof BranchDescription> = {
  title: 'Repo Branches/Components/BranchDescription',
  component: BranchDescription,
  args: {
    ...branch,
    rulesetsPath: '#fakeLink',
  },
}

export const Default: StoryObj<typeof BranchDescription> = {
  render: args => {
    const routePayload = getOverviewRoutePayload()
    return (
      <Wrapper routePayload={routePayload}>
        <ScreenSizeProvider>
          <BranchDescription {...branch} {...args} sx={{mt: 4}} />
        </ScreenSizeProvider>
      </Wrapper>
    )
  },
}

export default meta
