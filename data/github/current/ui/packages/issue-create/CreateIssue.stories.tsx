import type {Meta, StoryObj} from '@storybook/react'
import {MockPayloadGenerator, createMockEnvironment} from 'relay-test-utils'
import {CreateIssue} from './CreateIssue'
import {CreateIssueTestComponent} from './test-utils/CreateIssueTestComponent'
import {Box} from '@primer/react'
import {buildMockRepository, type MockRepository} from './__tests__/helpers'
import {TopRepositories} from '@github-ui/item-picker/RepositoryPicker'
import type {OperationDescriptor} from 'relay-runtime'
import {RepositoryTemplates} from './RepositoryAndTemplatePickerDialog'

type Story = StoryObj<typeof CreateIssueTestComponent>

const meta = {
  title: 'IssueCreate',
  component: CreateIssue,
} satisfies Meta<typeof CreateIssue>

const repositories: MockRepository[] = [
  buildMockRepository({owner: 'orgA', name: 'repoA', hasSecurityPolicy: true, viewerCanWrite: true}),
  buildMockRepository({owner: 'orgA', name: 'repoB', hasSecurityPolicy: false, viewerCanWrite: false}),
  buildMockRepository({owner: 'orgBB', name: 'repoC'}),
  buildMockRepository({owner: 'orgBB', name: 'repoD', noTemplates: true, viewerCanWrite: true}),
  buildMockRepository({owner: 'orgC', name: 'repoE', hasIssuesEnabled: false}),
]

export const CreateIssueStory: Story = (function () {
  const environment = createMockEnvironment()

  return {
    argTypes: {},
    args: {
      environment,
    },
    render: args => {
      return (
        <Box sx={{m: 3, p: 3, border: '1px solid', borderColor: 'border.default'}}>
          <CreateIssueTestComponent environment={args.environment} />
        </Box>
      )
    },
    play: () => {
      environment.mock.queuePendingOperation(TopRepositories, {topRepositoriesFirst: 10, hasIssuesEnabled: true})
      environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
        return MockPayloadGenerator.generate(operation, {
          RepositoryConnection() {
            return {
              edges: [
                {node: repositories[0]},
                {node: repositories[1]},
                {node: repositories[2]},
                {node: repositories[3]},
              ],
            }
          },
        })
      })

      for (const repository of repositories) {
        environment.mock.queuePendingOperation(RepositoryTemplates, {id: repository.id})
        environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
          return MockPayloadGenerator.generate(operation, {
            Query() {
              return {node: repository}
            },
          })
        })
      }
    },
  }
})()

export default meta
