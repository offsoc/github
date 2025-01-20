import {ItemPickersContextProvider} from '@github-ui/item-picker/ItemPickersContext'
import type {ReactNode} from 'react'

import {InputElementActiveContextProvider} from './InputElementActiveContext'
import {IssueViewerCommentsContextProvider} from './IssueViewerCommentsContext'
import {SubIssueStateProvider} from '@github-ui/sub-issues/SubIssueStateContext'

type IssueViewerContextProviderType = {
  children: ReactNode
}

export function IssueViewerContextProvider({children}: IssueViewerContextProviderType) {
  return (
    <IssueViewerCommentsContextProvider>
      <ItemPickersContextProvider>
        <InputElementActiveContextProvider>
          <SubIssueStateProvider>{children}</SubIssueStateProvider>
        </InputElementActiveContextProvider>
      </ItemPickersContextProvider>
    </IssueViewerCommentsContextProvider>
  )
}
