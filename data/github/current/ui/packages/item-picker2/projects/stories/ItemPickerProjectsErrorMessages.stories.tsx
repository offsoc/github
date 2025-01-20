import {Button} from '@primer/react'
import type {Meta} from '@storybook/react'
import type {RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {useRef, useState} from 'react'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {graphql} from 'relay-runtime'

import type {ItemPickerProjectsProps} from '../ItemPickerProjects'
import {ItemPickerProjects} from '../ItemPickerProjects'
import type {SubmittedProject} from '../types'
import {MockProjectV2, mockProjectsResolvers} from '../__tests__/helper'

import type {ItemPickerProjectsErrorMessagesQuery} from './__generated__/ItemPickerProjectsErrorMessagesQuery.graphql'
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
  rootQuery: ItemPickerProjectsErrorMessagesQuery
  listQuery: ItemPickerProjectsList_Query
}

const repositoryProjectsV2Count = 2
const repositoryClassicProjectsCount = 2
const organizationProjectsV2Count = 2
const selectedProjectsV2Count = 1
const selectedClassicProjectsCount = 1
const totalRepositoryProjectsV2Count = 1200
export const WarningMaxItems = {
  name: 'Max Items Warning',
  decorators: [relayDecorator<typeof ItemPickerProjects, ItemPickerProjectsTestQueries>],
  parameters: {
    relay: {
      environment,
      queries: {
        rootQuery: {
          type: 'fragment',
          query: graphql`
            query ItemPickerProjectsErrorMessagesQuery($owner: String!, $repo: String!, $number: Int!)
            @relay_test_operation {
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
      },
      mockResolvers: mockProjectsResolvers(
        repositoryProjectsV2Count,
        repositoryClassicProjectsCount,
        organizationProjectsV2Count,
        0,
        selectedProjectsV2Count,
        selectedClassicProjectsCount,
        totalRepositoryProjectsV2Count,
      ),
      mapStoryArgs: ({queryData}) => {
        return {
          selectedProjectsV2Key: queryData.rootQuery.repository!.issue!.projectsV2,
          selectedClassicProjectCardsKey: queryData.rootQuery.repository!.issue!.projectCards,
          open: false,
          ...defaultArgs,
        } as ItemPickerProjectsProps
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerProjects, ItemPickerProjectsTestQueries>
