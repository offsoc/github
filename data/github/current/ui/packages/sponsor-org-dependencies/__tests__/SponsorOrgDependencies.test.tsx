import {fireEvent, screen, waitFor, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {verifiedFetch, verifiedFetchJSON} from '@github-ui/verified-fetch'
import {SponsorOrgDependencies} from '../SponsorOrgDependencies'
import {getSponsorOrgDependenciesProps, getSponsorOrgDependenciesSearchProps} from '../test-utils/mock-data'

const mockVerifiedFetch = verifiedFetch as jest.Mock
const mockVerifiedFetchJSON = verifiedFetchJSON as jest.Mock

jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetch: jest.fn(),
  verifiedFetchJSON: jest.fn(),
}))

describe('Dependencies table pagination', () => {
  test('renders the correct number of items on the first page and correct number of items on the next page', () => {
    const PAGE_SIZE = 1
    const props = getSponsorOrgDependenciesProps(PAGE_SIZE)
    render(<SponsorOrgDependencies {...props} />)
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(PAGE_SIZE + 1) // add 1 for the header row
    expect(rows[1]).toHaveTextContent('maintainer-1')

    const nextPageButton = screen.getByText('Next')
    fireEvent.click(nextPageButton)

    const rowsNext = screen.getAllByRole('row')
    expect(rowsNext).toHaveLength(PAGE_SIZE + 1) // add 1 for the header row
    expect(rowsNext[1]).toHaveTextContent('maintainer-2')
  })
})

describe('Show +X more dependency counts', () => {
  test('if 1 dependency, display the dependency and show more text should not be present', async () => {
    const props = getSponsorOrgDependenciesProps()
    render(<SponsorOrgDependencies {...props} />)
    const row = await screen.findByRole('row', {name: /maintainer-1/})
    expect(row).not.toHaveTextContent('dependency-2')
    expect(row).not.toHaveTextContent('more')
  })

  test('if 2 dependencies, display the dependencies and show more text should not be present', async () => {
    const props = getSponsorOrgDependenciesProps()
    render(<SponsorOrgDependencies {...props} />)
    const row = await screen.findByRole('row', {name: /maintainer-2/})
    expect(row).toHaveTextContent('dependency-2')
    expect(row).toHaveTextContent('dependency-3')
    expect(row).not.toHaveTextContent('more')
  })

  test('if 6 dependencies, display 2 dependencies and +4 more text', async () => {
    const props = getSponsorOrgDependenciesProps()
    render(<SponsorOrgDependencies {...props} />)
    const row = await screen.findByRole('row', {name: /maintainer-3/})
    expect(row).toHaveTextContent('dependency-4')
    expect(row).toHaveTextContent('dependency-5')
    expect(row).toHaveTextContent('+4 more')
  })
})

describe('Show recent activity', () => {
  test('Show recent activity', async () => {
    const props = getSponsorOrgDependenciesProps()
    render(<SponsorOrgDependencies {...props} />)
    const result = await screen.findAllByTestId('recent-activity')
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveTextContent('July 24, 2024')
    expect(result[1]).toHaveTextContent('July 23, 2024')
    expect(result[2]).toBeUndefined()
  })
})

describe('Sponsor hearts', () => {
  test('Distinguish between an org already sponsoring the maintainer or not', () => {
    const props = getSponsorOrgDependenciesProps()
    render(<SponsorOrgDependencies {...props} />)
    const sponsorButtons = screen.getAllByTestId('sponsor-button')
    expect(sponsorButtons[0]).toHaveAttribute('aria-label', 'Sponsoring')
    expect(sponsorButtons[0]).toHaveAttribute('href', '/sponsors/maintainer-1?sponsor=org-name')
    expect(sponsorButtons[1]).toHaveAttribute('aria-label', 'Sponsor')
    expect(sponsorButtons[1]).toHaveAttribute('href', '/sponsors/maintainer-2?sponsor=org-name')
  })
})

