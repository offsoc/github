import type {Meta, StoryObj} from '@storybook/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
import MergeQueueLabel from './MergeQueueLabel'
import {getOverviewRoutePayload} from '../test-utils/mock-data'

const meta: Meta<typeof MergeQueueLabel> = {
  title: 'Repo Branches/Components/MergeQueueLabel',
  component: MergeQueueLabel,
  decorators: [
    Story => (
      <div style={{margin: '2em'}}>
        <Story />
      </div>
    ),
  ],
}

export const Default: StoryObj<typeof MergeQueueLabel> = {
  args: {
    queueCount: 10,
    mergeQueueUrl: 'http://github.localhost.com/monalisa/smile/queue',
  },
  render: args => {
    const routePayload = getOverviewRoutePayload()
    return (
      <Wrapper routePayload={routePayload}>
        <MergeQueueLabel {...args} />
      </Wrapper>
    )
  },
}

export default meta
