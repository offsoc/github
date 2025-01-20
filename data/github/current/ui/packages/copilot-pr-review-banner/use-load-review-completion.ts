import {useCallback, useEffect, useReducer, useRef} from 'react'
import {CopilotChatIntents, TREE_COMPARISON_REFERENCE_TYPE} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import type {CopilotChatMessage} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {useTreeComparison} from './TreeComparisonContext'
import {useCopilotChatService} from './CopilotChatServiceContext'
import {useReviewCompletionData} from './ReviewCompletionDataContext'
import {useReviewThread} from './ReviewThreadContext'
import {useThreadName} from './ThreadNameContext'
import {reviewUserMessage} from '@github-ui/copilot-chat/utils/constants'

interface UseLoadReviewCompletionProps {
  isDismissed?: boolean
  isReviewRequested?: boolean
}

interface ReviewCompletionState {
  isLoading: boolean
  isError: boolean
}

type ReviewCompletionAction = {type: 'LOADING'} | {type: 'LOADED'; isError: boolean} | {type: 'ERROR'}

function reviewCompletionReducer(state: ReviewCompletionState, action: ReviewCompletionAction) {
  switch (action.type) {
    case 'LOADING':
      return {...state, isLoading: true}
    case 'LOADED':
      return {isLoading: false, isError: action.isError}
    case 'ERROR':
      return {isLoading: false, isError: true}
    default:
      throw new Error('invalid action')
  }
}

export function useLoadReviewCompletion({
  isDismissed = false,
  isReviewRequested = false,
}: UseLoadReviewCompletionProps): ReviewCompletionState {
  const {treeComparison} = useTreeComparison()
  const [completionState, dispatch] = useReducer(reviewCompletionReducer, {isLoading: false, isError: false})
  const {completionData, setCompletionData} = useReviewCompletionData()
  const {setReviewThread} = useReviewThread()
  const {isLoading, isError} = completionState
  const isLoadingRef = useRef(isLoading)
  const {chatService} = useCopilotChatService()
  const {threadName} = useThreadName()

  const checkIfThreadExists = useCallback(async (): Promise<boolean> => {
    if (typeof threadName !== 'string' || threadName.length < 1 || chatService === undefined) return false

    const threadsResponse = await promiseWithTimeout(chatService.fetchThreads({name: threadName}), 15000)
    if (threadsResponse === undefined || !threadsResponse.ok) return false

    const threads = threadsResponse.payload
    if (threads.length < 1) return false

    const latestThread = threads[threads.length - 1]
    if (latestThread === undefined) return false

    const messagesResponse = await promiseWithTimeout(chatService.listMessages(latestThread.id), 50000)
    if (messagesResponse === undefined || !messagesResponse.ok) return false

    setReviewThread(latestThread)

    const messages = messagesResponse.payload.messages
    const latestMessage = messages[messages.length - 1]
    const hasDiffHunks = threadContainsDiffHunks(messages)
    setCompletionData({message: latestMessage?.content, hasDiffHunks})
    dispatch({type: 'LOADED', isError: false})

    return true
  }, [chatService, setCompletionData, setReviewThread, threadName])

  const createReviewThread = useCallback(async () => {
    if (chatService === undefined) return

    const threadResponse = await promiseWithTimeout(chatService.createThread(), 15000)
    if (threadResponse !== undefined && threadResponse.ok) {
      const thread = threadResponse.payload
      setReviewThread(thread)

      if (treeComparison === undefined) return

      const messageResponse = await promiseWithTimeout(
        chatService.createMessage(thread.id, reviewUserMessage, CopilotChatIntents.reviewPr, [treeComparison]),
        50000,
      )
      const message: CopilotChatMessage | undefined = messageResponse.ok ? messageResponse.payload : undefined
      const listMessagesResponse = await promiseWithTimeout(chatService.listMessages(thread.id), 50000)
      let hasDiffHunks = false
      if (listMessagesResponse && listMessagesResponse.ok) {
        hasDiffHunks = threadContainsDiffHunks(listMessagesResponse.payload.messages)
      }
      setCompletionData({message: message?.content, hasDiffHunks})
      dispatch({type: 'LOADED', isError: !messageResponse.ok})

      if (threadName && messageResponse.ok) promiseWithTimeout(chatService.renameThread(thread.id, threadName), 50000)
    } else {
      dispatch({type: 'ERROR'})
    }
  }, [treeComparison, chatService, setCompletionData, setReviewThread, threadName])

  useEffect(() => {
    // We've already tried to generate a Copilot pre-review
    if (isError || completionData?.message !== undefined) return

    // The user doesn't want to see the Copilot pre-review banner
    if (isDismissed) return

    // Currently working, don't interrupt
    if (isLoading || isLoadingRef.current) return

    // Don't know how to talk to CAPI
    if (chatService === undefined) return

    // Waiting on the data that will identify the code to be reviewed
    if (treeComparison === undefined) return

    // The user hasn't requested a review
    if (!isReviewRequested) return

    const getCompletion = async () => {
      // Update a ref to avoid issue from multiple useEffect calls in dev mode.
      isLoadingRef.current = true
      dispatch({type: 'LOADING'})

      try {
        const doesThreadExist = await checkIfThreadExists()
        if (!doesThreadExist) await createReviewThread()
      } catch (e) {
        dispatch({type: 'ERROR'})
      } finally {
        isLoadingRef.current = false
      }
    }

    void getCompletion()
  }, [
    chatService,
    checkIfThreadExists,
    completionData,
    createReviewThread,
    isError,
    isLoading,
    treeComparison,
    isDismissed,
    isReviewRequested,
  ])

  return completionState
}

function promiseWithTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutError = new Error('Promise timed out'),
): Promise<T> {
  // create a promise that rejects in milliseconds
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(timeoutError)
    }, ms)
  })

  // returns a race between timeout and the passed promise
  return Promise.race<T>([promise, timeout])
}

/**
 * Checks if the chat thread contains diffHunks in the user message.
 * A diffHunk is a section of a diff that represents one change in the code.
 * @param messages - The array of messages in the thread.
 * @returns A boolean indicating whether the chat thread contains diff hunks.
 */
export function threadContainsDiffHunks(messages: CopilotChatMessage[]): boolean {
  return messages.some(
    message =>
      message.role.toLowerCase() === 'user' &&
      message.references?.some(ref => ref.type === TREE_COMPARISON_REFERENCE_TYPE && ref.diffHunks.length > 0),
  )
}
