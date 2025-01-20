import {
  type PropsWithChildren,
  type Dispatch,
  type SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'

interface ReviewCompletionDataContextProps {
  completionData: ReviewCompletionData | undefined
  setCompletionData: Dispatch<SetStateAction<ReviewCompletionData | undefined>>
}
export interface ReviewCompletionData {
  message?: string
  hasDiffHunks: boolean
}

const ReviewCompletionDataContext = createContext<ReviewCompletionDataContextProps | undefined>(undefined)

export const ReviewCompletionDataProvider = ({children}: PropsWithChildren) => {
  const [completionData, setCompletionData] = useState<ReviewCompletionData | undefined>({hasDiffHunks: false})
  const providerProps = useMemo(() => ({completionData, setCompletionData}), [completionData])
  return <ReviewCompletionDataContext.Provider value={providerProps}>{children}</ReviewCompletionDataContext.Provider>
}

export const useReviewCompletionData = () => {
  const context = useContext(ReviewCompletionDataContext)
  if (!context) {
    throw new Error('useReviewCompletionData must be used with ReviewCompletionDataProvider.')
  }
  return context
}
