import {act, screen, waitFor} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {sendEvent} from '@github-ui/hydro-analytics'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {CopilotSummaryBanner} from '../CopilotSummaryBanner'
import {INIT_EVENT, END_EVENT} from '../constants'

jest.mock('@github-ui/feature-flags')

const successfulRequest = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    jobId: '1',
    feedbackUrl: 'https://www.github.com/feedback',
    feedbackAuthToken: 'secret-token',
    completion: 'This is the summary text',
  })
})

const successfulOutlineRequest = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    jobId: '1',
    feedbackUrl: 'https://www.github.com/feedback',
    feedbackAuthToken: 'secret-token',
    completion: `Content Deletion:
    * [one/two/three/delete_me.md](diffhunk://#diff-e423d81df66f762b3286b918139a045441c0688f9e1704e1f53bca2ce1daff34L1): The content "todo: delete me" was deleted.`,
  })
})

const oneSecondRequest = jest.fn().mockImplementation(() => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        jobId: '1',
        feedbackUrl: 'https://www.github.com/feedback',
        feedbackAuthToken: 'secret-token',
        completion: 'This is the summary text',
      })
    }, 1000)
  })
})

const failedRequest = jest.fn().mockImplementation(() => {
  return Promise.reject(new Error('Whoops!'))
})

const mockProps = {
  url: 'https://www.github.com',
  baseRevision: 'base',
  headRevision: 'head',
  headRepoId: '1',
  userFeedbackOptIn: true,
  requestSummary: successfulRequest,
  classificationOptions: {foo: 'bar'},
}

const outlineMockProps = {
  url: 'https://www.github.com',
  baseRevision: 'base',
  headRevision: 'head',
  headRepoId: '1',
  userFeedbackOptIn: true,
  requestSummary: successfulOutlineRequest,
  classificationOptions: {foo: 'bar'},
}

jest.mock('@github-ui/hydro-analytics', () => {
  return {
    sendEvent: jest.fn(),
  }
})

const triggerEvent = new CustomEvent(INIT_EVENT, {bubbles: true, detail: {action: 'all'}})
const triggerSummaryEvent = new CustomEvent(INIT_EVENT, {bubbles: true, detail: {action: 'summary'}})
const triggerOutlineEvent = new CustomEvent(INIT_EVENT, {bubbles: true, detail: {action: 'outline'}})

test('Renders an empty CopilotSummaryBanner when no events are fired', () => {
  render(<CopilotSummaryBanner {...mockProps} />)
  expect(screen.getByTestId('copilot-summary-banner')).toBeInTheDocument()
  expect(screen.getByTestId('copilot-summary-banner')).toBeEmptyDOMElement()
})

test('Renders the error banner when a copilot-pr-summary is fired and an error is thrown', async () => {
  jest.spyOn(console, 'error').mockImplementation()
  render(
    <form data-testid="test-form">
      <div className="js-copilot-summary-banner-container">
        <input data-csrf="true" defaultValue="secret-token" />
        <CopilotSummaryBanner {...{...mockProps, requestSummary: failedRequest}} />
      </div>
    </form>,
  )
  await waitFor(() => {
    screen.getByTestId('test-form').dispatchEvent(triggerEvent)
    expect(screen.getByTestId('copilot-summary-error-banner')).toBeInTheDocument()
  })
})

test('Renders the feedback banner when a copilot-pr-summary is fired and feedback data is returned', async () => {
  render(
    <form data-testid="test-form">
      <div className="js-copilot-summary-banner-container">
        <input data-csrf="true" defaultValue="secret-token" />
        <CopilotSummaryBanner {...mockProps} />
      </div>
    </form>,
  )
  await waitFor(() => {
    screen.getByTestId('test-form').dispatchEvent(triggerEvent)
    expect(screen.getByTestId('copilot-feedback-banner')).toBeInTheDocument()
  })
})

