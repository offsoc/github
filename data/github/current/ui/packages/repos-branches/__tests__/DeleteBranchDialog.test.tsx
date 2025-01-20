import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {DeleteBranchDialog} from '../components/DeleteBranchDialog'
import {getBranches, getPullRequest, getRepository} from '../test-utils/mock-data'

test('renders DeleteBranchDialog', () => {
  render(
    <DeleteBranchDialog
      showModal={true}
      setShowModal={() => {}}
      setDeleting={() => {}}
      branchName={getBranches()[0]!.name}
      deletedBranches={[]}
      onDeletedBranchesChange={() => {}}
      pullRequest={getPullRequest()}
      repo={getRepository()}
    />,
  )

  expect(screen.getByRole('dialog', {name: 'Delete branch'})).toBeVisible()
  expect(screen.getByRole('heading', {name: 'Delete branch'})).toBeVisible()
  expect(screen.getByRole('button', {name: 'Close'})).toBeVisible()
  expect(screen.getByRole('button', {name: 'Cancel'})).toBeVisible()
  expect(screen.getByRole('button', {name: 'Delete'})).toBeVisible()
  expect(screen.getByRole('link', {name: '#12345 - Update README.md'})).toBeVisible()
})
