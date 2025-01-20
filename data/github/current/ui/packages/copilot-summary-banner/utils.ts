export class UIError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export function fetchPoll(
  url: RequestInfo,
  options?: RequestInit,
  timeBetweenRequests = 1000,
  acceptedStatusCodes = [200],
): Promise<Response> {
  return (async function poll(wait: number): Promise<Response> {
    const request = new Request(url, options)
    request.headers.append('X-Requested-With', 'XMLHttpRequest')
    const response = await self.fetch(request)
    const unexpectedError = new Error(`Unexpected ${response.status} response status from poll endpoint`)

    if (response.status === 202) {
      await new Promise(resolve => setTimeout(resolve, wait))
      return poll(wait * 1.2)
    }
    if (response.status === 500) {
      const payload = await response.json()

      if (payload.job.error_message) {
        throw new UIError(payload.job.error_message)
      } else {
        throw unexpectedError
      }
    }
    if (acceptedStatusCodes.includes(response.status)) {
      return response
    }
    throw unexpectedError
  })(timeBetweenRequests)
}

export interface CompletionData {
  completion: string | null
  jobId: string | null
  sessionId: string | null
  feedbackUrl: string
  feedbackAuthToken: string
}

export interface ClassificationOptions {
  [key: string]: string
}

export async function requestSummary(
  event: Event,
  url: string,
  authenticityToken: string,
  base_revision: string,
  head_revision: string,
  head_repo_id: string,
): Promise<CompletionData> {
  const response = await fetch(url, {
    method: 'POST',
    body: new URLSearchParams({authenticity_token: authenticityToken, base_revision, head_revision, head_repo_id}),
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })

  const data = await response.json()
  const jobUrl = data.job.url
  const feedbackUrl = data.job.feedback_url
  const feedbackAuthToken = data.job.feedback_auth_token
  const jobResponse = await fetchPoll(jobUrl, {}, 2000) // 2, 2.4, 2.8, 3.5, 4.1, 4.9
  const jobData = await jobResponse.json()
  const jobId = jobData.job.id
  const {completion} = jobData.job.context

  return {completion, jobId, feedbackUrl, feedbackAuthToken, sessionId: null}
}

export interface Feedback {
  sentiment?: string
  body?: string
  contact?: boolean
  classification?: string
}

export async function sendFeedback(feedbackUrl: string, authenticityToken: string, feedback: Feedback) {
  const body = new URLSearchParams({
    _method: 'put',
    authenticity_token: authenticityToken,
  })
  feedback.sentiment && body.set('feedback[sentiment]', feedback.sentiment)
  feedback.body && body.set('feedback[body]', feedback.body)
  feedback.contact && body.set('feedback[contact]', feedback.contact ? '1' : '0')
  feedback.classification && body.set('feedback[classification]', feedback.classification)

  await fetch(feedbackUrl, {
    method: 'POST',
    body,
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })
}

// This was pulled from SlashCommandToolbarButtonElement and is duplicated in a few other spots
// Good candidate for being pulled out into a ui-systems component.
export function insertText(textarea: HTMLTextAreaElement, text: string) {
  textarea.focus()

  // similar to the `insertText` utility behavior, but with different cursor positioning
  const point = textarea.selectionEnd || 0
  const value = textarea.value
  const beginning = value.substring(0, point)
  const remaining = value.substring(point)

  let adjText = text
  let cursorPosition = point + text.length + 1 // place cursor after the inserted text

  if (beginning) {
    if (value[point - 1] === '\n') {
      cursorPosition -= 1 // we're on a newline so we don't need an extra position
    } else {
      adjText = `\n${adjText}`
    }
  }

  let execCommandSucceeded = false
  try {
    execCommandSucceeded = document.execCommand('insertText', false, adjText)
  } catch (e) {
    execCommandSucceeded = false
  }

  if (!execCommandSucceeded) {
    textarea.value = beginning + adjText + remaining
  }

  textarea.selectionStart = cursorPosition
  textarea.selectionEnd = cursorPosition

  textarea.dispatchEvent(
    new CustomEvent('input', {
      bubbles: true,
      cancelable: true,
    }),
  )
}
