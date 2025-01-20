import {Button} from '@primer/react'
import type {Meta} from '@storybook/react'
import type {RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {useRef, useState} from 'react'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {graphql} from 'relay-runtime'

import {MockMilestone, mockMilestonesResolvers} from '../__tests__/helper'
import type {SubmittedMilestone} from '../types'
import type {ItemPickerMilestonesProps} from '../ItemPickerMilestones'
import {ItemPickerMilestones} from '../ItemPickerMilestones'

import type {ItemPickerMilestonesStoryQuery as ItemPickerMilestonesStoryQueryType} from './__generated__/ItemPickerMilestonesStoryQuery.graphql'
import type {MilestoneState} from '../__generated__/ItemPickerMilestones_SelectedMilestoneFragment.graphql'
import type {ItemPickerMilestonesList_Query} from '../__generated__/ItemPickerMilestonesList_Query.graphql'

const {environment} = createRelayMockEnvironment()

const meta = {
  title: 'Recipes/ItemPicker/ItemPickerMilestones',
  component: Example,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
    selectionVariant: {control: 'select', options: ['instant', 'single']},
  },
  argTypes: {
    title: {control: 'text'},
  },
} satisfies Meta<typeof ItemPickerMilestones>

export default meta

const defaultArgs: Partial<ItemPickerMilestonesProps> = {
  title: 'Apply a milestone to this issue',
}

function Example(props: ItemPickerMilestonesProps) {
  const milestonesButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<boolean>(false)
  const {id, ...additionalInfo} = MockMilestone(0)
  const [storySelectedMilestone, setStorySelectedMilestone] = useState<SubmittedMilestone | null>({
    id,
    additionalInfo: {title: additionalInfo.title, state: additionalInfo.state as MilestoneState},
  })

  return (
    <>
      <Button
        ref={milestonesButtonRef}
        onClick={() => {
          setOpen(!open)
        }}
      >
        Edit Button
      </Button>

      <ItemPickerMilestones
        {...props}
        milestonesButtonRef={milestonesButtonRef}
        open={open}
        setOpen={setOpen}
        onSubmit={setStorySelectedMilestone}
      />

      <hr />

      <pre>
        <code>{JSON.stringify(storySelectedMilestone, null, 2)}</code>
      </pre>
    </>
  )
}

type ItemPickerMilestonesTestQueries = {
  rootQuery: ItemPickerMilestonesStoryQueryType
  listQuery: ItemPickerMilestonesList_Query
}

const itemPickerMilestonesStoryQuery = graphql`
  query ItemPickerMilestonesStoryQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
    repository(owner: $owner, name: $repo) {
      issue(number: $number) {
        milestone {
          ...ItemPickerMilestones_SelectedMilestoneFragment
        }
      }
    }
  }
`

export const Playground = {
  decorators: [relayDecorator<typeof ItemPickerMilestones, ItemPickerMilestonesTestQueries>],
  parameters: {
    relay: {
      environment,
      queries: {
        rootQuery: {
          type: 'fragment',
          query: itemPickerMilestonesStoryQuery,
          variables: {owner: 'owner', repo: 'repo', number: 1},
        },
        listQuery: {
          type: 'lazy',
        },
      },
      mockResolvers: mockMilestonesResolvers(),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedMilestonesKey: queryData.rootQuery.repository!.issue!.milestone,
          ...defaultArgs,
        } as ItemPickerMilestonesProps
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerMilestones, ItemPickerMilestonesTestQueries>

export const Loading = {
  decorators: [
    Story => (
      <>
        <p>
          If you are coming from another Item Picker Milestones story, please refresh the page to see the loading
          skeleton
        </p>
        <Story />
      </>
    ),
    relayDecorator<typeof ItemPickerMilestones, {rootQuery: ItemPickerMilestonesStoryQueryType}>,
  ],
  parameters: {
    relay: {
      environment,
      queries: {
        rootQuery: {
          type: 'fragment',
          query: itemPickerMilestonesStoryQuery,
          variables: {owner: 'owner', repo: 'repo', number: 1},
        },
      },
      mockResolvers: mockMilestonesResolvers(),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedMilestonesKey: queryData.rootQuery.repository!.issue!.milestone,
          ...defaultArgs,
        } as ItemPickerMilestonesProps
      },
    },
  },
} satisfies RelayStoryObj<
  typeof ItemPickerMilestones,
  {
    rootQuery: ItemPickerMilestonesStoryQueryType
  }
>
