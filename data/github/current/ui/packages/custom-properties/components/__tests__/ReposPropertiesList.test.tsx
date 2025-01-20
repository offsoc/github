import {render} from '@github-ui/react-core/test-utils'
import {screen, within} from '@testing-library/react'
import type {ComponentProps} from 'react'

import {CurrentOrgRepoProvider} from '../../contexts/CurrentOrgRepoContext'
import {ReposPropertiesList} from '../ReposPropertiesList'

const onSelectionChangeMock = jest.fn()

beforeEach(() => onSelectionChangeMock.mockClear())

describe('ReposPropertiesList', () => {
  it('renders header and all expected elements', () => {
    renderReposPropertiesList()

    expect(screen.getByText('2 repositories')).toBeInTheDocument()
    expect(screen.getByText(sampleRepoName1)).toBeInTheDocument()
    expect(screen.getByText(sampleRepoName2)).toBeInTheDocument()
  })

  it('list item includes all expected information', () => {
    renderReposPropertiesList()

    expect(within(screen.getByRole('list', {name: 'Repositories'})).getAllByRole('checkbox')).toHaveLength(2)
    expect(screen.getByText(sampleRepoName1)).toBeInTheDocument()
    expect(screen.getByText(sampleRepoName2)).toBeInTheDocument()
    expect(screen.getByText('a test description', {exact: false})).toBeInTheDocument()
    expect(screen.getAllByText('2 properties')).toHaveLength(2)
    expect(screen.getByLabelText("Edit maximum-effort's properties")).toBeInTheDocument()
  })

  it('calls selection callback on repo select', async () => {
    const {user} = renderReposPropertiesList()

    expect(screen.getByText('2 repositories')).toBeInTheDocument()

    const selectAllCheckbox = within(screen.getByTestId('list-view-select-all-container')).getByRole('checkbox')
    await user.click(selectAllCheckbox)
    expect(onSelectionChangeMock).toHaveBeenCalledWith(new Set([1, 2]))
  })

  it('shows no properties when properties object is empty', () => {
    renderReposPropertiesList({
      repositoryCount: 1,
      repos: [{id: 0, name: 'holly', visibility: 'internal', properties: {}, description: null}],
    })

    expect(screen.getByText('No properties')).toBeInTheDocument()
  })

  it('paginates list', async () => {
    const mockOnPageChange = jest.fn()
    const {user} = renderReposPropertiesList({
      pageCount: 10,
      onPageChange: mockOnPageChange,
    })

    await user.click(screen.getByLabelText('Page 2'))
    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })
})

const sampleRepoName1 = 'maximum-effort'
const sampleRepoName2 = 'minimum-effort'
const sampleProps: ComponentProps<typeof ReposPropertiesList> = {
  orgName: 'github',
  pageCount: 1,
  repositoryCount: 2,
  repos: [
    {
      id: 1,
      name: sampleRepoName1,
      visibility: 'private',
      description: 'a test description',
      properties: {
        something: 'one',
        'something-else': 'two',
      },
    },
    {
      id: 2,
      name: sampleRepoName2,
      visibility: 'private',
      description: 'minimum effort repo description',
      properties: {
        something: 'one',
        'something-else': 'two',
      },
    },
  ],
  page: 1,
  selectedRepoIds: new Set(),
  showSpinner: false,
  onPageChange: jest.fn(),
  onEditRepoPropertiesClick: jest.fn(),
  onSelectionChange: onSelectionChangeMock,
}

function renderReposPropertiesList(props: Partial<ComponentProps<typeof ReposPropertiesList>> = {}) {
  return render(
    <CurrentOrgRepoProvider>
      <ReposPropertiesList {...sampleProps} {...props} />
    </CurrentOrgRepoProvider>,
  )
}
