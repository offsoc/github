/* eslint eslint-comments/no-use: off */

import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {apiBulkAddItemsFromMultipleRepos} from '../../../client/api/memex-items/api-bulk-add-items-from-multiple-repos'
import {TrackedByMissingIssuesButton} from '../../../client/components/tracked-by/tracked-by-missing-issues-button'
import {getInitialState} from '../../../client/helpers/initial-state'
import {useEnabledFeatures} from '../../../client/hooks/use-enabled-features'
import {OldBugTrackedItem} from '../../../mocks/memex-items/tracked-issues'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {stubGetItemsTrackedByParent} from '../../mocks/api/memex-items'
import {asMockHook} from '../../mocks/stub-utilities'
import {
  createTrackedByItemsStateProviderWrapper,
  mockTrackedItemsByParent,
} from '../../state-providers/tracked-by-items/helpers'

jest.mock('../../../client/hooks/use-enabled-features')
jest.mock('../../../client/helpers/initial-state')
jest.mock('../../../client/api/memex-items/api-bulk-add-items-from-multiple-repos')

async function waitForMissingRowToSettle() {
  return act(() => new Promise(resolve => setTimeout(resolve, 350))) as Promise<void>
}

let user: ReturnType<typeof userEvent.setup>

describe('tracked by missing issues row - success cases', () => {
  beforeEach(() => {
    asMockHook(useEnabledFeatures).mockReturnValue({
      tasklist_block: true,
    })
    // since we mock this hook's module out with
    // jest.mock('../../../../client/helpers/initial-state')
    // we need to at least mock the hook, otherwise this suite
    // will fail unless it is run in conjunction with the other suite in this
    // test module.
    asMockHook(getInitialState).mockReturnValue({
      projectLimits: {projectItemLimit: 1200} as any,
    })
    user = userEvent.setup()
  })

  it('makes a request to server when grouping by tracked by to get missing items', async () => {
    const {trackedByWrapper} = createTrackedByItemsStateProviderWrapper()

    const getItemsTrackedByParentStub = stubGetItemsTrackedByParent(mockTrackedItemsByParent)

    render(<TrackedByMissingIssuesButton trackedBy={OldBugTrackedItem} />, {
      wrapper: trackedByWrapper,
    })
    await waitForMissingRowToSettle()

    expect(getItemsTrackedByParentStub).toHaveBeenCalledTimes(1)
  })

  it('makes a request to server to bulk add all the items in the menu when clicked on add all items', async () => {
    const {trackedByWrapper} = createTrackedByItemsStateProviderWrapper()

    const bulkAddItemsFromMultipleReposStub = stubResolvedApiResponse(apiBulkAddItemsFromMultipleRepos, true)

    render(<TrackedByMissingIssuesButton trackedBy={OldBugTrackedItem} />, {
      wrapper: trackedByWrapper,
    })
    await waitForMissingRowToSettle()

    const openMenuButton = await screen.findByTestId('tracked-by-missing-issues-button')
    await user.click(openMenuButton)

    const bulkAddButton = await screen.findByTestId('tracked-by-missing-issues-menu-add-all')

    await user.click(bulkAddButton)

    await waitForMissingRowToSettle()

    expect(bulkAddItemsFromMultipleReposStub).toHaveBeenCalledTimes(1)
    expect(bulkAddItemsFromMultipleReposStub).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          userName: 'github',
          repoName: 'memex',
          number: 1000,
          title: 'A closed issue that can be added',
        }),
        expect.objectContaining({
          userName: 'github',
          repoName: 'memex',
          number: 1001,
          title: 'I am an integration test fixture',
        }),
      ],
      [],
    )
  })

  it('makes a request to server to add individual items when clicked on the individual item', async () => {
    const {trackedByWrapper} = createTrackedByItemsStateProviderWrapper()

    stubGetItemsTrackedByParent(mockTrackedItemsByParent)
    const bulkAddItemsFromMultipleReposStub = stubResolvedApiResponse(apiBulkAddItemsFromMultipleRepos, true)

    render(<TrackedByMissingIssuesButton trackedBy={OldBugTrackedItem} />, {
      wrapper: trackedByWrapper,
    })

    await waitForMissingRowToSettle()

    const openMenuButton = await screen.findByTestId('tracked-by-missing-issues-button')
    await user.click(openMenuButton)

    const addIndividualItemButton = await screen.findByTestId('tracked-by-missing-issue-row-child 2')

    await user.click(addIndividualItemButton)

    await waitForMissingRowToSettle()

    expect(bulkAddItemsFromMultipleReposStub).toHaveBeenCalledTimes(1)
    expect(bulkAddItemsFromMultipleReposStub).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          userName: 'github',
          repoName: 'public-server',
          number: 3,
          title: 'child 2',
        }),
      ],
      [],
    )
  })

  it('does not make a request to server when adding items over the max limit', async () => {
    asMockHook(getInitialState).mockReturnValue({
      projectLimits: {projectItemLimit: 0} as any,
    })

    const {trackedByWrapper} = createTrackedByItemsStateProviderWrapper()

    stubGetItemsTrackedByParent(mockTrackedItemsByParent)
    const bulkAddItemsFromMultipleReposStub = stubResolvedApiResponse(apiBulkAddItemsFromMultipleRepos, true)

    render(<TrackedByMissingIssuesButton trackedBy={OldBugTrackedItem} />, {
      wrapper: trackedByWrapper,
    })

    await waitForMissingRowToSettle()

    const openMenuButton = await screen.findByTestId('tracked-by-missing-issues-button')
    await user.click(openMenuButton)

    const addIndividualItemButton = await screen.findByTestId('tracked-by-missing-issue-row-child 2')

    await user.click(addIndividualItemButton)

    expect(await screen.findByTestId('toast')).toHaveTextContent(
      'Adding these items will exceed the 0 project item limit',
    )
    expect(bulkAddItemsFromMultipleReposStub).not.toHaveBeenCalled()
  })
})
