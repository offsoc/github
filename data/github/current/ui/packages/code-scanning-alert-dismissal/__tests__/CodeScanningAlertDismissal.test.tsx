import {screen, fireEvent, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {CodeScanningAlertDismissal} from '../CodeScanningAlertDismissal'
import {getCodeScanningAlertDismissalProps} from '../test-utils/mock-data'

test('correctly renders the CodeScanningAlertDismissal component', () => {
  const props = getCodeScanningAlertDismissalProps()
  render(<CodeScanningAlertDismissal {...props} />)

  const button = screen.getByTestId('code-scanning-alert-dismissal-toggle-button')

  expect(button).toBeInTheDocument()

  expect(screen.queryByTestId('code-scanning-alert-dismissal-form')).toBeNull()

  fireEvent.click(button)
  expect(screen.getByTestId('code-scanning-alert-dismissal-form')).toBeInTheDocument()

  const reasons = screen.getAllByTestId('code-scanning-alert-dismissal-reason')
  expect(reasons).toHaveLength(Object.keys(props.alertClosureReasons).length)

  expect(screen.queryByTestId('code-scanning-alert-dismissal-comment')).toBeNull()

  const selectedReason = within(reasons[0]!).getByRole('radio')
  fireEvent.click(selectedReason)

  expect(selectedReason).toBeChecked()
  expect(screen.getByTestId('code-scanning-alert-dismissal-comment')).toBeInTheDocument()
})
