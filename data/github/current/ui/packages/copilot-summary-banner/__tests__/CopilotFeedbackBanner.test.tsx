import {act, screen, waitFor, fireEvent} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {CopilotFeedbackBanner} from '../CopilotFeedbackBanner'

const props = {
  jobId: 'sample_ID',
  feedbackUrl: 'https://www.github.com',
  feedbackAuthToken: 'very-secret',
  classificationOptions: {foo: 'bar'},
}

const successfulSendFeedback = jest.fn().mockImplementation(() => Promise.resolve())
const failedSendFeedback = jest.fn().mockImplementation(() => Promise.reject(new Error('Whoops!')))
const successfulThenFailedSendFeedback = jest
  .fn()
  .mockImplementation(() => Promise.resolve())
  .mockImplementationOnce(() => Promise.reject(new Error('Whoops!')))

test('Renders the CopilotFeedbackBanner with inital text content', () => {
  render(<CopilotFeedbackBanner {...props} />)

  expect(screen.getByTestId('copilot-feedback-banner')).toBeInTheDocument()
  expect(screen.getByTestId('copilot-feedback-message')).toHaveTextContent('How did Copilot perform?')
})

test('Clicking the "good" response button submits feedback and shows the additional feedback button', async () => {
  successfulSendFeedback.mockReset()
  render(<CopilotFeedbackBanner sendFeedback={successfulSendFeedback} {...props} />)
  expect(screen.queryByText('Give additional feedback')).not.toBeInTheDocument()

  await waitFor(() => {
    screen.getByTestId('summary-good-response-button').click()
    expect(successfulSendFeedback).toHaveBeenCalledWith(props.feedbackUrl, props.feedbackAuthToken, {
      sentiment: 'positive',
    })
  })

  expect(screen.getByText('Give additional feedback')).toBeInTheDocument()
})

test('Clicking the "bad" response button submits feedback and shows the additional feedback button', async () => {
  successfulSendFeedback.mockReset()
  render(<CopilotFeedbackBanner sendFeedback={successfulSendFeedback} {...props} />)
  expect(screen.queryByText('Give additional feedback')).not.toBeInTheDocument()

  await waitFor(() => {
    screen.getByTestId('summary-bad-response-button').click()
    expect(successfulSendFeedback).toHaveBeenCalledWith(props.feedbackUrl, props.feedbackAuthToken, {
      sentiment: 'negative',
    })
  })

  expect(screen.getByText('Give additional feedback')).toBeInTheDocument()
})

test('failed sendFeedback request restores feedback buttons and does not show additional feedback link', async () => {
  jest.spyOn(console, 'error').mockImplementation() // there is a console.error call we need to mock here
  render(<CopilotFeedbackBanner sendFeedback={failedSendFeedback} {...props} />)

  act(() => screen.getByTestId('summary-bad-response-button').click())

  expect(await screen.findByTestId('summary-bad-response-button')).toBeInTheDocument()
  expect(await screen.findByTestId('summary-good-response-button')).toBeInTheDocument()
  await waitFor(() => expect(screen.queryByText('Give additional feedback')).not.toBeInTheDocument())
})

test('clicking the additional feedback button opens the extended feedback dialog', async () => {
  render(<CopilotFeedbackBanner sendFeedback={successfulSendFeedback} {...props} />)
  act(() => screen.getByTestId('summary-good-response-button').click())

  act(() => screen.getByText('Give additional feedback').click())

  expect(await screen.findByTestId('copilot-feedback-dialog')).toBeInTheDocument()
})

