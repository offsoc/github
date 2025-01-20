import {act, render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {DefaultPrivileges, type Privileges, Role} from '../../../../client/api/common-contracts'
import {apiRemoveItems} from '../../../../client/api/memex-items/api-remove-items'
import {apiUnarchiveItems} from '../../../../client/api/memex-items/api-unarchive-items'
import type {MemexItem} from '../../../../client/api/memex-items/contracts'
import {overrideDefaultPrivileges} from '../../../../client/helpers/viewer-privileges'
import {ArchivePage} from '../../../../client/pages/archive/components/archive-page'
import {ApiError} from '../../../../client/platform/api-error'
import {ArchiveResources} from '../../../../client/strings'
import {mockGetBoundingClientRect} from '../../../components/board/board-test-helper'
import {archivedItemFactory} from '../../../factories/memex-items/archived-item-factory'
import {stubRejectedApiResponse, stubResolvedApiResponse} from '../../../mocks/api/memex'
import {stubGetPaginatedItems} from '../../../mocks/api/memex-items'
import {mockGetArchiveStatus} from '../../../state-providers/workflows/helpers'
import {createTestEnvironment, TestAppContainer} from '../../../test-app-wrapper'

jest.mock('../../../../client/api/memex-items/api-remove-items')
jest.mock('../../../../client/api/memex-items/api-unarchive-items')

async function waitForInitialItemsRequest() {
  return waitFor(() => {
    expect(screen.queryByTestId('archived-item-loader')).not.toBeInTheDocument()
  })
}

function renderArchivePage() {
  render(
    <TestAppContainer>
      <ArchivePage />
    </TestAppContainer>,
  )
}

function mockResponseWithNextPage(items: Array<MemexItem>, additionalItemsCount = 1) {
  return stubGetPaginatedItems({
    nodes: items,
    pageInfo: {
      startCursor: items[0].id.toString(),
      endCursor: items[items.length - 1].id.toString(),
      hasNextPage: true,
      hasPreviousPage: true,
    },
    totalCount: {value: items.length + additionalItemsCount, isApproximate: false},
  })
}

function mockResponseWithNoItems() {
  return stubGetPaginatedItems({
    nodes: [],
    pageInfo: {
      startCursor: '',
      endCursor: '',
      hasNextPage: false,
      hasPreviousPage: false,
    },
    totalCount: {value: 0, isApproximate: true},
  })
}

const writeAccess = overrideDefaultPrivileges({role: Role.Write})

async function renderPaginatedArchive(items?: Array<MemexItem>, privileges?: Privileges) {
  createTestEnvironment({
    'memex-enabled-features': ['memex_paginated_archive'],
    'memex-items-data': items ?? [],
    'memex-viewer-privileges': privileges ?? writeAccess,
    'logged-in-user': {
      id: 1,
      login: 'test-user',
      name: 'Test User',
      avatarUrl: 'https://github.com/test-user.png',
      global_relay_id: 'MDQ6VXNl',
      isSpammy: false,
    },
  })
  renderArchivePage()
  // Wait for initial request to complete, if items are provided
  if (items) {
    await waitForInitialItemsRequest()
  }
}

async function renderPaginatedArchiveWithNextResults(items: Array<MemexItem>, additionalItemsCount = 1) {
  createTestEnvironment({
    'memex-enabled-features': ['memex_paginated_archive'],
    'memex-viewer-privileges': writeAccess,
  })
  mockResponseWithNextPage(items, additionalItemsCount)
  renderArchivePage()
  await waitForInitialItemsRequest()
}

async function findNextButton() {
  return screen.findByRole('button', {name: /next/i})
}

async function findPreviousButton() {
  return screen.findByRole('button', {name: /previous/i})
}

async function findFilterInput() {
  return screen.findByTestId('filter-bar-input')
}

async function findClearFilterButton() {
  return screen.findByTestId('clear-filters-query-builder')
}

function getItemAction(name: RegExp) {
  const itemActions = screen.getByRole('button', {name: /Open item actions/i})
  act(() => itemActions.click())
  return screen.getByRole('menuitem', {name})
}

describe('PaginatedArchiveView', () => {
  beforeAll(() => {
    // Ensure that items inside ObserverProvider are 'visible' to jest
    mockGetBoundingClientRect()
  })

  it('shows a loading screen while initial request is pending', async () => {
    await renderPaginatedArchive()
    expect(await screen.findByTestId('archived-item-loader')).toBeInTheDocument()
  })

  it('tells the user if the archive is empty', async () => {
    await renderPaginatedArchive([])
    expect(await screen.findByText("There aren't any archived items")).toBeInTheDocument()
  })

  it('renders archived items', async () => {
    await renderPaginatedArchive([archivedItemFactory.withTitleColumnValue('My archived item').build()])
    expect(await screen.findByText('My archived item')).toBeInTheDocument()
  })

  it('renders pagination links if items are available', async () => {
    await renderPaginatedArchive([archivedItemFactory.build()])
    expect(await screen.findByText('Previous')).toBeInTheDocument()
    expect(await screen.findByText('Next')).toBeInTheDocument()
  })

  it('omits pagination links if no items are present', async () => {
    await renderPaginatedArchive([])
    expect(screen.queryByText('Previous')).not.toBeInTheDocument()
    expect(screen.queryByText('Next')).not.toBeInTheDocument()
  })

  it('disables pagination links if all results are visible', async () => {
    await renderPaginatedArchive([archivedItemFactory.build()])
    const buttons = await screen.findAllByRole('button', {name: /previous|next/i})
    expect(buttons.length).toBe(2)
    for (const button of buttons) {
      expect(button).toBeDisabled()
    }
  })

  describe('loading more results', () => {
    const firstItem = archivedItemFactory.withTitleColumnValue('First').build()
    const lastItem = archivedItemFactory.withTitleColumnValue('Last').build()

    it('fetches additional items when the next button is clicked', async () => {
      await renderPaginatedArchiveWithNextResults([firstItem])

      const nextButton = await findNextButton()
      expect(nextButton).toBeEnabled()
      expect(await screen.findByText('First')).toBeInTheDocument()
      expect(screen.queryByText('Last')).not.toBeInTheDocument()

      mockResponseWithNextPage([lastItem])

      act(() => nextButton.click())
      expect(await screen.findByText('Last')).toBeInTheDocument()
    })

    it('loads previous pages from the cache', async () => {
      await renderPaginatedArchiveWithNextResults([firstItem])
      const nextButton = await findNextButton()
      const previousButton = await findPreviousButton()

      expect(previousButton).toBeDisabled()

      const mockRequest = mockResponseWithNextPage([lastItem])

      act(() => nextButton.click())
      expect(previousButton).toBeEnabled()
      await waitFor(() => {
        expect(screen.queryByText('First')).not.toBeInTheDocument()
      })
      expect(mockRequest).toHaveBeenCalledTimes(1)

      act(() => previousButton.click())
      expect(await screen.findByText('First')).toBeInTheDocument()
      expect(mockRequest).toHaveBeenCalledTimes(1)
    })
  })

  describe('filtering', () => {
    it('renders message indicating no items match current query', async () => {
      await renderPaginatedArchive([])
      expect(await screen.findByText("There aren't any archived items")).toBeInTheDocument()

      await userEvent.type(await findFilterInput(), 'is:open')

      expect(await screen.findByText('No results matched your filter')).toBeInTheDocument()
    })

    it('clear button resets input', async () => {
      await renderPaginatedArchive([])
      expect(await screen.findByText("There aren't any archived items")).toBeInTheDocument()

      await userEvent.type(await findFilterInput(), 'is:open')

      expect(await screen.findByText('No results matched your filter')).toBeInTheDocument()

      const clearButton = await findClearFilterButton()
      await userEvent.click(clearButton)

      expect(await screen.findByText("There aren't any archived items")).toBeInTheDocument()
      expect(await findFilterInput()).toHaveValue('')
    })

    it('fires off a new request when the filter value has changed', async () => {
      await renderPaginatedArchive([])
      expect(await screen.findByText("There aren't any archived items")).toBeInTheDocument()

      const mockRequest = mockResponseWithNoItems()

      await userEvent.type(await findFilterInput(), 'is:open')

      await expectToHaveBeenCalledAtLeastTimes(mockRequest, 1)
      expect(await screen.findByText('No results matched your filter')).toBeInTheDocument()
    })

    it('pagination state is reset after query has changed', async () => {
      const firstItem = archivedItemFactory.withTitleColumnValue('First').build()
      const lastItem = archivedItemFactory.withTitleColumnValue('Last').build()

      await renderPaginatedArchiveWithNextResults([firstItem])
      const nextButton = await findNextButton()
      const previousButton = await findPreviousButton()

      let mockRequest = mockResponseWithNextPage([lastItem])

      act(() => nextButton.click())
      await waitFor(() => {
        expect(screen.queryByText('First')).not.toBeInTheDocument()
      })
      expect(mockRequest).toHaveBeenCalledTimes(1)

      // Now that we have moved to a state where we have a previous page,
      // we can test that the pagination state is reset after the query has changed

      mockRequest = mockResponseWithNoItems()

      await userEvent.type(await findFilterInput(), 'is:open')

      expect(await screen.findByText('No results matched your filter')).toBeInTheDocument()
      await expectToHaveBeenCalledAtLeastTimes(mockRequest, 1)

      expect(previousButton).toBeDisabled()
    })

    it('shows keyword suggestions', async () => {
      await renderPaginatedArchive([])
      expect(await screen.findByText("There aren't any archived items")).toBeInTheDocument()
      await userEvent.click(await findFilterInput())

      await expectSuggestions(['No', 'Is', 'Assignee', 'Status'])
    })

    it('shows suggestions for is: keyword', async () => {
      await renderPaginatedArchive([])
      expect(await screen.findByText("There aren't any archived items")).toBeInTheDocument()

      await userEvent.type(await findFilterInput(), 'is:')
      await expectSuggestions(['Issue', 'Pull Request', 'Open', 'Closed', 'Merged', 'Draft'])
    })

    it('shows suggestions for no: keyword', async () => {
      await renderPaginatedArchive([])
      expect(await screen.findByText("There aren't any archived items")).toBeInTheDocument()

      await userEvent.type(await findFilterInput(), 'no:')

      await expectSuggestions(['Assignee', 'Status'])
    })
  })

  describe('selecting items', () => {
    const firstItem = archivedItemFactory.withTitleColumnValue('First').build()
    it('can toggle non-redacted items', async () => {
      await renderPaginatedArchive([firstItem])

      const itemCheckbox = screen.getByRole('checkbox', {name: /First/i})
      expect(itemCheckbox).not.toBeChecked()
      expect(itemCheckbox).not.toBeDisabled()
      act(() => itemCheckbox.click())
      expect(itemCheckbox).toBeChecked()
      act(() => itemCheckbox.click())
      expect(itemCheckbox).not.toBeChecked()
    })

    it('cannot select redacted items', async () => {
      await renderPaginatedArchive([archivedItemFactory.redacted().build()])
      const itemCheckbox = screen.getByRole('checkbox', {name: /you don't have permission to access this item/i})
      expect(itemCheckbox).not.toBeChecked()
      expect(itemCheckbox).toBeDisabled()
    })

    it('cannot select recently restored items', async () => {
      await renderPaginatedArchive([archivedItemFactory.withTitleColumnValue('Newly restored').restored().build()])
      const itemCheckbox = screen.getByRole('checkbox', {name: /newly restored/i})
      expect(itemCheckbox).not.toBeChecked()
      expect(itemCheckbox).toBeDisabled()
    })

    it('requires write access to select items', async () => {
      await renderPaginatedArchive(
        [firstItem],
        DefaultPrivileges, // read-only access
      )
      const itemCheckbox = screen.getByRole('checkbox', {name: /First/i})
      expect(itemCheckbox).not.toBeChecked()
      expect(itemCheckbox).toBeDisabled()

      const selectAllCheckbox = screen.getByRole('checkbox', {name: /Select all/i})
      expect(selectAllCheckbox).not.toBeChecked()
      expect(selectAllCheckbox).toBeDisabled()
    })

    it('clears selection on page change', async () => {
      await renderPaginatedArchiveWithNextResults([firstItem])
      const itemCheckbox = screen.getByRole('checkbox', {name: /first/i})
      const selectAllCheckbox = screen.getByRole('checkbox', {name: /Select all/i})
      act(() => selectAllCheckbox.click())
      expect(itemCheckbox).toBeChecked()
      expect(selectAllCheckbox).toBeChecked()

      mockResponseWithNextPage([archivedItemFactory.build()])

      const nextButton = await findNextButton()
      act(() => nextButton.click())
      expect(selectAllCheckbox).not.toBeChecked()
      await waitFor(() => {
        expect(itemCheckbox).not.toBeInTheDocument()
      })
      const previousButton = await findPreviousButton()
      act(() => previousButton.click())
      const rerenderedItemCheckbox = screen.getByRole('checkbox', {name: /first/i})
      await waitFor(() => {
        expect(rerenderedItemCheckbox).toBeInTheDocument()
      })
      expect(rerenderedItemCheckbox).not.toBeChecked()
    })

    it('clears selection on query input change', async () => {
      await renderPaginatedArchive([firstItem])
      // Single selection
      const checkbox = screen.getByRole('checkbox', {name: /First/i})
      act(() => checkbox.click())
      expect(checkbox).toBeChecked()
      const mockRequest = mockResponseWithNextPage([archivedItemFactory.build()])
      await userEvent.type(await findFilterInput(), 'is:open')

      await expectToHaveBeenCalledAtLeastTimes(mockRequest, 1)

      // Nothing should be checked after changing the query
      expect(screen.queryAllByRole('checkbox', {checked: true})).toHaveLength(0)

      // Select all
      const selectAllCheckbox = screen.getByRole('checkbox', {name: /Select all/i})
      expect(selectAllCheckbox).not.toBeChecked()
      act(() => selectAllCheckbox.click())
      expect(selectAllCheckbox).toBeChecked()
      await userEvent.type(await findFilterInput(), 'is:open')
      await waitFor(() => expect(selectAllCheckbox).not.toBeChecked())
    })

    it('toggles all editable items', async () => {
      await renderPaginatedArchive([
        archivedItemFactory.withTitleColumnValue('First').build(),
        archivedItemFactory.build(),
        archivedItemFactory.redacted().build(),
        archivedItemFactory.withTitleColumnValue('Newly restored').restored().build(),
      ])
      const firstItemCheckbox = screen.getByRole('checkbox', {name: /First/i})

      // Partial selection
      act(() => firstItemCheckbox.click())
      expect(firstItemCheckbox).toBeChecked()
      const selectAllCheckbox = screen.getByRole('checkbox', {name: /Select all/i})
      expect(selectAllCheckbox).toBePartiallyChecked()
      expect(await screen.findByText(ArchiveResources.selectedItems(1))).toBeVisible()

      // Select all
      act(() => selectAllCheckbox.click())
      const checkboxes = await screen.findAllByRole('checkbox', {checked: true})
      expect(checkboxes).toHaveLength(3) // 2 items + select all checkbox
      const redactedCheckbox = await screen.findByRole('checkbox', {
        name: /you don't have permission to access this item/i,
        checked: false,
      })
      expect(redactedCheckbox).not.toBeChecked()
      const restoredCheckbox = await screen.findByRole('checkbox', {name: /newly restored/i, checked: false})
      expect(restoredCheckbox).not.toBeChecked()
      expect(await screen.findByText(ArchiveResources.selectedItems(2))).toBeVisible()

      // Select all on server should not be shown, as there is only a single page worth of data
      expect(
        screen.queryByRole('button', {name: ArchiveResources.selectAllMatchingItems({value: 2, isApproximate: false})}),
      ).not.toBeInTheDocument()

      // Deselect all
      act(() => selectAllCheckbox.click())
      expect(selectAllCheckbox).not.toBeChecked()
      expect(firstItemCheckbox).not.toBeChecked()
      expect(screen.queryByText('selected')).not.toBeInTheDocument()
    })
  })

  it('select matching items on server', async () => {
    await renderPaginatedArchiveWithNextResults([archivedItemFactory.withTitleColumnValue('Next').build()])

    // Select all
    const selectAllCheckbox = screen.getByRole('checkbox', {name: /Select all/i})
    act(() => selectAllCheckbox.click())

    // Click select all on server button
    const selectAllOnServerButton = await screen.findByRole('button', {
      name: ArchiveResources.selectAllMatchingItems({value: 2, isApproximate: false}),
    })
    expect(selectAllOnServerButton).toBeVisible()
    act(() => selectAllOnServerButton.click())

    expect(
      await screen.findByText(ArchiveResources.allSelectedMatchingItems({value: 2, isApproximate: false})),
    ).toBeVisible()

    // The select all on server button should no longer be shown, now that it has been clicked
    expect(
      screen.queryByRole('button', {name: ArchiveResources.selectAllMatchingItems({value: 2, isApproximate: false})}),
    ).not.toBeInTheDocument()

    const mockRequest = mockResponseWithNextPage([archivedItemFactory.build()])
    const nextButton = await findNextButton()
    act(() => nextButton.click())

    // The selection state stays the same after moving to the next page
    await expectToHaveBeenCalledAtLeastTimes(mockRequest, 1)
    expect(
      await screen.findByText(ArchiveResources.allSelectedMatchingItems({value: 2, isApproximate: false})),
    ).toBeVisible()
    expect(selectAllCheckbox).toBeChecked()
  })

  describe('restoring items', () => {
    const firstItem = archivedItemFactory.withTitleColumnValue('First').build()
    it('restores unredacted items individually', async () => {
      await renderPaginatedArchive([firstItem])
      const itemElement = screen.getByRole('link', {name: /First/i})
      expect(itemElement).toBeInTheDocument()
      const restoreButton = getItemAction(/Restore/i)
      expect(restoreButton).toBeEnabled()

      const unarchiveRequest = stubResolvedApiResponse(apiUnarchiveItems, void 0)
      const getArchivedItemsRequest = mockResponseWithNextPage([archivedItemFactory.build()])
      act(() => restoreButton.click())
      await waitFor(() => expect(unarchiveRequest).toHaveBeenCalled())
      await waitFor(() => expect(getArchivedItemsRequest).toHaveBeenCalled())
      // Stale cache triggers refetch and restored item is no longer shown
      await waitFor(() => expect(screen.queryByRole('link', {name: /First/i})).not.toBeInTheDocument())
    })

    it('shows toast when restore operation fails', async () => {
      await renderPaginatedArchive([firstItem])

      const itemElement = screen.getByRole('link', {name: /First/i})
      expect(itemElement).toBeInTheDocument()
      const restoreButton = getItemAction(/Restore/i)
      expect(restoreButton).toBeEnabled()

      const unarchiveRequest = stubRejectedApiResponse(apiUnarchiveItems, new ApiError('Failed to unarchive items'))

      act(() => restoreButton.click())

      await waitFor(() => expect(unarchiveRequest).toHaveBeenCalled())
      await screen.findByText('Failed to unarchive items')
    })

    it('disables restoration for redacted items', async () => {
      await renderPaginatedArchive([archivedItemFactory.redacted().build()])
      expect(screen.queryByRole('button', {name: /Open item actions/i})).not.toBeInTheDocument()
    })

    it('disables restoration for recently restored items', async () => {
      await renderPaginatedArchive([archivedItemFactory.withTitleColumnValue('Newly restored').restored().build()])
      expect(screen.queryByRole('button', {name: /Open item actions/i})).not.toBeInTheDocument()
    })

    it('restores items selected by ID in bulk', async () => {
      const secondItem = archivedItemFactory.withTitleColumnValue('Second').build()
      await renderPaginatedArchive([firstItem, secondItem])
      expect(screen.getByRole('link', {name: /First/i})).toBeInTheDocument()
      expect(screen.getByRole('link', {name: /Second/i})).toBeInTheDocument()

      // Bulk restore button isn't avilable until items are selected
      expect(screen.queryByRole('button', {name: /Restore/i})).not.toBeInTheDocument()
      const selectAllCheckbox = screen.getByRole('checkbox', {name: /Select all/i})
      act(() => selectAllCheckbox.click())
      expect(await screen.findByText('2 items selected')).toBeVisible()
      const restoreButton = screen.getByRole('button', {name: /Restore/i})
      expect(restoreButton).toBeEnabled()

      const unarchiveStub = stubResolvedApiResponse(apiUnarchiveItems, void 0)
      const getArchivedItemsAfterRestoreRequest = mockResponseWithNoItems()

      const archiveStatusRequest = mockGetArchiveStatus()
      act(() => restoreButton.click())
      // Items removed after restoration
      await waitFor(() => expect(screen.queryByRole('link', {name: /First/i})).not.toBeInTheDocument())
      await waitFor(() => expect(screen.queryByRole('link', {name: /Second/i})).not.toBeInTheDocument())
      // Selection cleared after restoration
      expect(screen.queryByText('2 items selected')).not.toBeInTheDocument()
      // Archive status refetched after restoration
      await waitFor(() => expect(archiveStatusRequest).toHaveBeenCalled())

      // assert that expected API operations also occurred
      expect(unarchiveStub).toHaveBeenCalled()
      expect(getArchivedItemsAfterRestoreRequest).toHaveBeenCalled()
    })

    it('restores all items matching query', async () => {
      await renderPaginatedArchiveWithNextResults([archivedItemFactory.withTitleColumnValue('Next').build()])

      // Select all
      const selectAllCheckbox = screen.getByRole('checkbox', {name: /Select all/i})
      act(() => selectAllCheckbox.click())

      // Click select all on server button
      const selectAllOnServerButton = await screen.findByRole('button', {
        name: ArchiveResources.selectAllMatchingItems({value: 2, isApproximate: false}),
      })
      expect(selectAllOnServerButton).toBeVisible()
      act(() => selectAllOnServerButton.click())

      // Click restore
      const restoreButton = screen.getByRole('button', {name: /Restore/i})
      expect(restoreButton).toBeEnabled()

      // We'll fire off several requests - the first being the unarchive request itself.
      // This will return a job url, so we'll make a second request to that url.
      // If that returns a 200, we'll consider the unarchive complete, and make a third
      // request to re-fetch the updated list of items
      const unarchiveStub = stubResolvedApiResponse(apiUnarchiveItems, void 0)
      const getArchivedItemsAfterRestoreRequest = mockResponseWithNoItems()
      act(() => restoreButton.click())
      await waitFor(() => expect(unarchiveStub).toHaveBeenCalled())
      await waitFor(() => expect(getArchivedItemsAfterRestoreRequest).toHaveBeenCalled())

      // Items removed after restoration
      await waitFor(() => expect(screen.queryByRole('link', {name: /Next/i})).not.toBeInTheDocument())
    })

    it('restore is disabled when total count exceeds project item limit', async () => {
      // Project item limit is set to 1200
      // Then we will set up our archived items response to include a totalCount of 1201 items
      // (1 returned in the query and 1200 more on the server),
      // which should exceed the limit and disable the restore button
      const totalCount = 1200
      await renderPaginatedArchiveWithNextResults(
        [archivedItemFactory.withTitleColumnValue('Next').build()],
        totalCount,
      )

      // Select all
      const selectAllCheckbox = screen.getByRole('checkbox', {name: /Select all/i})
      act(() => selectAllCheckbox.click())

      // Click select all on server button
      const selectAllOnServerButton = await screen.findByRole('button', {
        name: ArchiveResources.selectAllMatchingItems({value: totalCount + 1, isApproximate: false}),
      })
      expect(selectAllOnServerButton).toBeVisible()
      act(() => selectAllOnServerButton.click())

      // Check restore button, which is named by its tooltip in this case
      const restoreButton = await screen.findByRole('button', {name: /This will exceed the 1200 project item limit/i})
      expect(restoreButton).toBeDisabled()
    })
  })

  describe('deleting items', () => {
    const firstItem = archivedItemFactory.withTitleColumnValue('First').build()
    it('deletes unredacted items individually', async () => {
      // Suppress an error logged to the console around deprecated call to ReactDOM.render
      // This error is logged by the ConfirmationDialog - an issue to track the fix has been filed:
      // https://github.com/primer/react/issues/2990
      // Without this spyOn, we cannot write a test that opens the dialog, because we have
      // `shouldFailOnLog` enabled for jest tests that are run locally.
      jest.spyOn(console, 'error').mockImplementation()

      await renderPaginatedArchive([firstItem])
      const itemElement = screen.getByRole('link', {name: /First/i})
      expect(itemElement).toBeInTheDocument()
      const deleteButton = getItemAction(/Delete from project/i)
      expect(deleteButton).toBeEnabled()

      const deleteRequest = stubResolvedApiResponse(apiRemoveItems, void 0)
      const getArchivedItemsRequest = mockResponseWithNextPage([archivedItemFactory.build()])
      act(() => deleteButton.click())

      // We shouldn't make the request until the user has confirmed
      expect(deleteRequest).not.toHaveBeenCalled()

      // Confirmation dialog should be shown
      const dialog = await screen.findByRole('alertdialog')
      const confirmButton = await within(dialog).findByRole('button', {name: /Delete/i})
      act(() => confirmButton.click())

      await waitFor(() => expect(deleteRequest).toHaveBeenCalled())
      await waitFor(() => expect(getArchivedItemsRequest).toHaveBeenCalled())
      // Stale cache triggers refetch and deleted item is no longer shown
      await waitFor(() => expect(screen.queryByRole('link', {name: /First/i})).not.toBeInTheDocument())
    })

    it('deletes items selected by ID in bulk', async () => {
      // Suppress an error logged to the console around deprecated call to ReactDOM.render
      // This error is logged by the ConfirmationDialog - an issue to track the fix has been filed:
      // https://github.com/primer/react/issues/2990
      // Without this spyOn, we cannot write a test that opens the dialog, because we have
      // `shouldFailOnLog` enabled for jest tests that are run locally.
      jest.spyOn(console, 'error').mockImplementation()

      const secondItem = archivedItemFactory.withTitleColumnValue('Second').build()
      await renderPaginatedArchive([firstItem, secondItem])
      expect(screen.getByRole('link', {name: /First/i})).toBeInTheDocument()
      expect(screen.getByRole('link', {name: /Second/i})).toBeInTheDocument()

      // Bulk delete button isn't avilable until items are selected
      expect(screen.queryByRole('button', {name: /Delete/i})).not.toBeInTheDocument()
      const selectAllCheckbox = screen.getByRole('checkbox', {name: /Select all/i})
      act(() => selectAllCheckbox.click())
      expect(await screen.findByText('2 items selected')).toBeVisible()
      const deleteButton = screen.getByRole('button', {name: /Delete/i})
      expect(deleteButton).toBeEnabled()

      const archiveStatusRequest = mockGetArchiveStatus()
      const deleteRequest = stubResolvedApiResponse(apiRemoveItems, void 0)
      const getArchivedItemsRequest = mockResponseWithNextPage([archivedItemFactory.build()])
      act(() => deleteButton.click())

      // We shouldn't make the request until the user has confirmed
      expect(deleteRequest).not.toHaveBeenCalled()

      // Confirmation dialog should be shown
      const dialog = await screen.findByRole('alertdialog')
      const confirmButton = await within(dialog).findByRole('button', {name: /Delete/i})
      act(() => confirmButton.click())

      await waitFor(() => expect(deleteRequest).toHaveBeenCalled())
      await waitFor(() => expect(getArchivedItemsRequest).toHaveBeenCalled())

      // Items removed after deletion
      await waitFor(() => expect(screen.queryByRole('link', {name: /First/i})).not.toBeInTheDocument())
      await waitFor(() => expect(screen.queryByRole('link', {name: /Second/i})).not.toBeInTheDocument())
      // Selection cleared after deletion
      expect(screen.queryByText('2 items selected')).not.toBeInTheDocument()
      // Archive status refetched after deletion
      await waitFor(() => expect(archiveStatusRequest).toHaveBeenCalled())
    })
  })

  it('deletes all items matching query', async () => {
    // Suppress an error logged to the console around deprecated call to ReactDOM.render
    // This error is logged by the ConfirmationDialog - an issue to track the fix has been filed:
    // https://github.com/primer/react/issues/2990
    // Without this spyOn, we cannot write a test that opens the dialog, because we have
    // `shouldFailOnLog` enabled for jest tests that are run locally.
    jest.spyOn(console, 'error').mockImplementation()

    await renderPaginatedArchiveWithNextResults([archivedItemFactory.withTitleColumnValue('Next').build()])

    // Select all
    const selectAllCheckbox = screen.getByRole('checkbox', {name: /Select all/i})
    act(() => selectAllCheckbox.click())

    // Click select all on server button
    const selectAllOnServerButton = await screen.findByRole('button', {
      name: ArchiveResources.selectAllMatchingItems({value: 2, isApproximate: false}),
    })
    expect(selectAllOnServerButton).toBeVisible()
    act(() => selectAllOnServerButton.click())

    // Click delete
    const deleteButton = screen.getByRole('button', {name: /Delete/i})
    act(() => deleteButton.click())

    // Confirmation dialog should be shown
    const dialog = await screen.findByRole('alertdialog')
    const confirmButton = await within(dialog).findByRole('button', {name: /Delete/i})
    act(() => confirmButton.click())

    // We'll fire off several requests - the first being the delete request itself.
    // This will return a job url, so we'll make a second request to that url.
    // If that returns a 200, we'll consider the deletion complete, and make a third
    // request to re-fetch the updated list of items
    const removeItemsStub = stubResolvedApiResponse(apiRemoveItems, void 0)
    const getArchivedItemsAfterDeletionRequest = mockResponseWithNoItems()
    act(() => deleteButton.click())
    await waitFor(() =>
      expect(removeItemsStub).toHaveBeenCalledWith({
        scope: 'archived',
        q: '',
      }),
    )
    await waitFor(() => expect(getArchivedItemsAfterDeletionRequest).toHaveBeenCalled())

    // Items removed after restoration
    await waitFor(() => expect(screen.queryByRole('link', {name: /Next/i})).not.toBeInTheDocument())
  })
})

async function expectSuggestions(expected: Array<string>): Promise<void> {
  let listbox: HTMLElement | null = null

  await waitFor(() => {
    listbox = screen.getByTestId('query-builder-results')
    expect(listbox).not.toBeNull()
  })

  await waitFor(() => {
    const options = within(listbox as HTMLElement).getAllByRole('option')
    const suggestions = options.map(option => option.textContent?.trim())
    expect(suggestions).toEqual(expected)
  })
}

async function expectToHaveBeenCalledAtLeastTimes(mock: jest.Mock, expected: number): Promise<void> {
  await waitFor(() => {
    expect(mock.mock.calls.length).toBeGreaterThanOrEqual(expected)
  })
}
