import {Button} from '@primer/react'
import type {Meta} from '@storybook/react'
import type {RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {useRef, useState} from 'react'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {graphql} from 'relay-runtime'

import {MockBranch, MockPullRequest, mockPullRequestsAndBranchesResolvers} from '../__tests__/helper'
import type {SubmittedPullRequestOrBranch} from '../types'
import type {ItemPickerPullRequestsAndBranchesProps} from '../ItemPickerPullRequestsAndBranches'
import {ItemPickerPullRequestsAndBranches} from '../ItemPickerPullRequestsAndBranches'

import type {ItemPickerPullRequestsAndBranchesStoryQuery as ItemPickerPullRequestsAndBranchesStoryQueryType} from './__generated__/ItemPickerPullRequestsAndBranchesStoryQuery.graphql'

const {environment} = createRelayMockEnvironment()

const meta = {
  title: 'Recipes/ItemPicker/ItemPickerPullRequestsAndBranches',
  component: Example,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    title: {control: 'text'},
    maxSelectableItems: {control: 'number'},
    selectionVariant: {control: 'select', options: ['instant', 'single']},
  },
} satisfies Meta<typeof ItemPickerPullRequestsAndBranches>

export default meta

const defaultArgs: Partial<ItemPickerPullRequestsAndBranchesProps> = {
  title: 'Apply pull request or branch to this issue',
}

function Example(props: ItemPickerPullRequestsAndBranchesProps) {
  const PullRequestsAndBranchesButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<boolean>(false)
  const {id: prId, ...prAdditionalInfo} = MockPullRequest(0)
  const {id: branchId, ...branchAdditionalInfo} = MockBranch(0)
  const [storySelectedPullRequestsAndBranches, setStorySelectedPullRequestsAndBranches] = useState<
    SubmittedPullRequestOrBranch[]
  >([
    {id: prId, additionalInfo: prAdditionalInfo},
    {id: branchId, additionalInfo: branchAdditionalInfo},
  ])

  return (
    <>
      <Button
        ref={PullRequestsAndBranchesButtonRef}
        onClick={() => {
          setOpen(!open)
        }}
      >
        Edit Button
      </Button>

      <ItemPickerPullRequestsAndBranches
        {...props}
        buttonRef={PullRequestsAndBranchesButtonRef}
        open={open}
        setOpen={setOpen}
        onSubmit={setStorySelectedPullRequestsAndBranches}
        owner="github"
        repo="github"
      />

      <hr />

      <pre>
        <code>{JSON.stringify(storySelectedPullRequestsAndBranches, null, 2)}</code>
      </pre>
    </>
  )
}

type ItemPickerPullRequestsAndBranchesTestQueries = {
  rootQuery: ItemPickerPullRequestsAndBranchesStoryQueryType
  // listQuery: ItemPickerPullRequestsAndBranchesList_Query
}

const ItemPickerPullRequestsAndBranchesStoryQuery = graphql`
  query ItemPickerPullRequestsAndBranchesStoryQuery($owner: String!, $repo: String!, $number: Int!)
  @relay_test_operation {
    repository(owner: $owner, name: $repo) {
      issue(number: $number) {
        linkedBranches(first: 10) {
          ...ItemPickerPullRequestsAndBranches_SelectedBranchesFragment
        }
        linkedPullRequests: closedByPullRequestsReferences(first: 10, includeClosedPrs: false, orderByState: true) {
          ...ItemPickerPullRequestsAndBranches_SelectedPullRequestsFragment
        }
      }
    }
  }
`

export const Playground = {
  decorators: [relayDecorator<typeof ItemPickerPullRequestsAndBranches, ItemPickerPullRequestsAndBranchesTestQueries>],
  parameters: {
    relay: {
      environment,
      queries: {
        rootQuery: {
          type: 'fragment',
          query: ItemPickerPullRequestsAndBranchesStoryQuery,
          variables: {owner: 'owner', repo: 'repo', number: 1},
        },
      },
      mockResolvers: mockPullRequestsAndBranchesResolvers(),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedBranchesKey: queryData.rootQuery.repository!.issue!.linkedBranches,
          selectedPullRequestsKey: queryData.rootQuery.repository!.issue!.linkedPullRequests,
          ...defaultArgs,
        } as ItemPickerPullRequestsAndBranchesProps
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerPullRequestsAndBranches, ItemPickerPullRequestsAndBranchesTestQueries>

export const Loading = {
  decorators: [
    Story => (
      <>
        <p>
          If you are coming from another Item Picker PullRequestsAndBranches story, please refresh the page to see the
          loading skeleton
        </p>
        <Story />
      </>
    ),
    relayDecorator<
      typeof ItemPickerPullRequestsAndBranches,
      {rootQuery: ItemPickerPullRequestsAndBranchesStoryQueryType}
    >,
  ],
  parameters: {
    relay: {
      environment,
      queries: {
        rootQuery: {
          type: 'fragment',
          query: ItemPickerPullRequestsAndBranchesStoryQuery,
          variables: {owner: 'owner', repo: 'repo', number: 1},
        },
      },
      mockResolvers: mockPullRequestsAndBranchesResolvers(),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedBranchesKey: queryData.rootQuery.repository!.issue!.linkedBranches,
          selectedPullRequestsKey: queryData.rootQuery.repository!.issue!.linkedPullRequests,
          ...defaultArgs,
        } as ItemPickerPullRequestsAndBranchesProps
      },
    },
  },
} satisfies RelayStoryObj<
  typeof ItemPickerPullRequestsAndBranches,
  {
    rootQuery: ItemPickerPullRequestsAndBranchesStoryQueryType
  }
>
