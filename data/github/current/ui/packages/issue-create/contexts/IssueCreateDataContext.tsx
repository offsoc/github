import type React from 'react'
import {createContext, useContext, useMemo, useState} from 'react'

import {useSessionStorage} from '@github-ui/use-safe-storage/session-storage'
import type {RepositoryPickerRepository$data as Repository} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import type {RepositoryPickerRepositoryIssueTemplates$data as Templates} from '@github-ui/item-picker/RepositoryPickerRepositoryIssueTemplates.graphql'
import type {AssigneePickerAssignee$data as Assignee} from '@github-ui/item-picker/AssigneePicker.graphql'
import type {LabelPickerLabel$data as Label} from '@github-ui/item-picker/LabelPickerLabel.graphql'
import type {MilestonePickerMilestone$data as Milestone} from '@github-ui/item-picker/MilestonePickerMilestone.graphql'
import type {Project} from '@github-ui/item-picker/ProjectPicker'
import {VALUES} from '../constants/values'
import type {IssueType} from '@github-ui/item-picker/IssueTypePicker'
import type {IssueCreatePayload} from '../utils/model'
import type {SafeOptionConfig} from '../utils/option-config'
import {ssrSafeLocation} from '@github-ui/ssr-utils'

// This is a placeholder structural type until we have a Relay key type to reference,
// if we start rendering something sub-issues related in the UI (which we currently don't)
type Issue = {readonly id: string}

type PreselectedDataTypes = {
  repository?: Repository
  template?: IssueCreatePayload
  templates?: Templates

  parentIssue?: Issue
}

export type IssueCreateDataProviderProps = {
  optionConfig: SafeOptionConfig
  preselectedData: PreselectedDataTypes | undefined
  children: React.ReactNode
}

type IssueCreateDataContextState = {
  repository: Repository | undefined
  setRepository: (value: Repository | undefined) => void

  repositoryAbsolutePath: string

  template: IssueCreatePayload | undefined
  setTemplate: (value: IssueCreatePayload | undefined) => void

  preselectedRepository?: Repository | undefined
  preselectedTemplate?: IssueCreatePayload | undefined
  preselectedTemplates?: Templates

  templates: Templates | undefined
  setTemplates: (value: Templates | undefined) => void

  labels: Label[]
  setLabels: (value: Label[]) => void

  assignees: Assignee[]
  setAssignees: (value: Assignee[]) => void

  projects: Project[]
  setProjects: (value: Project[]) => void

  milestone: Milestone | null
  setMilestone: (value: Milestone | null) => void

  issueType: IssueType | null
  setIssueType: (value: IssueType | null) => void

  parentIssue: Issue | null
}

const IssueCreateDataContext = createContext<IssueCreateDataContextState | null>(null)

export function IssueCreateDataContextProvider({
  optionConfig,
  preselectedData,
  children,
}: IssueCreateDataProviderProps) {
  const {storageKeyPrefix} = optionConfig
  const {issueLabels, issueAssignees, issueProjects, issueMilestone, issueIssueType} = VALUES.localStorageKeys

  const [repository, setRepository] = useState<Repository | undefined>(preselectedData?.repository)
  const [template, setTemplate] = useState<IssueCreatePayload | undefined>(preselectedData?.template)
  const [templates, setTemplates] = useState<Templates | undefined>(preselectedData?.templates)

  const [labels, setLabels] = useSessionStorage<Label[]>(issueLabels(storageKeyPrefix), [])
  const [assignees, setAssignees] = useSessionStorage<Assignee[]>(issueAssignees(storageKeyPrefix), [])
  const [projects, setProjects] = useSessionStorage<Project[]>(issueProjects(storageKeyPrefix), [])
  const [milestone, setMilestone] = useSessionStorage<Milestone | null>(issueMilestone(storageKeyPrefix), null)
  const [issueType, setIssueType] = useSessionStorage<IssueType | null>(issueIssueType(storageKeyPrefix), null)

  const origin = ssrSafeLocation?.origin ?? ''
  const repoNwo = repository?.nameWithOwner ?? ''
  const repositoryAbsolutePath = useMemo(() => `${origin}/${repoNwo}`, [origin, repoNwo])

  const parentIssue = preselectedData?.parentIssue ?? null

  const contextValue: IssueCreateDataContextState = useMemo(() => {
    return {
      repository,
      setRepository,
      repositoryAbsolutePath,
      template,
      setTemplate,
      preselectedRepository: preselectedData?.repository,
      preselectedTemplate: preselectedData?.template,
      preselectedTemplates: preselectedData?.templates,
      templates,
      setTemplates,
      labels,
      setLabels,
      assignees,
      setAssignees,
      projects,
      setProjects,
      milestone,
      setMilestone,
      issueType,
      setIssueType,
      parentIssue,
    }
  }, [
    repository,
    repositoryAbsolutePath,
    template,
    preselectedData?.repository,
    preselectedData?.template,
    preselectedData?.templates,
    templates,
    labels,
    setLabels,
    assignees,
    setAssignees,
    projects,
    setProjects,
    milestone,
    setMilestone,
    issueType,
    setIssueType,
    parentIssue,
  ])

  return <IssueCreateDataContext.Provider value={contextValue}>{children}</IssueCreateDataContext.Provider>
}

export const useIssueCreateDataContext = () => {
  const context = useContext(IssueCreateDataContext)
  if (!context) {
    throw new Error('useIssueCreateDataContext must be used within a IssueCreateDataContextProvider.')
  }

  return context
}
