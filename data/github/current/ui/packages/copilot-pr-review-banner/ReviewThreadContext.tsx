import {
  type PropsWithChildren,
  type Dispatch,
  type SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'
import type {CopilotChatThread} from '@github-ui/copilot-chat/utils/copilot-chat-types'

interface ReviewThreadContextProps {
  reviewThread?: CopilotChatThread
  setReviewThread: Dispatch<SetStateAction<CopilotChatThread | undefined>>
}

const ReviewThreadContext = createContext<ReviewThreadContextProps | undefined>(undefined)

export const ReviewThreadProvider = ({children}: PropsWithChildren) => {
  const [reviewThread, setReviewThread] = useState<CopilotChatThread | undefined>()
  const providerProps = useMemo(
    () => ({reviewThread, setReviewThread}) satisfies ReviewThreadContextProps,
    [reviewThread],
  )
  return <ReviewThreadContext.Provider value={providerProps}>{children}</ReviewThreadContext.Provider>
}

export const useReviewThread = () => {
  const context = useContext(ReviewThreadContext)
  if (!context) throw new Error('useReviewThread must be used with ReviewThreadProvider.')
  return context
}
