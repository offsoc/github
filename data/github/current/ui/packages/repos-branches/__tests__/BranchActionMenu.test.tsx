import {act, fireEvent, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {BranchActionMenu} from '../components/BranchActionMenu'
import {getBranches, getRepository} from '../test-utils/mock-data'
import {useState} from 'react'
import {mockFetch} from '@github-ui/mock-fetch'
import {branchesPath} from '@github-ui/paths'

const repo = getRepository()
const branch = getBranches()[0]!

const BranchActionMenuWrapper = () => {
  const [deletedBranches, setDeletedBranches] = useState<string[]>([])
  return (
    <BranchActionMenu
      repo={repo}
      branch={branch}
      oid="000"
      deletedAt=""
      deletedBranches={deletedBranches}
      onDeletedBranchesChange={setDeletedBranches}
    />
  )
}

test('renders BranchActionMenu', async () => {
  render(<BranchActionMenuWrapper />)

  const menuButton = screen.getByRole('button', {name: 'Branch menu'})
  expect(menuButton).toBeVisible()
  fireEvent.click(menuButton)

  expect(screen.getByRole('menuitem', {name: 'Rename branch'})).toBeVisible()

  const deleteButton = screen.getByRole('button', {name: 'Delete branch'})
  expect(deleteButton).toBeVisible()
  fireEvent.click(deleteButton)
  await act(() => {
    mockFetch.resolvePendingRequest(`${branchesPath({repo})}/${encodeURIComponent(branch.name)}`, {})
  })

  const restoreButton = screen.getByRole('button', {name: 'Restore'})
  expect(restoreButton).toBeVisible()
})

test('renders BranchActionMenu for non-collaborator', () => {
  repo.currentUserCanPush = false

  render(<BranchActionMenu repo={repo} branch={branch} deletedBranches={[]} onDeletedBranchesChange={() => {}} />)

  const menuButton = screen.getByRole('button', {name: 'Branch menu'})
  expect(menuButton).toBeVisible()
  fireEvent.click(menuButton)

  expect(screen.queryByRole('menuitem', {name: 'Rename branch'})).not.toBeInTheDocument()
})
