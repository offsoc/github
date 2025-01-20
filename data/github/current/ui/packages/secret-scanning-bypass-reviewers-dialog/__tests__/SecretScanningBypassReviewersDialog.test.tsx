import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {SecretScanningBypassReviewersDialog} from '../SecretScanningBypassReviewersDialog'
import {getSecretScanningBypassReviewersDialogProps} from '../test-utils/mock-data'

it('Renders the SecretScanningBypassReviewersDialog', () => {
  const props = getSecretScanningBypassReviewersDialogProps()
  render(<SecretScanningBypassReviewersDialog {...props} />)
  expect(screen.getByRole('button')).toHaveTextContent('Add role or team')
})
