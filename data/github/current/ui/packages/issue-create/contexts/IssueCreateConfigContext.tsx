import type {RefObject} from 'react'
import type React from 'react'
import {createContext, useContext, useMemo, useRef, useState} from 'react'

import type {DisplayMode} from '../utils/display-mode'
import {VALUES} from '../constants/values'
import {useSessionStorage} from '@github-ui/use-safe-storage/session-storage'
import type {IssueFormRef} from '@github-ui/issue-form/Types'
import type {SafeOptionConfig} from '../utils/option-config'

type IssueCreateMoreCreatedPath = {
  owner: string
  repo: string
  number: number | undefined
}

export type IssueCreateConfigProviderProps = {
  optionConfig: SafeOptionConfig
  overrideFallbackDisplaymode?: DisplayMode
  issueFormRef: RefObject<IssueFormRef>
  children: React.ReactNode
}

type IssueCreateOnCreateAction = {
  onCreate: (isSubmitting: boolean, createMore: boolean) => void
}

type IssueCreateConfigContextState = {
  createMore: boolean
  setCreateMore: (value: boolean) => void

  createMoreCreatedPath: IssueCreateMoreCreatedPath
  setCreateMoreCreatedPath: (value: IssueCreateMoreCreatedPath) => void

  isSubmitting: boolean
  setIsSubmitting: (value: boolean) => void

  isFileUploading: boolean
  setIsFileUploading: (value: boolean) => void

  displayMode: DisplayMode
  setDisplayMode: (value: DisplayMode) => void

  initialDefaultDisplayMode: DisplayMode

  onCreateAction: RefObject<IssueCreateOnCreateAction>
  issueFormRef: RefObject<IssueFormRef>

  optionConfig: SafeOptionConfig

  /** Indicates whether the issue we are creating is being added as a sub-issue */
  isSubIssue: boolean
}

const IssueCreateContext = createContext<IssueCreateConfigContextState | null>(null)

export function IssueCreateConfigContextProvider({
  optionConfig,
  overrideFallbackDisplaymode,
  issueFormRef,
  children,
}: IssueCreateConfigProviderProps) {
  const {issueCreateMore} = VALUES.localStorageKeys

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFileUploading, setIsFileUploading] = useState(false)
  const [createMore, setCreateMore] = useSessionStorage<boolean>(issueCreateMore(optionConfig.storageKeyPrefix), false)
  const [createMoreCreatedPath, setCreateMoreCreatedPath] = useState<IssueCreateMoreCreatedPath>({
    owner: '',
    repo: '',
    number: undefined,
  })

  const initialDefaultDisplayMode = optionConfig.getDefaultDisplayMode(overrideFallbackDisplaymode)
  const [displayMode, setDisplayMode] = useState(initialDefaultDisplayMode)

  const onCreateAction = useRef<IssueCreateOnCreateAction>(null)

  const contextValue: IssueCreateConfigContextState = useMemo(() => {
    return {
      optionConfig,
      createMore,
      setCreateMore,
      createMoreCreatedPath,
      setCreateMoreCreatedPath,
      displayMode,
      setDisplayMode,
      initialDefaultDisplayMode,
      isSubmitting,
      isFileUploading,
      setIsFileUploading,
      setIsSubmitting,
      onCreateAction,
      issueFormRef,
      isSubIssue: !!optionConfig.issueCreateArguments?.parentIssue?.id,
    }
  }, [
    optionConfig,
    createMore,
    setCreateMore,
    createMoreCreatedPath,
    setCreateMoreCreatedPath,
    displayMode,
    initialDefaultDisplayMode,
    isSubmitting,
    issueFormRef,
    isFileUploading,
  ])

  return <IssueCreateContext.Provider value={contextValue}>{children}</IssueCreateContext.Provider>
}

export const useIssueCreateConfigContext = () => {
  const context = useContext(IssueCreateContext)
  if (!context) {
    throw new Error('useIssueCreateConfigContext must be used within a IssueCreateConfigContextProvider.')
  }

  return context
}
