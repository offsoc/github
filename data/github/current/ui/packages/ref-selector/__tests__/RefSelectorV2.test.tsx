import {mockFetch} from '@github-ui/mock-fetch'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen, waitFor} from '@testing-library/react'
// eslint-disable-next-line no-restricted-imports
import userEvent from 'user-event-13'

import {SearchIndex} from '../search-index'
import {RefSelectorV2} from '../RefSelectorV2'

/*
 * After branch creation, we need to verify that the href is changed.
 * We can only do this properly by throwing away window.location and
 * replacing it with one that has a new setter defined on href.
 */
// @ts-expect-error overriding window.location in test
delete window.location
const hrefAssignSpy = jest.fn()
window.location = {assign: hrefAssignSpy} as unknown as Location

const searchIndexFetchDataSpy = jest.spyOn(SearchIndex.prototype, 'fetchData')

beforeAll(() => {
  jest.spyOn(SearchIndex.prototype, 'render').mockImplementation(async function (this: SearchIndex) {
    await act(() => this.selector.render())
  })
})

beforeEach(() => {
  hrefAssignSpy.mockClear()
  searchIndexFetchDataSpy.mockClear()
})

const defaultProps = {
  canCreate: true,
  cacheKey: 'fake-cache-key',
  currentCommitish: 'current-branch',
  defaultBranch: 'main',
  getHref: (ref: string) => `/href/for/${ref}`,
  owner: 'monalisa',
  repo: 'smile',
}

it('Shows the current branch in the expandable button', async () => {
  render(<RefSelectorV2 {...defaultProps} />)

  expect(screen.getByRole('button')).toHaveTextContent('current-branch')
})

it('Opens on click', async () => {
  render(<RefSelectorV2 {...defaultProps} />)
  await openRefSelector()

  expect(screen.getByPlaceholderText('Start typing to see more')).toBeInTheDocument()
  expect(screen.getByText('Select branch or tag')).toBeInTheDocument()
  expect(screen.getByText('Branches')).toBeInTheDocument()
  expect(screen.getByText('Tags')).toBeInTheDocument()
})

it('Shows branches tab and text if types=branch provided', async () => {
  render(<RefSelectorV2 types={['branch']} {...defaultProps} />)
  await openRefSelector()

  expect(screen.getByPlaceholderText('Start typing to see more')).toBeInTheDocument()
  expect(screen.getByText('Select branch')).toBeInTheDocument()
  expect(screen.queryByText('Branches')).not.toBeInTheDocument()
  expect(screen.queryByText('Tags')).not.toBeInTheDocument()
})

it('Shows tags tab and text if types=tag provided', async () => {
  render(<RefSelectorV2 types={['tag']} {...defaultProps} />)
  await openRefSelector()

  expect(screen.getByPlaceholderText('Start typing to see more')).toBeInTheDocument()
  expect(screen.getByText('Select tag')).toBeInTheDocument()
  expect(screen.queryByText('Branches')).not.toBeInTheDocument()
  expect(screen.queryByText('Tags')).not.toBeInTheDocument()
})

it('Emits ref type change event', async () => {
  const refTypeChangeMock = jest.fn()
  render(<RefSelectorV2 {...defaultProps} onRefTypeChanged={refTypeChangeMock} />)
  await openRefSelector()

  userEvent.click(screen.getByText('Branches'))
  expect(refTypeChangeMock).toHaveBeenCalledWith('branch')
  userEvent.click(screen.getByText('Tags'))
  expect(refTypeChangeMock).toHaveBeenCalledWith('tag')
})

it('Sets correct initial ref type', async () => {
  render(<RefSelectorV2 {...defaultProps} selectedRefType="tag" />)
  await openRefSelector()

  expect(screen.getByRole('tab', {selected: true})).toHaveTextContent('Tags')
})

