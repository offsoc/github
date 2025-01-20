import {fireEvent, render, screen} from '@testing-library/react'
import {getInitialIndexedRepos, resolveRepoSearch} from '../test-utils/mock-data'
import {RepoSelectionDialog, type RepoSelectionDialogProps} from '../components/RepoSelectionDialog'
import {RelayEnvironmentProvider, type Environment} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'

const onClose = jest.fn()
const onSubmit = jest.fn()

const defaultProps = {
  onClose,
  onSubmit,
  indexedRepos: getInitialIndexedRepos(),
  processing: false,
  quotaRemaining: 5,
  currentOrg: 'mona',
}

describe('RepoSelectionDialog', () => {
  const environment = createMockEnvironment()

  test('Shows repos', async () => {
    renderDialog({...defaultProps}, environment)
    resolveRepoSearch(environment)
    await screen.findByText('mona/unindexed repo1', {exact: false})

    expect(screen.getByText('mona/unindexed repo1')).toBeInTheDocument()
    expect(screen.getByText('mona/unindexed repo2')).toBeInTheDocument()
  })

  test('Submits selected repos', async () => {
    renderDialog({...defaultProps}, environment)
    resolveRepoSearch(environment)
    await screen.findByText('mona/unindexed repo1', {exact: false})

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0]!)
    fireEvent.click(checkboxes[1]!)
    fireEvent.click(screen.getByText('Apply'))
    expect(onSubmit).toHaveBeenCalledWith([
      {description: 'unindexed test repo1', id: 'unindexed-repo1', name: 'unindexed repo1', owner: 'mona'},
      {description: 'unindexed test repo2', id: 'unindexed-repo2', name: 'unindexed repo2', owner: 'mona'},
    ])
  })

  test('Will not allow selecting past remaining quota', async () => {
    renderDialog({...defaultProps, quotaRemaining: 1}, environment)
    resolveRepoSearch(environment)
    await screen.findByText('mona/unindexed repo1', {exact: false})

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0]!)
    fireEvent.click(checkboxes[1]!)
    expect(screen.getAllByRole('button')[2]).toBeDisabled()
  })

  test('Calls onClose', async () => {
    renderDialog({...defaultProps}, environment)

    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })
})

const renderDialog = (props: JSX.IntrinsicAttributes & RepoSelectionDialogProps, environment: Environment) => {
  render(
    <RelayEnvironmentProvider environment={environment}>
      <RepoSelectionDialog {...props} />)
    </RelayEnvironmentProvider>,
  )
}