describe('Show more dependencies modal', () => {
  beforeEach(() => {
    mockVerifiedFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 1,
          name: 'dependency-1',
          fullRepoName: 'org-name/dependency-1',
        },
        {
          id: 2,
          name: 'dependency-2',
          fullRepoName: 'org-name/dependency-2',
        },
        {
          id: 3,
          name: 'dependency-3',
          fullRepoName: 'org-name/dependency-3',
        },
        {
          id: 4,
          name: 'dependency-4',
          fullRepoName: 'org-name/dependency-4',
        },
        {
          id: 5,
          name: 'dependency-5',
          fullRepoName: 'org-name/dependency-5',
        },
        {
          id: 6,
          name: 'dependency-6',
          fullRepoName: 'org-name/dependency-6',
        },
      ],
    })
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('dependency count text', async () => {
    const props = getSponsorOrgDependenciesProps()
    render(<SponsorOrgDependencies {...props} />)

    const showMoreLink = screen.getByTestId('show-more-link')
    fireEvent.click(showMoreLink)

    const dialogBoxPopup = await screen.findByTestId('dialog-box')

    expect(dialogBoxPopup).toHaveTextContent('org-name depends on 6 repositories maintainer-3 owns or maintains')
  })
})

describe('Exporting sponsorships', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('requests dependencies, showing flash banner when export is selected', async () => {
    // <Banner /> is experimental and has some console errors
    // The alternative, <Flash /> is deprecated
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: true,
      json: async () => {
        return {msg: 'expected-flash-message'}
      },
    })
    const props = getSponsorOrgDependenciesProps()
    render(<SponsorOrgDependencies {...props} />)

    const exportButton = screen.getByTestId('dependencies-export-button')
    expect(exportButton).toBeInTheDocument()

    fireEvent.click(exportButton)

    const dialogBoxText = await screen.findByText(getSponsorOrgDependenciesProps().viewerPrimaryEmail)
    expect(dialogBoxText).toBeInTheDocument()

    const startExportButton = screen.getByTestId('dependencies-start-export-button')
    expect(startExportButton).toBeVisible()

    fireEvent.click(startExportButton)

    await expect(mockVerifiedFetchJSON).toHaveBeenCalled()

    const resultBanner = await screen.findByTestId('dependencies-flash-banner')
    expect(within(resultBanner).getByText('expected-flash-message')).toBeInTheDocument()
    expect(within(resultBanner).getByText('Success')).toBeInTheDocument()
  })

  test('requests dependencies, showing error flash banner when export fails', async () => {
    // <Banner /> is experimental and has some console errors
    // The alternative, <Flash /> is deprecated
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: false,
    })

    const props = getSponsorOrgDependenciesProps()
    render(<SponsorOrgDependencies {...props} />)

    const exportButton = screen.getByTestId('dependencies-export-button')
    expect(exportButton).toBeInTheDocument()

    fireEvent.click(exportButton)

    const dialogBoxText = await screen.findByText(getSponsorOrgDependenciesProps().viewerPrimaryEmail)
    expect(dialogBoxText).toBeInTheDocument()

    const startExportButton = screen.getByTestId('dependencies-start-export-button')
    expect(startExportButton).toBeVisible()

    fireEvent.click(startExportButton)

    await expect(mockVerifiedFetchJSON).toHaveBeenCalled()

    const resultBanner = await screen.findByTestId('dependencies-flash-banner')
    expect(within(resultBanner).getByText('There was a problem exporting your dependencies.')).toBeInTheDocument()
    expect(within(resultBanner).getByText('Error')).toBeInTheDocument()
  })
})

