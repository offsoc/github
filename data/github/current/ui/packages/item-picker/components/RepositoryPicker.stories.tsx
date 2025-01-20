import type {Meta} from '@storybook/react'
import {RepositoryPicker, type RepositoryPickerProps, SearchRepositories, TopRepositories} from './RepositoryPicker'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'
import type {OperationDescriptor} from 'react-relay'
import {TestRepositoryPickerComponent, buildRepository} from '../test-utils/RepositoryPickerHelpers'

const meta = {
  title: 'ItemPicker/RepositoryPicker',
  component: RepositoryPicker,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    organization: {control: 'text', defaultValue: 'Hello, Storybook!'},
  },
} satisfies Meta<typeof RepositoryPicker>

export default meta

const defaultArgs: Partial<RepositoryPickerProps> = {
  organization: 'github',
}

export const RepositoryPickerExample = {
  args: {
    ...defaultArgs,
  },
  render: () => {
    const environment = createMockEnvironment()
    environment.mock.queuePendingOperation(TopRepositories, {topRepositoriesFirst: 10, hasIssuesEnabled: true})
    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      return MockPayloadGenerator.generate(operation, {
        RepositoryConnection() {
          return {
            edges: [
              {node: buildRepository({owner: 'orgA', name: 'repoA'})},
              {node: buildRepository({owner: 'orgA', name: 'repoB'})},
              {node: buildRepository({owner: 'orgB', name: 'repoC'})},
            ],
          }
        },
      })
    })

    environment.mock.queuePendingOperation(SearchRepositories, {searchQuery: 'search in:name archived:false'})
    for (let i = 0; i < 10; i++) {
      environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
        return MockPayloadGenerator.generate(operation, {
          SearchResultItemConnection() {
            return {
              nodes: [
                buildRepository({owner: 'orgB', name: 'repoA'}),
                buildRepository({owner: 'orgC', name: 'repoB'}),
                buildRepository({owner: 'orgA', name: 'repoC'}),
              ],
            }
          },
        })
      })
    }

    return (
      <>
        <TestRepositoryPickerComponent environment={environment} />
        <br />
        <p>The repository picker will query (+ preload) the viewer&apos;s top repositories and pick the first one.</p>
        <p>When entering text the picker uses the graphQL repo search endpoint.</p>
        <p>Note that searching is currently broken in storybook due to a bug in mock logic provided by relay</p>
      </>
    )
  },
}