it('Keeps individual filter state for refs', async () => {
  render(<RefSelectorV2 {...defaultProps} />)
  await openRefSelector()

  const input = screen.getByRole<HTMLInputElement>('combobox')

  userEvent.paste(input, 'branch_filter')
  expect(input.value).toBe('branch_filter')

  await act(async () => await userEvent.click(screen.getByText('Tags')))

  await waitFor(() => expect(input.value).toBe(''))

  userEvent.paste(input, 'tags_filter')
  expect(input.value).toBe('tags_filter')

  await act(async () => await userEvent.click(screen.getByText('Branches')))
  expect(input.value).toBe('branch_filter')
})

it('Resets selection when ref type changes', async () => {
  const mockedResults = ['main', 'another-branch']

  searchIndexFetchDataSpy.mockImplementation(async function (this: SearchIndex) {
    this.knownItems = mockedResults
    this.isLoading = false
    this.render()
  })
  render(<RefSelectorV2 {...defaultProps} currentCommitish="main" />)
  await openRefSelector()

  expect(screen.getByTestId('selected-option')).toHaveTextContent('main')
  userEvent.click(screen.getByText('another-branch'))
  expect(screen.getByTestId('apply-button')).not.toBeDisabled()
  expect(screen.getByTestId('selected-option')).toHaveTextContent('another-branch')

  userEvent.click(screen.getByText('Tags'))
  expect(screen.getByTestId('selected-option')).toHaveTextContent('main')
  expect(screen.getByTestId('apply-button')).toBeDisabled()
})

it('Shows the results from the current search index', async () => {
  const mockedResults = ['main', 'current-branch', 'another-branch']

  searchIndexFetchDataSpy.mockImplementation(async function (this: SearchIndex) {
    this.knownItems = mockedResults
    this.isLoading = false
    this.render()
  })

  render(<RefSelectorV2 {...defaultProps} />)
  await openRefSelector()

  for (const ref of mockedResults) {
    expect(screen.getAllByText(ref).length).toBeGreaterThan(0)
  }
})

it('Displays only limited number of results', async () => {
  const mockedResults = new Array(1_000).fill(0).map((_, i) => `mocked-branch ${i}`)

  searchIndexFetchDataSpy.mockImplementation(async function (this: SearchIndex) {
    this.knownItems = mockedResults
    this.isLoading = false
    this.render()
  })

  render(<RefSelectorV2 {...defaultProps} />)
  await openRefSelector()

  // We need to use regex matching, because react test lib does exact text search while we want to match `mocked-branch ${i}`
  expect(screen.getAllByText(/mocked-branch/).length).toBe(30)
})

it('Shows a loading indicator while refs are being fetched', async () => {
  searchIndexFetchDataSpy.mockImplementation(async function (this: SearchIndex) {
    this.isLoading = true
    this.render()
  })

  render(<RefSelectorV2 {...defaultProps} />)
  await openRefSelector()

  //currently there is no other way to query the spinner
  // eslint-disable-next-line testing-library/no-node-access
  expect(screen.getByRole('tabpanel').querySelector('circle')).toBeInTheDocument()
})

it('Shows an error when refs cannot be fetched', async () => {
  searchIndexFetchDataSpy.mockImplementation(async function (this: SearchIndex) {
    this.fetchFailed = true
    this.render()
  })

  render(<RefSelectorV2 {...defaultProps} />)
  await openRefSelector()

  expect(screen.getByText('Could not load branches')).toBeInTheDocument()
})

it('Shows a zero state when no refs match the search', async () => {
  searchIndexFetchDataSpy.mockImplementation(async function (this: SearchIndex) {
    this.knownItems = []
    this.isLoading = false
    this.render()
  })

  render(<RefSelectorV2 {...defaultProps} />)
  await openRefSelector()

  expect(screen.getByText('Nothing to show')).toBeInTheDocument()
})

