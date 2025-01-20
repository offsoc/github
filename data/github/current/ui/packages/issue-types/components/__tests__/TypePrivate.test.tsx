import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

import {TypePrivate} from '../TypePrivate'

afterEach(() => {
  jest.clearAllMocks()
})

describe('type private toggling', () => {
  test('toggle isPrivate', async () => {
    const isPrivate = false
    const setIsPrivate = jest.fn()

    const {user} = render(<TypePrivate isPrivate={isPrivate} setIsPrivate={setIsPrivate} />)
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(setIsPrivate).toHaveBeenCalledTimes(1)
  })
})
