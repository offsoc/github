import {render} from '@github-ui/react-core/test-utils'

import {noop} from '@github-ui/noop'
import {act, screen} from '@testing-library/react'
import {CurrentRepository, TopRepositories} from '@github-ui/item-picker/RepositoryPicker'
import {type OperationDescriptor, RelayEnvironmentProvider} from 'react-relay'
import {MockPayloadGenerator, createMockEnvironment} from 'relay-test-utils'
import {RepositoryTemplates} from '../RepositoryAndTemplatePickerDialog'
import {VALUES} from '../constants/values'
import {CreateIssueDialogEntry} from '../dialog/CreateIssueDialogEntry'
import {DisplayMode} from '../utils/display-mode'

type CreateIssueDialogTestWrapperType = {
  defaultDisplayMode?: DisplayMode
}

const CreateIssueDialogTestWrapper = ({
  defaultDisplayMode = DisplayMode.TemplatePicker,
}: CreateIssueDialogTestWrapperType) => {
  return (
    <CreateIssueDialogEntry
      isCreateDialogOpen={true}
      setIsCreateDialogOpen={noop}
      navigate={noop}
      onCreateSuccess={noop}
      onCancel={noop}
      optionConfig={{
        defaultDisplayMode,
        scopedRepository: {
          owner: 'owner',
          name: 'name',
          id: 'R_1',
        },
      }}
    />
  )
}

test('footer invisible on template selection', async () => {
  const environment = setupRelayEnvironment()

  render(
    <RelayEnvironmentProvider environment={environment}>
      <CreateIssueDialogTestWrapper />
    </RelayEnvironmentProvider>,
  )

  // Create should not be in the document
  expect(screen.queryByText('Create')).toBeNull()

  const blankTemplate = screen.getByRole('link', {name: /Blank issue/i})
  act(() => blankTemplate.click())

  expect(screen.getByText('Create')).toBeVisible()
})

test('skips template picker when default display mode is set to issue creation', async () => {
  const environment = setupRelayEnvironment()

  render(
    <RelayEnvironmentProvider environment={environment}>
      <CreateIssueDialogTestWrapper defaultDisplayMode={DisplayMode.IssueCreation} />
    </RelayEnvironmentProvider>,
  )

  expect(screen.getByText('Create')).toBeVisible()
})

function setupRelayEnvironment() {
  const environment = createMockEnvironment()
  environment.mock.queuePendingOperation(CurrentRepository, {
    owner: 'owner',
    name: 'name',
    includeTemplates: true,
  })
  environment.mock.queuePendingOperation(TopRepositories, {
    topRepositoriesFirst: VALUES.repositoriesPreloadCount,
    hasIssuesEnabled: true,
  })
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => MockPayloadGenerator.generate(operation))
  environment.mock.queuePendingOperation(RepositoryTemplates, {
    id: 'R_1',
  })
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => MockPayloadGenerator.generate(operation))

  return environment
}