describe('Search for maintainers and dependencies', () => {
  test('search returns paginated results', async () => {
    const PAGE_SIZE = 1
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: true,
      json: async () => {
        return getSponsorOrgDependenciesSearchProps().sponsorableDependencies
      },
    })

    const props = getSponsorOrgDependenciesSearchProps(PAGE_SIZE)
    render(<SponsorOrgDependencies {...props} />)

    const inputElement = screen.getByPlaceholderText('Search maintainers, dependencies')
    expect(inputElement).toBeInTheDocument()

    fireEvent.change(inputElement, {target: {value: 'mona'}})

    const searchButton = screen.getByTestId('search-button')
    fireEvent.click(searchButton)

    expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(`/orgs/org-name/dependencies/search?search_term=mona`, {
      method: 'GET',
    })

    await waitFor(() => {
      const searchResults = screen.getAllByRole('row')
      expect(searchResults[1]).toHaveTextContent('monalisa')
    })

    const nextPageButton = screen.getByText('Next')
    fireEvent.click(nextPageButton)

    const nextPageSearchResults = screen.getAllByRole('row')
    // add 1 for the header row
    expect(nextPageSearchResults).toHaveLength(PAGE_SIZE + 1)
    expect(nextPageSearchResults[1]).toHaveTextContent('maintainer-2')
  })

  test('while on the 2nd page of paginated items, searching for an item on the first page renders results', async () => {
    const PAGE_SIZE = 1
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: true,
      json: async () => {
        return getSponsorOrgDependenciesSearchProps().sponsorableDependencies
      },
    })

    const props = getSponsorOrgDependenciesSearchProps(PAGE_SIZE)
    render(<SponsorOrgDependencies {...props} />)

    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(PAGE_SIZE + 1) // add 1 for the header row
    expect(rows[1]).toHaveTextContent('monalisa')

    const nextPageButton = screen.getByText('Next')
    fireEvent.click(nextPageButton)

    const nextPageSearchResults = screen.getAllByRole('row')
    expect(nextPageSearchResults[1]).toHaveTextContent('mona')

    const inputElement = screen.getByPlaceholderText('Search maintainers, dependencies')
    expect(inputElement).toBeInTheDocument()

    fireEvent.change(inputElement, {target: {value: 'monalisa'}})

    const searchButton = screen.getByTestId('search-button')
    fireEvent.click(searchButton)

    expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(`/orgs/org-name/dependencies/search?search_term=monalisa`, {
      method: 'GET',
    })

    await waitFor(() => {
      const searchResults = screen.getAllByRole('row')
      expect(searchResults[1]).toHaveTextContent('monalisa')
    })
  })

  test('clear and reset search bar', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: true,
      json: async () => {
        return []
      },
    })

    const props = getSponsorOrgDependenciesProps()
    render(<SponsorOrgDependencies {...props} />)

    const inputElement = screen.getByPlaceholderText('Search maintainers, dependencies')
    expect(inputElement).toBeInTheDocument()
    fireEvent.change(inputElement, {target: {value: 'zzz'}})

    const searchButton = screen.getByTestId('search-button')
    fireEvent.click(searchButton)

    expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(`/orgs/org-name/dependencies/search?search_term=zzz`, {
      method: 'GET',
    })

    const emptyState = await screen.findByText('No results')
    expect(emptyState).toBeInTheDocument()

    const clearSearchButton = screen.getByTestId('clear-search-button')
    fireEvent.click(clearSearchButton)
    expect(inputElement).toHaveValue('')
  })

  test('friendly blank screen when no matching search results', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: true,
      json: async () => {
        return []
      },
    })

    const props = getSponsorOrgDependenciesProps()
    render(<SponsorOrgDependencies {...props} />)

    const inputElement = screen.getByPlaceholderText('Search maintainers, dependencies')
    expect(inputElement).toBeInTheDocument()

    fireEvent.change(inputElement, {target: {value: 'zzz'}})

    const searchButton = screen.getByTestId('search-button')
    fireEvent.click(searchButton)

    expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(`/orgs/org-name/dependencies/search?search_term=zzz`, {
      method: 'GET',
    })

    const emptyState = await screen.findByText('No results')
    expect(emptyState).toBeInTheDocument()
  })
})
