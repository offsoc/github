import {Button} from '@primer/react'
import type {Meta} from '@storybook/react'
import type {RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {useEffect, useRef, useState} from 'react'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {graphql} from 'relay-runtime'
import type {LazyQueryOptions, QueryOptions} from '@github-ui/relay-test-utils/RelayTestFactories'

import {MockProjectV2, mockProjectsResolvers} from '../../projects/__tests__/helper'
import type {SubmittedProject} from '../../projects/types'
import {ItemPickerProjects} from '../../projects/ItemPickerProjects'
import type {ItemPickerProjectsProps} from '../../projects/ItemPickerProjects'

import type {ItemPickerProjectsList_Query} from '../../projects/__generated__/ItemPickerProjectsList_Query.graphql'
import type {ErrorMessagesQuery} from './__generated__/ErrorMessagesQuery.graphql'

const {environment} = createRelayMockEnvironment()

const meta = {
  title: 'Recipes/ItemPicker/Common Features',
  component: Example,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    title: {control: 'text'},
  },
} satisfies Meta<typeof ItemPickerProjects>

export default meta

const defaultArgs: Partial<ItemPickerProjectsProps> = {
  title: 'Apply projects to this issue',
  includeClassicProjects: true,
}

function InnerComponent() {
  useEffect(() => {
    throw new Error('Intentional error in InnerComponent')
  })

  return <span />
}

function Example(props: ItemPickerProjectsProps) {
  const projectsButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<boolean>(false)
  const {id, ...additionalInfo} = MockProjectV2(0)
  const [, setStorySelectedProjects] = useState<SubmittedProject[]>([{id, additionalInfo}])

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
    </>
  )
}

type ItemPickerProjectsTestQueries = {
  rootQuery: ErrorMessagesQuery
  listQuery: ItemPickerProjectsList_Query
}

const queries: {
  rootQuery: QueryOptions<ErrorMessagesQuery>
  listQuery: LazyQueryOptions
} = {
  rootQuery: {
    type: 'fragment',
    query: graphql`
      query ErrorMessagesQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
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
    `,
    variables: {owner: 'owner', repo: 'repo', number: 1},
  },
  listQuery: {
    type: 'lazy',
  },
}

export const ErrorMessageProp = {
  name: 'Prop hasError',
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
          hasError: true,
          ...defaultArgs,
        } as ItemPickerProjectsProps
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerProjects, ItemPickerProjectsTestQueries>

export const ErrorMessageFull = {
  name: 'Full Panel Error',
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
          children: <InnerComponent />,
          ...defaultArgs,
        } as ItemPickerProjectsProps
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerProjects, ItemPickerProjectsTestQueries>

export const ErrorMessageInline = {
  name: 'Inline Error',
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
          initialFilterQuery: 'memex',
          children: <InnerComponent />,
          ...defaultArgs,
        } as ItemPickerProjectsProps
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerProjects, ItemPickerProjectsTestQueries>