test('Does not render the feedback banner after a copilot-pr-summary is fired and feedback data is returned when userFeedbackOptIn is false', async () => {
  render(
    <form data-testid="test-form">
      <div className="js-copilot-summary-banner-container">
        <input data-csrf="true" defaultValue="secret-token" />
        <CopilotSummaryBanner {...mockProps} userFeedbackOptIn={false} />
      </div>
    </form>,
  )
  await waitFor(() => {
    screen.getByTestId('test-form').dispatchEvent(triggerEvent)
    expect(screen.queryByTestId('copilot-feedback-banner')).not.toBeInTheDocument()
  })
})

test('Fires an event when the completion is finished', async () => {
  jest.spyOn(console, 'error').mockImplementation()
  render(
    <form data-testid="test-form">
      <textarea data-testid="textarea" />
      <div className="js-copilot-summary-banner-container">
        <input data-csrf="true" defaultValue="secret-token" />
        <CopilotSummaryBanner {...mockProps} />
      </div>
    </form>,
  )

  const form = screen.getByTestId('test-form')
  let event
  form.addEventListener(END_EVENT, e => {
    event = e
  })

  await waitFor(() => {
    form.dispatchEvent(triggerEvent)
    expect(screen.getByTestId('copilot-feedback-banner')).toBeInTheDocument()
  })

  expect(event).not.toBe(undefined)
})

test('Renders warning dialog if form is submitted while waiting for request', async () => {
  render(
    <form data-testid="test-form">
      <div className="js-copilot-summary-banner-container">
        <input data-csrf="true" defaultValue="secret-token" />
        <CopilotSummaryBanner {...{...mockProps, requestSummary: oneSecondRequest}} />
      </div>
    </form>,
  )
  await waitFor(() => {
    screen.getByTestId('test-form').dispatchEvent(triggerEvent)
    expect(screen.getByTestId('copilot-summary-banner')).toBeInTheDocument()
  })
  await waitFor(() => {
    screen.getByTestId('test-form').dispatchEvent(new Event('submit'))
    expect(screen.getByTestId('copilot-is-loading-warning-dialog')).toBeInTheDocument()
  })
})

test('Dismisses warning dialog and continues with completion if cancel button clicked', async () => {
  render(
    <form data-testid="test-form">
      <div className="js-copilot-summary-banner-container">
        <input data-csrf="true" defaultValue="secret-token" />
        <CopilotSummaryBanner {...{...mockProps, requestSummary: oneSecondRequest}} />
      </div>
    </form>,
  )

  act(() => {
    screen.getByTestId('test-form').dispatchEvent(triggerEvent)
  })
  expect(screen.getByTestId('copilot-summary-banner')).toBeInTheDocument()

  act(() => {
    screen.getByTestId('test-form').dispatchEvent(new Event('submit'))
  })
  expect(screen.getByTestId('copilot-is-loading-warning-dialog')).toBeInTheDocument()
  const cancelBtn = screen.getByTestId('dialog-cancel-btn')
  expect(cancelBtn).toBeInTheDocument()

  act(() => {
    cancelBtn.click()
  })
  expect(screen.queryByTestId('copilot-is-loading-warning-dialog')).toBe(null)

  await waitFor(() => {
    expect(screen.getByTestId('copilot-feedback-banner')).toBeInTheDocument()
  })
})

test('Discards completion attempt if user chooses to discard dialog', async () => {
  render(
    <form data-testid="test-form">
      <textarea data-testid="textarea" />
      <div className="js-copilot-summary-banner-container">
        <input data-csrf="true" defaultValue="secret-token" />
        <CopilotSummaryBanner {...{...mockProps, requestSummary: oneSecondRequest}} />
      </div>
    </form>,
  )

  act(() => {
    screen.getByTestId('test-form').dispatchEvent(triggerEvent)
  })
  expect(screen.getByTestId('copilot-summary-banner')).toBeInTheDocument()
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement
  expect(textarea.value).toBe('[Copilot is generating a summary...]')

  act(() => {
    screen.getByTestId('test-form').dispatchEvent(new Event('submit'))
  })
  expect(screen.getByTestId('copilot-is-loading-warning-dialog')).toBeInTheDocument()
  const discardBtn = screen.getByTestId('dialog-discard-btn')
  expect(discardBtn).toBeInTheDocument()

  act(() => {
    discardBtn.click()
  })
  expect(textarea.value).toBe('')
})

