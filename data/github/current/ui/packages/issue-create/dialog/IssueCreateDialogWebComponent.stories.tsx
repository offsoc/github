import type {Meta} from '@storybook/react'
import {Button} from '@primer/react'
import {Suspense, useState} from 'react'
import {TopRepositories} from '@github-ui/item-picker/RepositoryPicker'
import {type OperationDescriptor, RelayEnvironmentProvider} from 'react-relay'
import {MockPayloadGenerator, createMockEnvironment} from 'relay-test-utils'
import {buildMockRepository} from '../__tests__/helpers'
import {VALUES} from '../constants/values'
import {RepositoryTemplates} from '../RepositoryAndTemplatePickerDialog'
import {CreateIssueModal} from './IssueCreateDialogWebComponent'

const environment = createMockEnvironment()

function EntryPoint() {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="...Loading">
        <TestComponent />
      </Suspense>
    </RelayEnvironmentProvider>
  )
}

function TestComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(!isOpen)}>Click to create a new issue</Button>
      {isOpen && <CreateIssueModal key={'1234'} />}
    </>
  )
}

const meta = {
  title: 'Shared Components/IssueCreateModal',
  component: TestComponent,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof EntryPoint>

export default meta

export const CreateIssueDialogEntryExample = {
  args: {},
  render: () => {
    const mockedRepos = [
      buildMockRepository({owner: 'orgA', name: 'repoA'}),
      buildMockRepository({owner: 'orgA', name: 'repoB'}),
      buildMockRepository({owner: 'orgB', name: 'repoC'}),
    ]

    environment.mock.queuePendingOperation(TopRepositories, {
      topRepositoriesFirst: VALUES.repositoriesPreloadCount,
      hasIssuesEnabled: true,
    })
    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      return MockPayloadGenerator.generate(operation, {
        RepositoryConnection() {
          return {
            edges: [{node: mockedRepos[0]}, {node: mockedRepos[1]}, {node: mockedRepos[2]}],
          }
        },
      })
    })

    for (const repository of mockedRepos) {
      environment.mock.queuePendingOperation(RepositoryTemplates, {id: repository.id})
      environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
        return MockPayloadGenerator.generate(operation, {
          Query() {
            return {node: repository}
          },
        })
      })
    }

    return <EntryPoint />
  },
}
