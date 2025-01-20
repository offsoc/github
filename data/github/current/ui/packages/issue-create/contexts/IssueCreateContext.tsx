import {IssueCreateDataContextProvider, type IssueCreateDataProviderProps} from './IssueCreateDataContext'
import type {IssueFormRef} from '@github-ui/issue-form/Types'
import {useRef, type RefObject} from 'react'
import {IssueCreateConfigContextProvider, type IssueCreateConfigProviderProps} from './IssueCreateConfigContext'

export type IssueCreateProviderProps = IssueCreateDataProviderProps &
  Omit<IssueCreateConfigProviderProps, 'issueFormRef'> & {
    issueFormRef?: RefObject<IssueFormRef>
  }

export function IssueCreateContextProvider({issueFormRef, children, ...props}: IssueCreateProviderProps) {
  if (issueFormRef) {
    return (
      <IssueCreateContextInternalProvider issueFormRef={issueFormRef} {...props}>
        {children}
      </IssueCreateContextInternalProvider>
    )
  }
  return (
    <IssueCreateContextInternalProviderWithoutFormRef {...props}>
      {children}
    </IssueCreateContextInternalProviderWithoutFormRef>
  )
}

function IssueCreateContextInternalProviderWithoutFormRef(props: IssueCreateProviderProps) {
  const issueFormRef = useRef<IssueFormRef>(null)
  return <IssueCreateContextInternalProvider {...props} issueFormRef={issueFormRef} />
}

function IssueCreateContextInternalProvider({
  children,
  ...props
}: IssueCreateProviderProps & {issueFormRef: RefObject<IssueFormRef>}) {
  return (
    <IssueCreateConfigContextProvider {...props}>
      <IssueCreateDataContextProvider {...props}>{children}</IssueCreateDataContextProvider>
    </IssueCreateConfigContextProvider>
  )
}