it('Filters the list of refs based on the current filter text', async () => {
  const mockedResults = ['main', 'current-branch', 'another-branch', 'this-will-appear-after-filter']

  searchIndexFetchDataSpy.mockImplementation(async function (this: SearchIndex) {
    this.knownItems = mockedResults
    this.isLoading = false
    this.render()
  })

  render(<RefSelectorV2 {...defaultProps} />)
  await openRefSelector()

  expect(screen.getAllByRole('option')).toHaveLength(4)

  const input = screen.getByPlaceholderText<HTMLInputElement>('Start typing to see more')
  userEvent.type(input, 'filter')
  expect(input.value).toBe('filter')

  expect(await screen.findAllByRole('option')).toHaveLength(1)

  userEvent.clear(input)
  expect(screen.getAllByRole('option')).toHaveLength(4)
})

it('Allows branch creation', async () => {
  const mockCheckBranchAPI = mockFetch.mockRoute('/monalisa/smile/branches/check_tag_name_exists', undefined, {
    text: async () => '',
  })
  const mockAPI = mockFetch.mockRoute('/monalisa/smile/branches', {name: 'new-branch-name'})
  const mockedResults = ['main', 'current-branch', 'another-branch']
  searchIndexFetchDataSpy.mockImplementation(async function (this: SearchIndex) {
    this.knownItems = mockedResults
    this.isLoading = false
    this.render()
  })

  render(<RefSelectorV2 {...defaultProps} />)
  await openRefSelector()

  // create not shown until text is entered and no results are found
  expect(screen.queryByTestId('create-branch-action')).not.toBeInTheDocument()

  const input = screen.getByRole('combobox')
  userEvent.paste(input, 'new-branch-name')
  expect(screen.queryAllByRole('option')).toHaveLength(0)

  userEvent.click(screen.getByTestId('create-branch-action'))

  expect(mockCheckBranchAPI).toHaveBeenCalledWith(
    '/monalisa/smile/branches/check_tag_name_exists',
    expect.objectContaining({method: 'POST', body: expect.any(FormData)}),
  )

  await waitFor(() => {
    expect(mockAPI).toHaveBeenCalledWith(
      '/monalisa/smile/branches',
      expect.objectContaining({method: 'POST', body: expect.any(FormData)}),
    )
  })

  const submittedBody = mockAPI.mock.calls[0][1].body as FormData
  expect(submittedBody.get('name')).toBe('new-branch-name')
  expect(submittedBody.get('branch')).toBe('current-branch')

  await waitFor(() => expect(hrefAssignSpy).toHaveBeenCalledWith('/href/for/new-branch-name'))
})

it('Disables apply button and hides create button if selected branch matches current ref', async () => {
  const mockedResults = ['main', 'current-branch', 'another-branch']
  searchIndexFetchDataSpy.mockImplementation(async function (this: SearchIndex) {
    this.knownItems = mockedResults
    this.isLoading = false
    this.render()
  })

  render(<RefSelectorV2 {...defaultProps} currentCommitish="main" />)
  await openRefSelector()

  // create not shown until text is entered and no results are found
  expect(screen.queryByTestId('create-branch-action')).not.toBeInTheDocument()

  const input = screen.getByRole('combobox')
  userEvent.paste(input, 'main')
  expect(screen.getByRole('option')).toHaveTextContent('main')
  userEvent.click(screen.getByRole('option'))

  const applyButton = screen.getByTestId('apply-button')
  expect(applyButton).toBeDisabled()

  userEvent.clear(input)
  userEvent.paste(input, 'another')
  expect(screen.getByRole('option')).toHaveTextContent('another-branch')
  userEvent.click(screen.getByRole('option'))
  expect(applyButton).not.toBeDisabled()
  userEvent.click(applyButton)
  expect(hrefAssignSpy).toHaveBeenCalledWith('/href/for/another-branch')
  // Overlay closes
  expect(screen.queryByTestId('apply-button')).not.toBeInTheDocument()
})

