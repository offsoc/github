import {useCallback, useEffect, useRef, useState} from 'react'
import {CopilotProgressIndicator} from '@github-ui/copilot-progress-indicator'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {sendEvent} from '@github-ui/hydro-analytics'
import {replaceText} from '@github-ui/text'
import {CopilotFeedbackBanner} from './CopilotFeedbackBanner'
import {CopilotIsLoadingWarningDialog} from './CopilotIsLoadingWarningDialog'
import {CopilotSummaryErrorBanner} from './CopilotSummaryErrorBanner'
import type {ClassificationOptions, CompletionData} from './utils'
import {INIT_EVENT, END_EVENT, TEXT_COMPLETION_SUGGESTION_EVENT} from './constants'
import {insertText, requestSummary as defaultRequestSummary, UIError} from './utils'
import {testIdProps} from '@github-ui/test-id-props'
import {prepStringsForComparison, comparator} from './copilot-summary-result-comparator'
import {announce} from '@github-ui/aria-live'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

const defaultErrorMessage = 'Copilot encountered a temporary error.'

type CopilotAction = 'all' | 'summary' | 'outline'

interface CopilotSummaryBannerProps {
  url: string
  baseRevision: string
  headRevision: string
  headRepoId: string
  userFeedbackOptIn: boolean
  classificationOptions: ClassificationOptions
  requestSummary: (
    event: Event,
    url: string,
    authenticityToken: string,
    baseRevision: string,
    headRevision: string,
    headRepoId: string,
  ) => Promise<CompletionData>
}

function getReplacementText(text: string, action: CopilotAction) {
  // Divide the returned completion into the summary and the outline
  const completion = text.trim()
  const indexOfBreak = completion.indexOf('\n\n')
  let summary = completion
  let outline = completion

  // Check if a newline character was found
  if (indexOfBreak !== -1) {
    summary = completion.slice(0, indexOfBreak)
    outline = completion.slice(indexOfBreak + 2)
  }

  return action === 'summary' ? summary : action === 'outline' ? outline : completion
}

