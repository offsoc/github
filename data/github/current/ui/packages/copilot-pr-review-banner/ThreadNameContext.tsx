import {
  type PropsWithChildren,
  type Dispatch,
  type SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'

interface ThreadNameContextProps {
  threadName?: string | undefined | null
  setThreadName: Dispatch<SetStateAction<string | undefined | null>>
}

const ThreadNameContext = createContext<ThreadNameContextProps | undefined>(undefined)

export interface ThreadNameProviderProps {
  threadName?: ThreadNameContextProps['threadName']
}

export const ThreadNameProvider = ({children, ...props}: PropsWithChildren<ThreadNameProviderProps>) => {
  const [threadName, setThreadName] = useState<ThreadNameContextProps['threadName']>(props.threadName)
  const providerProps = useMemo(() => ({threadName, setThreadName}) satisfies ThreadNameContextProps, [threadName])
  return <ThreadNameContext.Provider value={providerProps}>{children}</ThreadNameContext.Provider>
}

export const useThreadName = () => {
  const context = useContext(ThreadNameContext)
  if (!context) throw new Error('useThreadName must be used with ThreadNameProvider.')
  return context
}
