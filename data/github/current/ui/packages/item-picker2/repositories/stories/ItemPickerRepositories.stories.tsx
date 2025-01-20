import {Button} from '@primer/react'
import type {Meta} from '@storybook/react'
import type {RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {useRef, useState} from 'react'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'

import {mockRepositoriesResolvers} from '../__tests__/helper'
import type {SubmittedRepository} from '../types'
import type {ItemPickerRepositoriesProps} from '../ItemPickerRepositories'
import {ItemPickerRepositories} from '../ItemPickerRepositories'
import type {ItemPickerRepositoriesList_Query} from '../__generated__/ItemPickerRepositoriesList_Query.graphql'

const {environment} = createRelayMockEnvironment()

const meta = {
  title: 'Recipes/ItemPicker/ItemPickerRepositories',
  component: Example,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    title: {control: 'text'},
    showTrailingVisual: {control: 'boolean'},
    selectionVariant: {control: 'select', options: ['instant', 'single']},
  },
} satisfies Meta<typeof ItemPickerRepositories>

export default meta

const defaultArgs: Partial<ItemPickerRepositoriesProps> = {
  title: 'Select repository to this issue',
  showTrailingVisual: false,
}

function Example(props: ItemPickerRepositoriesProps) {
  const repositoriesButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<boolean>(false)
  const [storySelectedRepositories, setStorySelectedRepositories] = useState<SubmittedRepository>()

  return (
    <>
      <Button
        ref={repositoriesButtonRef}
        onClick={() => {
          setOpen(!open)
        }}
      >
        Edit Button
      </Button>

      <ItemPickerRepositories
        {...props}
        repositoriesButtonRef={repositoriesButtonRef}
        open={open}
        setOpen={setOpen}
        onSubmit={setStorySelectedRepositories}
      />

      <hr />

      <pre>
        <code>{JSON.stringify(storySelectedRepositories, null, 2)}</code>
      </pre>
    </>
  )
}

type ItemPickerRepositoriesTestQueries = {
  listQuery: ItemPickerRepositoriesList_Query
}

export const Playground = {
  decorators: [relayDecorator<typeof ItemPickerRepositories, ItemPickerRepositoriesTestQueries>],
  parameters: {
    relay: {
      environment,
      queries: {
        listQuery: {
          type: 'lazy',
        },
      },
      mockResolvers: mockRepositoriesResolvers(),
      mapStoryArgs: () => {
        return {
          ...defaultArgs,
        } as ItemPickerRepositoriesProps
      },
    },
  },
} satisfies RelayStoryObj<typeof ItemPickerRepositories, ItemPickerRepositoriesTestQueries>