test('Calculates the percentage variance between the saved text and summary text, send result to hydro', async () => {
  const summary = 'This is the summary text'
  const bodyString = 'This is the summary text. It has been modified from the result.'
  render(
    <form data-testid="test-form">
      <div className="js-copilot-summary-banner-container">
        <input data-csrf="true" defaultValue="secret-token" />
        <CopilotSummaryBanner {...mockProps} />
      </div>
      <textarea data-testid="textarea" />
    </form>,
  )

  await waitFor(() => {
    screen.getByTestId('test-form').dispatchEvent(triggerEvent)
    expect(successfulRequest).toHaveBeenCalled()
  })

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement
  expect(textarea.value).toBe(summary)

  // Edit the generated summary
  textarea.value = bodyString

  await waitFor(() => {
    screen.getByTestId('test-form').dispatchEvent(new Event('submit'))
    expect(sendEvent).toHaveBeenCalledWith('copilot.pr_summary.change_percentage', {
      match_percentage: 100,
      repo_id: mockProps.headRepoId,
      action: 'all',
    })
  })
})

describe('Split actions feature', () => {
  test('Calculates the percentage variance between the saved text and the summary-only text, send results to hydro', async () => {
    ;(isFeatureEnabled as jest.Mock).mockImplementation(name => name === 'copilot_split_actions_enabled')

    const summary = 'This is the summary text'
    const bodyString = 'This is the summary text. It has been modified from the result.'
    render(
      <form data-testid="test-form">
        <div className="js-copilot-summary-banner-container">
          <input data-csrf="true" defaultValue="secret-token" />
          <CopilotSummaryBanner {...mockProps} />
        </div>
        <textarea data-testid="textarea" />
      </form>,
    )

    await waitFor(() => {
      screen.getByTestId('test-form').dispatchEvent(triggerSummaryEvent)
      expect(successfulRequest).toHaveBeenCalled()
    })

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement
    expect(textarea.value).toBe(summary)

    // Edit the generated summary
    textarea.value = bodyString

    await waitFor(() => {
      screen.getByTestId('test-form').dispatchEvent(new Event('submit'))
      expect(sendEvent).toHaveBeenCalledWith('copilot.pr_summary.change_percentage', {
        match_percentage: 100,
        repo_id: mockProps.headRepoId,
        action: 'summary',
      })
    })
  })

  test('Calculates the percentage variance between the saved text and the outline-only text, send results to hydro', async () => {
    ;(isFeatureEnabled as jest.Mock).mockImplementation(name => name === 'copilot_split_actions_enabled')

    const outline = `Content Deletion:
    * [one/two/three/delete_me.md](diffhunk://#diff-e423d81df66f762b3286b918139a045441c0688f9e1704e1f53bca2ce1daff34L1): The content "todo: delete me" was deleted.`
    const bodyString = `Content Deletion:
    * [one/two/three/delete_me.md](diffhunk://#diff-e423d81df66f762b3286b918139a045441c0688f9e1704e1f53bca2ce1daff34L1): The content "todo: delete me" was deleted. It has been modified from the result.`
    render(
      <form data-testid="test-form">
        <div className="js-copilot-summary-banner-container">
          <input data-csrf="true" defaultValue="secret-token" />
          <CopilotSummaryBanner {...outlineMockProps} />
        </div>
        <textarea data-testid="textarea" />
      </form>,
    )

    await waitFor(() => {
      screen.getByTestId('test-form').dispatchEvent(triggerOutlineEvent)
      expect(successfulOutlineRequest).toHaveBeenCalled()
    })

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement
    expect(textarea.value).toBe(outline)

    // Edit the generated summary
    textarea.value = bodyString

    await waitFor(() => {
      screen.getByTestId('test-form').dispatchEvent(new Event('submit'))
      expect(sendEvent).toHaveBeenCalledWith('copilot.pr_summary.change_percentage', {
        match_percentage: 100,
        repo_id: outlineMockProps.headRepoId,
        action: 'outline',
      })
    })
  })
})