it('Shows warning dialog and does not immediately create if branch matches tag', async () => {
  const mockAPI = mockFetch.mockRoute('/monalisa/smile/branches', {name: 'new-branch-name'})
  const mockCheckBranchAPI = mockFetch.mockRoute('/monalisa/smile/branches/check_tag_name_exists', undefined, {
    text: async () => 'Tag exists',
  })
  const mockedResults = ['main', 'current-branch', 'another-branch']
  searchIndexFetchDataSpy.mockImplementation(async function (this: SearchIndex) {
    this.knownItems = mockedResults
    this.isLoading = false
    this.render()
  })

  render(<RefSelectorV2 {...defaultProps} />)
  await openRefSelector()

  const input = screen.getByRole('combobox')
  userEvent.paste(input, 'new-branch-name')

  expect(screen.getByText('Nothing to show')).toBeInTheDocument()
  expect(screen.queryAllByRole('option')).toHaveLength(0)

  userEvent.click(screen.getByTestId('create-branch-action'))

  expect(mockCheckBranchAPI).toHaveBeenCalledWith(
    '/monalisa/smile/branches/check_tag_name_exists',
    expect.objectContaining({method: 'POST', body: expect.any(FormData)}),
  )

  await waitFor(() => {
    screen.getByText(
      'A tag already exists with the provided branch name. Many Git commands accept both tag and branch names, so creating this branch may cause unexpected behavior. Are you sure you want to create this branch?',
    )
    expect(mockAPI).not.toHaveBeenCalled()
  })

  const createButton = screen.getByText('Create')
  userEvent.click(createButton)

  await waitFor(() => {
    expect(mockAPI).toHaveBeenCalledWith(
      '/monalisa/smile/branches',
      expect.objectContaining({method: 'POST', body: expect.any(FormData)}),
    )
  })

  const submittedBody = mockAPI.mock.calls[0][1].body as FormData
  expect(submittedBody.get('name')).toBe('new-branch-name')
  expect(submittedBody.get('branch')).toBe('current-branch')

  await waitFor(() => expect(hrefAssignSpy).toHaveBeenCalledWith('/href/for/new-branch-name'))
})

it('Calls error callback if branch creation fails', async () => {
  const mockCheckBranchAPI = mockFetch.mockRoute('/monalisa/smile/branches/check_tag_name_exists', undefined, {
    text: async () => '',
  })
  mockFetch.mockRoute('/monalisa/smile/branches', {error: 'Error message'}, {ok: false})
  const mockedResults = ['main', 'current-branch', 'another-branch']
  const onErrorMock = jest.fn()

  searchIndexFetchDataSpy.mockImplementation(async function (this: SearchIndex) {
    this.knownItems = mockedResults
    this.isLoading = false
    this.render()
  })

  render(<RefSelectorV2 {...defaultProps} onCreateError={onErrorMock} />)
  await openRefSelector()

  const input = screen.getByRole('combobox')
  userEvent.paste(input, 'new-branch-name')

  userEvent.click(screen.getByTestId('create-branch-action'))

  expect(mockCheckBranchAPI).toHaveBeenCalledWith(
    '/monalisa/smile/branches/check_tag_name_exists',
    expect.objectContaining({method: 'POST', body: expect.any(FormData)}),
  )

  await waitFor(() => {
    expect(onErrorMock).toHaveBeenCalledWith('Error message')
  })
})

it('HighlightedText properly highlights provided text', async () => {
  const mockedResults = ['main', 'current-branch', 'another-branch']

  searchIndexFetchDataSpy.mockImplementation(async function (this: SearchIndex) {
    this.knownItems = mockedResults
    this.isLoading = false
    this.render()
  })

  render(<RefSelectorV2 {...defaultProps} />)
  await openRefSelector()

  const input = screen.getByRole('combobox')
  userEvent.paste(input, 'branch')

  expect(await screen.findAllByText('branch', {selector: 'strong'})).toHaveLength(2)
})

