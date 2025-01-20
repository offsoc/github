import type {Meta, StoryObj} from '@storybook/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {getPullRequest, getOverviewRoutePayload, getRepository} from '../test-utils/mock-data'
import PullRequestLabel from './PullRequestLabel'

const meta: Meta<typeof PullRequestLabel> = {
  title: 'Repo Branches/Components/PullRequestLabel',
  component: PullRequestLabel,
}

export const Default: StoryObj<typeof PullRequestLabel> = {
  args: {
    repo: getRepository(),
    pullRequest: getPullRequest(),
  },
  render: args => {
    const routePayload = getOverviewRoutePayload()
    return (
      <Wrapper routePayload={routePayload}>
        <PullRequestLabel {...args} />
      </Wrapper>
    )
  },
}

export default meta
