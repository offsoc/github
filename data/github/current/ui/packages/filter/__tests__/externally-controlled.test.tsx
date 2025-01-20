import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {updateFilterValue} from '../test-utils'
import {ExternalWrapper} from './utils/ExternalWrapper'
import {
  expectFilterValueToBe,
  expectSuggestionsToBeEmpty,
  expectSuggestionsToMatchSnapshot,
  setupAsyncErrorHandler,
} from './utils/helpers'

describe('Externally Controlled Filter', () => {
  setupAsyncErrorHandler()

  it('should not show the suggestions menu if the input is not focused', async () => {
    const {user} = render(<ExternalWrapper />)

    await updateFilterValue('state', 'o')

    expectSuggestionsToMatchSnapshot()

    await user.click(document.body)

    const revertButton = await screen.findByTestId('filter-revert-query')
    await user.click(revertButton)

    await expectSuggestionsToBeEmpty()

    expectFilterValueToBe('')
  })
})
