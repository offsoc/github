import {URLS} from '../constants/urls'
import {BLANK_ISSUE} from './model'
import {safeStringArrayParamSet, safeStringParamGet, safeStringParamSet} from './urls'
import type {AssigneePickerAssignee$data} from '@github-ui/item-picker/AssigneePicker.graphql'
import type {MilestonePickerMilestone$data} from '@github-ui/item-picker/MilestonePickerMilestone.graphql'
import type {Project} from '@github-ui/item-picker/ProjectPicker'
import type {LabelPickerLabel$data} from '@github-ui/item-picker/LabelPickerLabel.graphql'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import type {IssueTypePickerIssueType$data} from '@github-ui/item-picker/IssueTypePickerIssueType.graphql'

export type IssueCreateUrlParams = {
  generateUrlParams: () => string
}

export type IssueCreateArguments = {
  repository?: {
    owner: string
    name: string
  }
  templateFileName?: string
  initialValues?: IssueCreateValueTypes
  parentIssue?: {
    id: string
  }
}

export type IssueCreateValueTypes = {
  title?: string
  body?: string
} & IssueCreateMetadataTypes

export type IssueCreateMetadataTypes = {
  assignees?: AssigneePickerAssignee$data[]
  labels?: LabelPickerLabel$data[]
  milestone?: MilestonePickerMilestone$data
  projects?: Project[]
  type?: IssueTypePickerIssueType$data
}

export type ConstructIssueCreateParamsType = {
  repository: {owner: {login: string}; name: string} | undefined
  templateFileName?: string | undefined
} & IssueCreateValueTypes

export function hasAnyInitialValues(initialValues?: IssueCreateValueTypes) {
  if (!initialValues) {
    return false
  }

  return (
    initialValues.title !== undefined ||
    initialValues.body !== undefined ||
    initialValues.assignees !== undefined ||
    initialValues.labels !== undefined ||
    initialValues.milestone !== undefined ||
    initialValues.projects !== undefined ||
    initialValues.type !== undefined
  )
}

export function constructIssueCreateParams({
  includeRepository,
  repository,
  templateFileName,
  title,
  body,
  assignees,
  labels,
  projects,
  milestone,
  type,
}: ConstructIssueCreateParamsType & {includeRepository: boolean}): string {
  const searchParams = new URLSearchParams(ssrSafeWindow?.location?.search || '')

  if (includeRepository && repository) {
    searchParams.set(URLS.queryParams.org, repository.owner.login)
    searchParams.set(URLS.queryParams.repo, repository.name)
  }

  if (templateFileName) {
    searchParams.set(URLS.queryParams.template, templateFileName)
  }

  safeStringParamSet(searchParams, URLS.queryParams.title, title, URLS.maxQueryLengthLimits.title)
  safeStringParamSet(searchParams, URLS.queryParams.body, body, URLS.maxQueryLengthLimits.body)

  if (assignees) {
    safeStringArrayParamSet(
      searchParams,
      URLS.queryParams.assignees,
      assignees ? assignees.map(a => a.login) : undefined,
      URLS.maxQueryLengthLimits.assignees,
    )
  }

  if (labels) {
    safeStringArrayParamSet(
      searchParams,
      URLS.queryParams.labels,
      labels.map(l => l.name),
      URLS.maxQueryLengthLimits.assignees,
    )
  }

  if (projects && repository?.owner) {
    safeStringArrayParamSet(
      searchParams,
      URLS.queryParams.projects,
      projects.map(p => `${repository.owner.login}/${p.number}`),
      URLS.maxQueryLengthLimits.assignees,
    )
  }

  if (milestone) {
    searchParams.set(URLS.queryParams.milestone, milestone.title)
  }

  if (type) {
    searchParams.set(URLS.queryParams.type, type.name)
  }

  return searchParams.toString()
}

export function getIssueCreateArguments(searchParams: URLSearchParams, initialMetadata?: IssueCreateMetadataTypes) {
  const org = searchParams.get(URLS.queryParams.org)
  const repo = searchParams.get(URLS.queryParams.repo)
  const template = searchParams.get(URLS.queryParams.template)

  let issueCreateArguments: IssueCreateArguments = {
    ...(org !== null &&
      repo !== null && {
        repository: {
          owner: org,
          name: repo,
        },
      }),
    ...(template !== null && {templateFileName: template}),
  }

  const title = safeStringParamGet(searchParams, URLS.queryParams.title, URLS.maxQueryLengthLimits.title)
  const body = safeStringParamGet(searchParams, URLS.queryParams.body, URLS.maxQueryLengthLimits.body)

  const templateArguments: IssueCreateValueTypes = {
    ...(title !== undefined && {title}),
    ...(body !== undefined && {body}),
    ...initialMetadata,
  }

  if (Object.keys(issueCreateArguments).length === 0) {
    // Special case, in the old experience, which relies on repo scope, blank issues don't set a template variable, so we need to check this.
    // In this experience, it means we won't have an org, or repo, since we're repo scoped, but we need to see if there are other valid params.
    if (Object.keys(templateArguments).length > 0) {
      issueCreateArguments = {
        templateFileName: BLANK_ISSUE,
      }
    } else {
      return undefined
    }
  }

  return {
    ...issueCreateArguments,
    ...(Object.keys(templateArguments).length > 0 && {initialValues: templateArguments}),
  }
}
