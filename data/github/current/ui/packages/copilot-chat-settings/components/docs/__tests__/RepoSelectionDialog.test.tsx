import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {DIALOG_LABEL, RepoSelectionDialog} from '../RepoSelectionDialog'
import {getRepoDataPayload} from '../../../test-utils/mock-data'

const repositories = [
  {
    databaseId: 1,
    id: 'R_1',
    name: 'bar',
    nameWithOwner: 'foo/bar',
    owner: {
      databaseId: 1,
      login: 'foo',
      avatarUrl: '',
    },
    shortDescriptionHTML: 'this is a repo',
    isInOrganization: true,
    isPrivate: false,
    isArchived: false,
  },
]
const loading = false
let mockUseRepositoryItems = jest.fn().mockReturnValue({repositories, loading})
jest.mock('@github-ui/use-repository-items', () => {
  const originalModule = jest.requireActual('@github-ui/use-repository-items')
  return {
    __esModule: true,
    ...originalModule,
    useRepositoryItems: () => mockUseRepositoryItems(),
  }
})

describe('RepoSelectionDialog', () => {
  test('Renders the RepoSelectionDialog component', async () => {
    render(<RepoSelectionDialog isOpen={true} onClose={jest.fn()} initialSelectedItems={[]} />)

    expect(screen.getByRole('heading', {name: DIALOG_LABEL, level: 1})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Apply'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Cancel'})).toBeInTheDocument()

    const repoPickerSearchInput = screen.getByPlaceholderText('Search repositories')
    expect(repoPickerSearchInput).toBeInTheDocument()
    expect(repoPickerSearchInput).toHaveValue('')

    expect(screen.getByRole('heading', {name: 'foo/bar', level: 3})).toBeInTheDocument()
    expect(screen.getByRole('checkbox', {name: 'Select: foo/bar', checked: false})).toBeInTheDocument()
  })

  test('Does not include previously selected items', async () => {
    render(<RepoSelectionDialog isOpen={true} onClose={jest.fn()} initialSelectedItems={[getRepoDataPayload()]} />)

    expect(screen.queryByRole('heading', {name: 'foo/bar', level: 3})).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox', {name: 'Select: foo/bar', checked: true})).not.toBeInTheDocument()
  })

  test('Renders the RepoSelectionDialog component with an initalFilterText', async () => {
    render(
      <RepoSelectionDialog isOpen={true} onClose={jest.fn()} initialSelectedItems={[]} initialFilterText="org:foo" />,
    )

    const repoPickerSearchInput = screen.getByPlaceholderText('Search repositories')
    expect(repoPickerSearchInput).toBeInTheDocument()
    expect(repoPickerSearchInput).toHaveValue('org:foo')
  })

  test('Clicking apply calls the onClose function', async () => {
    const onClose = jest.fn()
    render(<RepoSelectionDialog isOpen={true} onClose={onClose} initialSelectedItems={[]} />)
    const applyButton = screen.getByRole('button', {name: 'Apply'})
    act(() => {
      applyButton.click()
    })

    expect(onClose).toHaveBeenCalled()
  })

  test('loading state', async () => {
    mockUseRepositoryItems = jest.fn().mockReturnValue({repositories: [], loading: true})
    jest.useFakeTimers()
    render(<RepoSelectionDialog isOpen={true} onClose={jest.fn()} initialSelectedItems={[]} />)

    act(() => {
      jest.runAllTimers()
    })
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  test('when no repos are found', async () => {
    mockUseRepositoryItems = jest.fn().mockReturnValue({repositories: [], loading: false})

    render(<RepoSelectionDialog isOpen={true} onClose={jest.fn()} initialSelectedItems={[]} />)

    expect(screen.getByText('No results found.')).toBeInTheDocument()
  })

  test('when more results are available, renders "Load more" button', async () => {
    mockUseRepositoryItems = jest.fn().mockReturnValue({repositories, loading: false, totalCount: 10})

    render(<RepoSelectionDialog isOpen={true} onClose={jest.fn()} initialSelectedItems={[]} />)

    expect(screen.getByRole('button', {name: 'Load more'})).toBeInTheDocument()
  })
})
