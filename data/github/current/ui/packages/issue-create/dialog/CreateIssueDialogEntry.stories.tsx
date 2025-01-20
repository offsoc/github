import type {Meta} from '@storybook/react'
import {Button} from '@primer/react'
import {Suspense, useState} from 'react'
import {TopRepositories} from '@github-ui/item-picker/RepositoryPicker'
import {type OperationDescriptor, RelayEnvironmentProvider} from 'react-relay'
import {MockPayloadGenerator} from 'relay-test-utils'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {buildMockRepository} from '../__tests__/helpers'
import {getSafeConfig} from '../utils/option-config'
import {CreateIssueDialogEntry} from './CreateIssueDialogEntry'
import {VALUES} from '../constants/values'
import {RepositoryTemplates} from '../RepositoryAndTemplatePickerDialog'

const {environment} = createRelayMockEnvironment()

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
      <Button onClick={() => setIsOpen(!isOpen)}>Open Dialog</Button>
      {isOpen && (
        <CreateIssueDialogEntry
          navigate={url => alert(`Navigating to ${url}`)}
          onCreateSuccess={({issue, createMore}) =>
            alert(`Issue Created (createMore:${createMore}): ${JSON.stringify(issue)}`)
          }
          onCancel={() => setIsOpen(false)}
          optionConfig={getSafeConfig({storageKeyPrefix: 'prefix'})}
          isCreateDialogOpen={isOpen}
          setIsCreateDialogOpen={setIsOpen}
        />
      )}
    </>
  )
}

const meta = {
  title: 'Shared Components/IssueCreateDialog',
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
