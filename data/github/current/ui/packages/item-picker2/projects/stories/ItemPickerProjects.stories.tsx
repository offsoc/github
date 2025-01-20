import {Button} from '@primer/react'
import type {Meta} from '@storybook/react'
import type {RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {useRef, useState} from 'react'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {graphql} from 'relay-runtime'
import type {LazyQueryOptions, QueryOptions} from '@github-ui/relay-test-utils/RelayTestFactories'

import {MockProjectV2, mockProjectsResolvers} from '../__tests__/helper'
import type {SubmittedProject} from '../types'
import type {ItemPickerProjectsProps} from '../ItemPickerProjects'
import {ItemPickerProjects} from '../ItemPickerProjects'

import type {ItemPickerProjectsStoryQuery as ItemPickerProjectsStoryQueryType} from './__generated__/ItemPickerProjectsStoryQuery.graphql'
import type {ItemPickerProjectsList_Query} from '../__generated__/ItemPickerProjectsList_Query.graphql'

const {environment} = createRelayMockEnvironment()

const meta = {
  title: 'Recipes/ItemPicker/ItemPickerProjects',
  component: Example,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    title: {control: 'text'},
    maxSelectableItems: {control: 'number'},
    selectionVariant: {control: 'select', options: ['instant', 'single', 'multiple']},
  },
} satisfies Meta<typeof ItemPickerProjects>

export default meta

const defaultArgs: Partial<ItemPickerProjectsProps> = {
  title: 'Apply projects to this issue',
  includeClassicProjects: true,
}

function Example(props: ItemPickerProjectsProps) {
  const projectsButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<boolean>(false)
  const {id, ...additionalInfo} = MockProjectV2(0)
  const [storySelectedProjects, setStorySelectedProjects] = useState<SubmittedProject[]>([{id, additionalInfo}])

  return (
    <>
      <Button
        ref={projectsButtonRef}
        onClick={() => {
          setOpen(!open)
        }}
      >
        Edit Button
      </Button>

      <ItemPickerProjects
        {...props}
        projectsButtonRef={projectsButtonRef}
        open={open}
        setOpen={setOpen}
        onSubmit={setStorySelectedProjects}
        owner="github"
        repo="github"
      />

      <hr />

      <pre>
        <code>{JSON.stringify(storySelectedProjects, null, 2)}</code>
      </pre>
    </>
  )
}

type ItemPickerProjectsTestQueries = {
  rootQuery: ItemPickerProjectsStoryQueryType
  listQuery: ItemPickerProjectsList_Query
}

const itemPickerProjectsStoryQuery = graphql`
  query ItemPickerProjectsStoryQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
    repository(owner: $owner, name: $repo) {
      issue(number: $number) {
        projectsV2(first: 10) {
          ...ItemPickerProjects_SelectedProjectsV2Fragment
        }
        projectCards(first: 10) {
          ...ItemPickerProjects_SelectedClassicProjectCardsFragment
        }
      }
    }
  }
`

const queries: {
  rootQuery: QueryOptions<ItemPickerProjectsStoryQueryType>
  listQuery: LazyQueryOptions
} = {
  rootQuery: {
    type: 'fragment',
    query: itemPickerProjectsStoryQuery,
    variables: {owner: 'owner', repo: 'repo', number: 1},
  },
  listQuery: {
    type: 'lazy',
  },
}

export const Playground = {
  decorators: [relayDecorator<typeof ItemPickerProjects, ItemPickerProjectsTestQueries>],
  parameters: {
    relay: {
      environment,
      queries,
      mockResolvers: mockProjectsResolvers(),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedProjectsV2Key: queryData.rootQuery.repository!.issue!.projectsV2,
          selectedClassicProjectCardsKey: queryData.rootQuery.repository!.issue!.projectCards,
          ...defaultArgs,
        } as ItemPickerProjectsProps
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerProjects, ItemPickerProjectsTestQueries>

export const Loading = {
  decorators: [
    Story => (
      <>
        <p>
          If you are coming from another Item Picker Projects story, please refresh the page to see the loading skeleton
        </p>
        <Story />
      </>
    ),
    relayDecorator<typeof ItemPickerProjects, {rootQuery: ItemPickerProjectsStoryQueryType}>,
  ],
  parameters: {
    relay: {
      environment,
      queries: {
        rootQuery: {
          type: 'fragment',
          query: itemPickerProjectsStoryQuery,
          variables: {owner: 'owner', repo: 'repo', number: 1},
        },
      },
      mockResolvers: mockProjectsResolvers(),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedProjectsV2Key: queryData.rootQuery.repository!.issue!.projectsV2,
          selectedClassicProjectCardsKey: queryData.rootQuery.repository!.issue!.projectCards,
          ...defaultArgs,
        } as ItemPickerProjectsProps
      },
    },
  },
} satisfies RelayStoryObj<
  typeof ItemPickerProjects,
  {
    rootQuery: ItemPickerProjectsStoryQueryType
  }
>