export function CopilotSummaryBanner({
  url,
  baseRevision,
  headRevision,
  headRepoId,
  userFeedbackOptIn,
  classificationOptions,
  requestSummary = defaultRequestSummary,
}: CopilotSummaryBannerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [completionData, setCompletionData] = useState<CompletionData | undefined>(undefined)
  const [warningDialogOpen, setWarningDialogOpen] = useState(false)
  const [forceSubmit, setForceSubmit] = useState(false)
  const [completionReplacementDeferred, setCompletionReplacementDeferred] = useState(false)
  const actionRef = useRef<CopilotAction>('all')
  const placeholderRef = useRef('')
  const replacementRef = useRef('')
  const boxRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const splitActionsEnabled = isFeatureEnabled('copilot_split_actions_enabled')

  const replacePlaceholder = useCallback((replacement: string) => {
    setIsLoading(false)

    const form = boxRef.current?.closest('form')
    const textarea = form?.querySelector('textarea')
    if (!textarea) return

    replaceText(textarea, placeholderRef.current, replacement, document.activeElement === textarea)
    boxRef.current!.dispatchEvent(new CustomEvent(END_EVENT, {bubbles: true}))
  }, [])

  const warningDialogCancelled = useCallback(() => {
    setForceSubmit(false)
    setWarningDialogOpen(false)
    if (returnFocusRef.current !== null) {
      returnFocusRef.current.focus()
      returnFocusRef.current = null
    }

    if (completionReplacementDeferred && replacementRef.current) {
      replacePlaceholder(replacementRef.current)
      setCompletionReplacementDeferred(false)
    }

    // Re-enable submit button if auto-disabled
    const form = boxRef.current?.closest('form')
    const button = form?.querySelector('[data-disable-with][disabled]')
    if (button) {
      button.removeAttribute('disabled')
    }
  }, [completionReplacementDeferred, replacePlaceholder])

  const warningDialogDiscarded = useCallback(() => {
    setForceSubmit(true)
    setWarningDialogOpen(false)
    if (returnFocusRef.current !== null) {
      returnFocusRef.current.focus()
      returnFocusRef.current = null
    }

    replacePlaceholder('')

    const form = boxRef.current?.closest('form')
    if (form) {
      form.submit()
    }
  }, [setForceSubmit, setWarningDialogOpen, replacePlaceholder, boxRef])

  useEffect(() => {
    const form = boxRef.current?.closest('form')
    if (!form) return

    const handleEarlySubmit = (event: SubmitEvent) => {
      if (isLoading && !forceSubmit) {
        event.preventDefault()

        setWarningDialogOpen(true)
        returnFocusRef.current = document.activeElement as HTMLElement
      }
    }

    form.addEventListener('submit', handleEarlySubmit)
    return () => {
      form.removeEventListener('submit', handleEarlySubmit)
    }
  }, [boxRef, isLoading, forceSubmit])

  useEffect(() => {
    const form = boxRef.current?.closest('form')
    if (completionData === undefined || !form) return
    if (completionReplacementDeferred) return // completion was never inserted
    const generateComparison = () => {
      const summary = replacementRef.current
      if (!summary) return

      // need to get the text body that is being saved.
      const body = form.querySelector<HTMLTextAreaElement>('textarea')
      if (!body) return

      // split the body into an array of strings separated by `\n`
      // remove any empty strings
      const bodyLines = prepStringsForComparison(body.value)
      const generatedSummary = prepStringsForComparison(summary)
      const matchPercentage = comparator(bodyLines, generatedSummary)
      sendEvent('copilot.pr_summary.change_percentage', {
        match_percentage: matchPercentage,
        repo_id: headRepoId,
        action: actionRef.current,
      })
    }

    form.addEventListener('submit', generateComparison)
    return () => {
      form.removeEventListener('submit', generateComparison)
    }
  }, [completionData, headRepoId, completionReplacementDeferred])

  useEffect(() => {
    const form = boxRef.current?.closest('form')
    const textarea = form?.querySelector('textarea')
    const container = boxRef.current?.closest('.js-copilot-summary-banner-container')
    const token = container?.querySelector<HTMLInputElement>('[data-csrf=true]')?.value
    if (!form || !container || !token) return

    const handleEvent = async (event: Event) => {
      const {action} = (event as CustomEvent<{action: CopilotAction}>).detail

      // Check the event type to determine the type of request to send, summary or outline
      if (splitActionsEnabled && action === 'outline') {
        announce('Copilot is generating an outline')
        placeholderRef.current = '[Copilot is generating an outline...]'
      } else {
        announce('Copilot is generating a summary')
        placeholderRef.current = '[Copilot is generating a summary...]'
      }

      if (textarea) insertText(textarea, placeholderRef.current)

      setIsLoading(true)
      setErrorMessage(undefined)

      try {
        const returnedCompletionData = await requestSummary(event, url, token, baseRevision, headRevision, headRepoId)
        if (completionData && completionData.sessionId) {
          // Preserve associated text completion session
          returnedCompletionData.feedbackUrl += `?session_id=${completionData.sessionId}`
          returnedCompletionData.sessionId = completionData.sessionId
        }
        setCompletionData(returnedCompletionData)

        actionRef.current = action
        replacementRef.current = getReplacementText(returnedCompletionData.completion || '', action)

        // Ideally we'd rely on warningDialogOpen instead of inspecting the DOM
        // but it will be out of date if opened while waiting on requestSummary above.
        const dialog = document.querySelector('.copilot-is-loading-warning-dialog')
        if (returnedCompletionData && !dialog) {
          announce('Copilot summary complete')
          replacePlaceholder(replacementRef.current)
        } else {
          setCompletionReplacementDeferred(true)
        }
      } catch (error) {
        replacePlaceholder('')
        announce('Copilot summary error')

        // eslint-disable-next-line no-console
        console.error(error)
        if (error instanceof UIError) {
          setErrorMessage(error.message)
        } else {
          setErrorMessage(defaultErrorMessage)
        }
      }
    }

    form.addEventListener(INIT_EVENT, handleEvent)
    return () => {
      form.removeEventListener(INIT_EVENT, handleEvent)
    }
  }, [
    url,
    baseRevision,
    headRevision,
    headRepoId,
    requestSummary,
    replacePlaceholder,
    splitActionsEnabled,
    completionData,
  ])

  useEffect(() => {
    const form = boxRef.current?.closest('form')
    const container = boxRef.current?.closest('.js-copilot-summary-banner-container')
    const token = container?.querySelector<HTMLInputElement>('[data-csrf=true]')?.value
    if (!form || !container || !token) return

    const handleEvent = async () => {
      setErrorMessage(undefined)
      // Point to the feedback URL that factors in the ongoing text completion session,
      // while preserving any assigned completion/jobId from the PR summary.
      const data = ({...completionData} as CompletionData) || ({} as CompletionData)
      const feedbackIncludesTextCompletionSession = (data.feedbackUrl || '').match('feedback/session')
      if (!feedbackIncludesTextCompletionSession) {
        const response = await verifiedFetchJSON(`/copilot/completions/feedback/${headRepoId}`)
        if (response.ok) {
          const json = await response.json()
          data.sessionId = json.session_id
          data.feedbackAuthToken = json.feedback_auth_token
          data.feedbackUrl = json.feedback_url
          if (data.jobId) {
            data.feedbackUrl += `?job_id=${data.jobId}`
          }
          setCompletionData(data)
        } else {
          throw new Error('Failed to fetch feedback data')
        }
      }
    }
    form.addEventListener(TEXT_COMPLETION_SUGGESTION_EVENT, handleEvent)
    return () => {
      form.removeEventListener(TEXT_COMPLETION_SUGGESTION_EVENT, handleEvent)
    }
  }, [completionData, headRepoId])

  const bannerContent = isLoading ? (
    <CopilotProgressIndicator isLoading={isLoading} />
  ) : errorMessage ? (
    <CopilotSummaryErrorBanner
      bannerMessage={errorMessage}
      isServerError={errorMessage === defaultErrorMessage}
      {...testIdProps('copilot-summary-error-banner')}
    />
  ) : userFeedbackOptIn && completionData && !completionReplacementDeferred ? (
    <CopilotFeedbackBanner
      classificationOptions={classificationOptions}
      {...completionData}
      {...testIdProps('copilot-feedback-banner')}
    />
  ) : null

  return (
    <div ref={boxRef} {...testIdProps('copilot-summary-banner')}>
      {bannerContent}
      <CopilotIsLoadingWarningDialog
        isOpen={warningDialogOpen}
        onCancel={warningDialogCancelled}
        onDiscard={warningDialogDiscarded}
        returnFocusRef={returnFocusRef}
      />
    </div>
  )
}
