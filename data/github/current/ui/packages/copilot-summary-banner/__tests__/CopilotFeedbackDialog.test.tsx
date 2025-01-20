import {act, screen, fireEvent} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {CopilotFeedbackDialog} from '../CopilotFeedbackDialog'

test('Renders the CopilotFeedbackDialog', () => {
  render(
    <CopilotFeedbackDialog
      onCancel={() => {}}
      onSubmitFeedback={() => {}}
      isOpen={true}
      classificationOptions={{foo: 'bar'}}
    />,
  )
  expect(screen.getByTestId('copilot-feedback-dialog')).toBeInTheDocument()
  expect(screen.getByTestId('copilot-privacy-statement-link')).toBeVisible()
})

test('Clicking "Close" calls onCancel and does not call onSubmitFeedback', () => {
  const mockFeedbackFunc = jest.fn()
  const mockCancelFunc = jest.fn()
  render(
    <CopilotFeedbackDialog
      onCancel={mockCancelFunc}
      onSubmitFeedback={mockFeedbackFunc}
      isOpen={true}
      classificationOptions={{foo: 'bar'}}
    />,
  )

  act(() => screen.getByText('Cancel').click())

  expect(mockCancelFunc).toHaveBeenCalledTimes(1)
  expect(mockFeedbackFunc).toHaveBeenCalledTimes(0)
})

test('Clicking "Submit feedback" calls onCancel and onSubmitFeedback', () => {
  const mockFeedbackFunc = jest.fn()
  const mockCancelFunc = jest.fn()
  render(
    <CopilotFeedbackDialog
      onCancel={mockCancelFunc}
      onSubmitFeedback={mockFeedbackFunc}
      isOpen={true}
      classificationOptions={{foo: 'bar'}}
    />,
  )
  const feedbackInput = screen.getByTestId('submit-feedback-input')
  fireEvent.change(feedbackInput, {target: {value: 'This is an unexpectedly valuable feature'}})

  act(() => screen.getByText('Submit feedback').click())

  expect(mockCancelFunc).toHaveBeenCalledTimes(1)
  expect(mockFeedbackFunc).toHaveBeenCalledTimes(1)
  expect(mockFeedbackFunc).toHaveBeenCalledWith('This is an unexpectedly valuable feature', false, '0')
})

test('"Submit feedback" button is disabled when no content has been entered', () => {
  const mockFeedbackFunc = jest.fn()
  render(
    <CopilotFeedbackDialog
      onCancel={() => {}}
      onSubmitFeedback={mockFeedbackFunc}
      isOpen={true}
      classificationOptions={{foo: 'bar'}}
    />,
  )
  expect(screen.getByTestId('submit-feedback-button')).toBeDisabled()
})