it('Text is maintained between opening and closing of ref selector dropdown', async () => {
  const mockedResults = ['main', 'current-branch', 'another-branch']

  searchIndexFetchDataSpy.mockImplementation(async function (this: SearchIndex) {
    this.knownItems = mockedResults
    this.isLoading = false
    this.render()
  })

  render(<RefSelectorV2 {...defaultProps} />)
  const button = screen.getByTestId('anchor-button')
  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => userEvent.click(button))
  expect(screen.getByTestId('overlay-content')).toBeVisible()

  userEvent.paste(screen.getByRole<HTMLInputElement>('combobox'), 'branch')
  expect(await screen.findAllByText('branch', {selector: 'strong'})).toHaveLength(2)

  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => userEvent.click(button))
  expect(screen.queryByTestId('overlay-content')).not.toBeInTheDocument()

  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => userEvent.click(button))
  expect(screen.getByTestId('overlay-content')).toBeVisible()

  expect(screen.getByRole<HTMLInputElement>('combobox').value).toBe('branch')
  expect(await screen.findAllByText('branch', {selector: 'strong'})).toHaveLength(2)
})

it('Shows the branch icon if the selected ref is a branch', () => {
  const {container} = render(<RefSelectorV2 selectedRefType="branch" {...defaultProps} />)
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  expect(container.getElementsByClassName('octicon-git-branch').length).toBe(1)
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  expect(container.getElementsByClassName('octicon-tag').length).toBe(0)
})

it('Shows the tag icon if the selected ref is a tag', () => {
  const {container} = render(<RefSelectorV2 selectedRefType="tag" {...defaultProps} />)
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  expect(container.getElementsByClassName('octicon-tag').length).toBe(1)
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  expect(container.getElementsByClassName('octicon-git-branch').length).toBe(0)
})

it('Includes ref type in on click callback', async () => {
  const mockedResults = ['main', 'current-branch', 'another-branch']
  jest.spyOn(SearchIndex.prototype, 'fetchData').mockImplementation(async function (this: SearchIndex) {
    this.knownItems = mockedResults
    this.isLoading = false
    this.render()
  })

  const onItemClickMock = jest.fn()
  render(<RefSelectorV2 {...defaultProps} onSelectItem={onItemClickMock} />)

  await openRefSelector()

  userEvent.click(screen.getByText('another-branch'))
  userEvent.click(screen.getByTestId('apply-button'))
  expect(onItemClickMock).toHaveBeenCalledWith('another-branch', 'branch')
})

describe('Accessibility', () => {
  beforeEach(() => {
    const mockedResults = ['main', 'current-branch', 'another-branch']
    searchIndexFetchDataSpy.mockImplementation(async function (this: SearchIndex) {
      this.knownItems = mockedResults
      this.isLoading = false
      this.render()
    })
  })

  it('has correct focus order', () => {
    render(<RefSelectorV2 {...defaultProps} />)

    const button = screen.getByTestId('anchor-button')
    userEvent.click(button)

    expect(screen.getByLabelText('Cancel')).toHaveFocus()

    userEvent.tab()
    expect(screen.getAllByRole('tab')[0]).toHaveFocus()
    expect(screen.getAllByRole('tab')[0]).toHaveTextContent('Branches')

    userEvent.tab()
    expect(screen.getByRole('combobox')).toHaveFocus()
    userEvent.click(screen.getByText('another-branch'))

    userEvent.tab()
    expect(screen.getByRole('link')).toHaveFocus()
    expect(screen.getByRole('link')).toHaveTextContent('View all branches')

    userEvent.tab()
    expect(screen.getByTestId('cancel-button')).toHaveFocus()

    userEvent.tab()
    expect(screen.getByTestId('apply-button')).toHaveFocus()
  })
})

async function openRefSelector() {
  const button = screen.getByRole('button')
  await userEvent.click(button)
}
