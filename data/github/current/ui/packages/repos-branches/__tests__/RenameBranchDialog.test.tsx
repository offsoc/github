import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {RenameBranchDialog} from '../components/RenameBranchDialog'
import {getBranches, getRepository, getRenameEffects} from '../test-utils/mock-data'
import {mockFetch} from '@github-ui/mock-fetch'

const repo = getRepository()
const branch = getBranches()[0]!

test('renders RenameBranchDialog', async () => {
  render(<RenameBranchDialog repo={repo} branch={branch} onDismiss={() => {}} />)

  expect(screen.getByDisplayValue(branch.name)).toBeVisible()
  expect(screen.getByRole('button', {name: 'Rename branch'})).toBeVisible()
  expect(screen.getByRole('button', {name: 'Cancel'})).toBeVisible()
  expect(screen.queryByText(/Most projects name the default branch/i)).not.toBeInTheDocument()

  await act(async () => {
    mockFetch.resolvePendingRequest(
      `/${repo.ownerLogin}/${repo.name}/branches/rename_form/${branch.name}`,
      {},
      {ok: true},
    )
  })

  expect(screen.queryByTestId('update-pr')).not.toBeInTheDocument()
  expect(screen.queryByTestId('close-pr')).not.toBeInTheDocument()
  expect(screen.queryByTestId('rename-draft')).not.toBeInTheDocument()
  expect(screen.queryByTestId('update-pb')).not.toBeInTheDocument()
  expect(screen.queryByTestId('update-page')).not.toBeInTheDocument()
  expect(screen.queryByTestId('copy-details')).not.toBeInTheDocument()
  expect(screen.getByText(/Renaming this branch will not update/i)).toBeInTheDocument()
})

test('renders RenameBranchDialog for default branch', () => {
  branch.isDefault = true

  render(<RenameBranchDialog repo={repo} branch={branch} onDismiss={() => {}} />)

  expect(screen.getByText(/Most projects name the default branch/i)).toBeVisible()
})

test('renders rename effects', async () => {
  render(<RenameBranchDialog repo={repo} branch={branch} onDismiss={() => {}} />)
  expect(mockFetch.fetch).toHaveBeenCalledTimes(1)
  await act(async () => {
    mockFetch.resolvePendingRequest(
      `/${repo.ownerLogin}/${repo.name}/branches/rename_form/${branch.name}`,
      getRenameEffects(),
      {ok: true},
    )
  })
  expect(screen.getByTestId('update-pr')).toBeInTheDocument()
  expect(screen.getByTestId('close-pr')).toBeInTheDocument()
  expect(screen.getByTestId('rename-draft')).toBeInTheDocument()
  expect(screen.getByTestId('update-pb')).toBeInTheDocument()
  expect(screen.getByTestId('update-page')).toBeInTheDocument()
  expect(screen.getByTestId('copy-details')).toBeInTheDocument()
  expect(screen.queryByText(/Renaming this branch will not update/i)).not.toBeInTheDocument()
})
