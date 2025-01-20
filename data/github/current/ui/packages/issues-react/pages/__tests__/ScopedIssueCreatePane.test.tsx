import {buildMockRepository} from '@github-ui/issue-create/__tests__/helpers'
import {render} from '@github-ui/react-core/test-utils'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {screen} from '@testing-library/react'
import {useQueryLoader} from 'react-relay'
import type {OperationDescriptor} from 'relay-runtime'
import {MockPayloadGenerator} from 'relay-test-utils'

import HyperlistAppWrapper from '../../test-utils/HyperlistAppWrapper'
import {IssueCreatePane} from '../issue-new/IssueCreatePane'
import {CurrentRepository} from '@github-ui/item-picker/RepositoryPicker'
import type {RepositoryPickerCurrentRepoQuery} from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'

jest.setTimeout(5000)

jest.mock('@github-ui/ssr-utils', () => ({
  get ssrSafeLocation() {
    return jest.fn().mockImplementation(() => {
      return {origin: 'https://github.localhost', search: '', pathname: '/cool-org/cool-repo/issues/new'}
    })()
  },
}))

const mockRepository = buildMockRepository({
  owner: 'cool-org',
  name: 'cool-repo',
})

function setupRelayEnvironment() {
  const {environment} = createRelayMockEnvironment()

  environment.mock.queuePendingOperation(CurrentRepository, {
    owner: mockRepository.owner.login,
    name: mockRepository.name,
    includeTemplates: true,
  })

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Repository: () => mockRepository,
    })
  })

  return environment
}

const IssueCreatePaneTestWrapper = () => {
  const [currentRepo, loadCurrentRepo, disposeCurrentRepo] =
    useQueryLoader<RepositoryPickerCurrentRepoQuery>(CurrentRepository)

  return (
    <IssueCreatePane
      currentRepoQueryRef={currentRepo}
      loadCurrentRepo={loadCurrentRepo}
      disposeCurrentRepo={disposeCurrentRepo}
    />
  )
}

test('having a prefined scoped repository in the URL hides repository picker', async () => {
  const environment = setupRelayEnvironment()

  render(
    <HyperlistAppWrapper environment={environment}>
      <IssueCreatePaneTestWrapper />
    </HyperlistAppWrapper>,
  )

  expect(screen.getByText('Create new issue')).toBeInTheDocument()
  expect(screen.queryByRole('button', {name: 'Select repository'})).not.toBeInTheDocument()
  expect(screen.getByText('Add a title')).toBeInTheDocument()
})
