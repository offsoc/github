import {render} from '@github-ui/react-core/test-utils'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {act, fireEvent, screen} from '@testing-library/react'
import {useQueryLoader} from 'react-relay'
import type {OperationDescriptor} from 'relay-runtime'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {VALUES} from '../../constants/values'
import HyperlistAppWrapper from '../../test-utils/HyperlistAppWrapper'
import {IssueCreatePane} from '../issue-new/IssueCreatePane'
import {CurrentRepository, TopRepositories} from '@github-ui/item-picker/RepositoryPicker'
import type {RepositoryPickerCurrentRepoQuery} from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'
import type {RepositoryPickerTopRepositoriesQuery} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'

const navigateFn = jest.fn()

jest.mock('@github-ui/use-navigate', () => ({
  useNavigate: () => navigateFn,
}))

const IssueCreatePaneTestWrapper = () => {
  const [currentRepo, loadCurrentRepo, disposeCurrentRepo] =
    useQueryLoader<RepositoryPickerCurrentRepoQuery>(CurrentRepository)
  const [topRepos, loadTopRepos, disposeTopRepos] =
    useQueryLoader<RepositoryPickerTopRepositoriesQuery>(TopRepositories)

  return (
    <IssueCreatePane
      currentRepoQueryRef={currentRepo}
      loadCurrentRepo={loadCurrentRepo}
      disposeCurrentRepo={disposeCurrentRepo}
      topReposQueryRef={topRepos}
      loadTopRepos={loadTopRepos}
      disposeTopRepos={disposeTopRepos}
    />
  )
}

test('clicking save issue will navigate to new issue', async () => {
  const environment = createMockEnvironment()

  render(
    <HyperlistAppWrapper environment={environment}>
      <IssueCreatePaneTestWrapper />
    </HyperlistAppWrapper>,
  )

  await act(async () => {
    environment.mock.resolveMostRecentOperation((operation: OperationDescriptor) => {
      expect(operation.request.node.operation.name).toBe('RepositoryPickerTopRepositoriesQuery')
      expect(operation.request.variables).toEqual({
        topRepositoriesFirst: VALUES.repositoriesPreloadCount,
        hasIssuesEnabled: true,
        owner: null,
      })
      return MockPayloadGenerator.generate(operation, {
        Repository: () => ({
          id: 'R_1',
          databaseId: '1',
          name: 'repository',
          nameWithOwner: 'organization/repository',
          owner: {
            login: 'organization',
          },
          isPrivate: false,
          isArchived: false,
          hasIssuesEnabled: true,
          slashCommandsEnabled: false,
          viewerCanPush: true,
          templateTreeUrl: 'template-url',
          viewerIssueCreationPermissions: {
            labelable: true,
            milestoneable: true,
            assignable: true,
            triageable: true,
            typeable: true,
          },
        }),
      })
    })
  })

  expect(screen.getByText('Create new issue')).toBeInTheDocument()

  // We also see the repository selector
  expect(screen.getByRole('button', {name: 'Select repository'})).toBeInTheDocument()

  await act(async () => {
    environment.mock.resolveMostRecentOperation((operation: OperationDescriptor) => {
      expect(operation.request.node.operation.name).toBe('RepositoryAndTemplatePickerDialogQuery')
      expect(operation.request.variables).toEqual({
        id: 'R_1',
      })
      return MockPayloadGenerator.generate(operation, {
        Repository: () => ({
          id: 'R_1',
        }),
      })
    })
  })

  // Choose template
  const blankTemplateButton = screen.getByRole('link', {name: /Blank issue/i})

  act(() => blankTemplateButton.click())
  // Fill required fields
  const titleInput = screen.getByLabelText('Add a title')
  fireEvent.change(titleInput, {target: {value: 'test title'}})

  expect(ssrSafeLocation.search).toBe('?org=organization&repo=repository&template=Blank+issue')

  // Create issue
  const saveButton = screen.getByRole('button', {name: /create/i})

  navigateFn.mockClear()
  act(() => {
    saveButton.click()

    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Issue: () => ({
          id: 'I_1',
          number: 1,
          title: 'test title',
          url: 'issue1-url',
          repository: {
            name: 'repository',
            owner: {
              login: 'organization',
            },
          },
        }),
      }),
    )
  })

  expect(navigateFn).toHaveBeenCalledWith('/organization/repository/issues/1')
})
