import type {Meta} from '@storybook/react'
import {getExample, type TimelineEventNode} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {FallbackEvent} from '../../components/FallbackEvent'

const meta = {
  title: 'TimelineEvents/FallbackEvent',
  component: FallbackEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof FallbackEvent>

export default meta

export const Example = getExample([], {} as TimelineEventNode)