test('successful additional feedback submission closes the dialog and shows expected text', async () => {
  successfulSendFeedback.mockReset()
  render(<CopilotFeedbackBanner sendFeedback={successfulSendFeedback} {...props} />)
  act(() => screen.getByTestId('summary-good-response-button').click())
  act(() => screen.getByText('Give additional feedback').click()) // open the dialog
  const feedbackInput = screen.getByTestId('submit-feedback-input') // fill in some feedback
  fireEvent.change(feedbackInput, {target: {value: 'This is an unexpectedly valuble feature'}})
  act(() => screen.getByText('Submit feedback').click()) // click the submit button on the dialog

  // the dialog is now closed
  await waitFor(() => expect(screen.queryByTestId('copilot-feedback-dialog')).not.toBeInTheDocument())
  expect(successfulSendFeedback).toHaveBeenCalledTimes(2) // once for the first good/bad feedback and once for the update with additional feedback

  // the additional feedback link is now gone
  await waitFor(() => expect(screen.queryByText('Give additional feedback')).not.toBeInTheDocument())

  // the expected success message is shown to the user
  expect(await screen.findByText('Thank you!')).toBeInTheDocument()
})

test('failed additional feedback submission closes the dialog and shows expected text', async () => {
  jest.spyOn(console, 'error').mockImplementation() // there is a console.error call we need to mock here
  render(<CopilotFeedbackBanner sendFeedback={successfulThenFailedSendFeedback} {...props} />)
  act(() => screen.getByTestId('summary-good-response-button').click())
  act(() => screen.getByText('Give additional feedback').click()) // open the dialog
  const feedbackInput = screen.getByTestId('submit-feedback-input') // fill in some feedback
  fireEvent.change(feedbackInput, {target: {value: 'This is an unexpectedly valuble feature'}})
  act(() => screen.getByText('Submit feedback').click()) // click the submit button on the dialog

  // the dialog is now closed
  await waitFor(() => expect(screen.queryByTestId('copilot-feedback-dialog')).not.toBeInTheDocument())

  // the additional feedback link is gone
  await waitFor(() => expect(screen.queryByText('Give additional feedback')).not.toBeInTheDocument())

  // the initial feedback message has returned
  expect(await screen.findByText('How did Copilot perform?')).toBeInTheDocument()
})

test('Clarifies use case that feedback is targeting (pr summary)', async () => {
  successfulSendFeedback.mockReset()
  render(<CopilotFeedbackBanner sendFeedback={successfulSendFeedback} {...props} />)
  expect(screen.queryByText('Give additional feedback')).not.toBeInTheDocument()

  const goodRespButton = screen.getByTestId('summary-good-response-button')
  expect(goodRespButton.getAttribute('aria-label')).toBe('Good summary response')
  const badRespButton = screen.getByTestId('summary-bad-response-button')
  expect(badRespButton.getAttribute('aria-label')).toBe('Bad summary response')
})

test('Clarifies use case that feedback is targeting (text completion)', async () => {
  successfulSendFeedback.mockReset()
  render(
    <CopilotFeedbackBanner
      sendFeedback={successfulSendFeedback}
      {...{...props, sessionId: 'text-completion-123', jobId: undefined}}
    />,
  )
  expect(screen.queryByText('Give additional feedback')).not.toBeInTheDocument()

  const goodRespButton = screen.getByTestId('summary-good-response-button')
  expect(goodRespButton.getAttribute('aria-label')).toBe('Good text completion response')
  const badRespButton = screen.getByTestId('summary-bad-response-button')
  expect(badRespButton.getAttribute('aria-label')).toBe('Bad text completion response')
})

test('Clarifies use case that feedback is targeting (text completion + summary)', async () => {
  successfulSendFeedback.mockReset()
  render(
    <CopilotFeedbackBanner
      sendFeedback={successfulSendFeedback}
      {...{...props, jobId: 'summary-123', sessionId: 'text-completion-123'}}
    />,
  )
  expect(screen.queryByText('Give additional feedback')).not.toBeInTheDocument()

  const goodRespButton = screen.getByTestId('summary-good-response-button')
  expect(goodRespButton.getAttribute('aria-label')).toBe('Good summary or text completion response')
  const badRespButton = screen.getByTestId('summary-bad-response-button')
  expect(badRespButton.getAttribute('aria-label')).toBe('Bad summary or text completion response')
})
