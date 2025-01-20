import {expectMockFetchCalledTimes, mockFetch} from '@github-ui/mock-fetch'
import {render, type User} from '@github-ui/react-core/test-utils'
import {screen, waitFor} from '@testing-library/react'

import {OwnerDropdown} from '../OwnerDropdown'
import {ownerItems} from './test-helpers'

const ownerItemsPath = '/repositories/forms/owner_items'

describe('OwnerDropdown', () => {
  describe('deferred loading', () => {
    test('uses correct url for create and import', async () => {
      mockFetch.mockRouteOnce(ownerItemsPath, {owners: ownerItems})
      const {user} = renderOwnerDropdown({initialOwnerItems: undefined})

      await openOwnerDropdown(user)
      expectMockFetchCalledTimes(ownerItemsPath, 1)
      await waitFor(() => expect(getDropdownItems()).toHaveLength(2))
    })

    test('uses correct url for transfer and excludes owner before rendering', async () => {
      mockFetch.mockRouteOnce(ownerItemsPath, {
        owners: ownerItems,
      })
      const {user} = renderOwnerDropdown({initialOwnerItems: undefined, excludedOrg: ownerItems[0]?.name})

      await openOwnerDropdown(user)
      expectMockFetchCalledTimes(ownerItemsPath, 1)
      await waitFor(() => expect(getDropdownItems()).toHaveLength(1))
    })
  })

  test('render items', async () => {
    const {user} = renderOwnerDropdown()
    await openOwnerDropdown(user)

    expect(getDropdownItems()).toHaveLength(2)
  })

  test('render items except the given org with excluded org', async () => {
    const {user} = renderOwnerDropdown({excludedOrg: 'octocat'})
    await openOwnerDropdown(user)

    expect(getDropdownItems()).toHaveLength(1)
  })

  test('render items except the given org', async () => {
    const {user} = renderOwnerDropdown()
    await openOwnerDropdown(user)
    expect(getDropdownItems()).toHaveLength(2)

    const searchField = screen.getByRole('textbox', {name: 'Search owner'})

    await user.type(searchField, 'mona')
    expect(getDropdownItems()).toHaveLength(1)

    await user.clear(searchField)
    await user.type(searchField, 'leo')
    expect(getDropdownItems()).toHaveLength(0)
  })

  function renderOwnerDropdown(partial: Partial<React.ComponentProps<typeof OwnerDropdown>> = {}) {
    const props = {
      initialOwnerItems: ownerItems,
      onOwnerChange: jest.fn(),
      ownerItemsPath,
      ...partial,
    }
    return render(<OwnerDropdown {...props} />)
  }
})

function getDropdownItems() {
  return screen.queryAllByRole('menuitemradio')
}

async function openOwnerDropdown(user: User) {
  await user.click(screen.getByRole('button', {name: 'Choose an owner'}))
}
