import {render} from '@github-ui/react-core/test-utils'
import {screen, waitFor} from '@testing-library/react'

import {Filter} from '../Filter'
import {StateFilterProvider, StatusFilterProvider} from '../providers'
import {updateFilterValue} from '../test-utils'
import {setupAsyncErrorHandler} from './utils/helpers'

const checkFilterQuerySync = jest.fn(jest.requireActual('../utils').checkFilterQuerySync)

jest.mock('../utils', () => {
  return new Proxy(jest.requireActual('../utils'), {
    get(target, prop) {
      if (prop === 'checkFilterQuerySync') {
        return checkFilterQuerySync
      }
      return target[prop]
    },
  })
})

describe('Out of sync', () => {
  setupAsyncErrorHandler()

  afterEach(() => {
    checkFilterQuerySync.mockRestore()
  })

  it('should not submit when the query is out of sync', async () => {
    checkFilterQuerySync.mockImplementation(() => false)

    const onSubmit = jest.fn()
    const filterProviders = [new StateFilterProvider(), new StatusFilterProvider()]
    const {user} = render(
      <Filter id="test-filter-bar" label="Filter" providers={filterProviders} onSubmit={onSubmit} />,
    )
    const input = screen.getByRole('combobox')

    await updateFilterValue('foo')
    await user.type(input, '{Enter}')

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  it('should not submit when checkFilterQuerySync returns false after pressing enter', async () => {
    const onSubmit = jest.fn()
    const filterProviders = [new StateFilterProvider(), new StatusFilterProvider()]
    const {user} = render(
      <Filter id="test-filter-bar" label="Filter" providers={filterProviders} onSubmit={onSubmit} />,
    )
    const input = screen.getByRole('combobox')

    const promise = updateFilterValue('foo')
    checkFilterQuerySync.mockImplementation(() => false)
    await promise

    await user.type(input, '{Enter}')

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })
})
