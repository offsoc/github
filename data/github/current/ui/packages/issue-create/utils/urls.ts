import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {DisplayMode} from './display-mode'
import type {IssueCreatePayload} from './model'
import {instanceOfContactLinkData, instanceOfIssueTemplateData, instanceOfBlankIssueData} from './model'
import {type ConstructIssueCreateParamsType, constructIssueCreateParams} from './template-args'
import type {RepositoryPickerRepository$data as Repository} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import {URLS, reservedQueryKeys} from '../constants/urls'

const REPO_ISSUES_SUFFIX = '/issues'
const REPO_NEW_ISSUES_SUFFIX = `${REPO_ISSUES_SUFFIX}/new`
const REPO_CHOOSE_ISSUES_SUFFIX = `${REPO_NEW_ISSUES_SUFFIX}/choose`

export const relativeIssueNewPathFromExisting = (path: string): string => {
  // Remove any query string or hash from the path
  const cleanPath = path.split(/[?#]/)[0]!
  // Find the last occurrence of the keyword
  const lastIndexOf = cleanPath.lastIndexOf(REPO_ISSUES_SUFFIX)
  if (lastIndexOf === -1) {
    // If the keyword is not found, return the new path
    return REPO_NEW_ISSUES_SUFFIX
  }

  // Replace the keyword and anything after it with the new path
  return cleanPath.substring(0, lastIndexOf) + REPO_NEW_ISSUES_SUFFIX
}

export const appendNewToBasePath = (path: string): string => safeUrlAppend(path, REPO_NEW_ISSUES_SUFFIX)
export const appendChooseToBasePath = (path: string): string => safeUrlAppend(path, REPO_CHOOSE_ISSUES_SUFFIX)

const safeUrlAppend = (path: string, append: string): string => {
  // If path already ends with /, ensure we don't add another /
  if (path.endsWith('/')) {
    return path.substring(0, path.length - 1) + append
  }

  return path + append
}

export const isChooseRoute = (path: string | undefined): boolean =>
  path !== undefined && path.endsWith(REPO_CHOOSE_ISSUES_SUFFIX)

export const isNewRoute = (path: string | undefined): boolean =>
  path !== undefined && path.endsWith(REPO_NEW_ISSUES_SUFFIX)

export const removeChooseFromBasePath = (path: string): string => {
  // If the path explicitly ends with /choose or /choose/, remove it.
  // Otherwise, return the path as-is.
  return path.replace(/\/choose\/?$/, '')
}

type setTemplateUrlParamIfAppropriateType = {
  insidePortal: boolean
  template: IssueCreatePayload
  repository: Repository | undefined
  preselectedRepository: Repository | undefined
}
export const setTemplateUrlParamIfAppropriate = ({
  insidePortal,
  ...props
}: setTemplateUrlParamIfAppropriateType): void => {
  if (insidePortal) {
    return
  }

  ssrSafeWindow?.history?.pushState({}, '', newIssueWithTemplateParams({...props}))
}

export const newIssueWithTemplateParams = ({...props}: Omit<setTemplateUrlParamIfAppropriateType, 'insidePortal'>) => {
  const newSearchComponent = constructTemplateUrlParamsIfAppropriate({
    displayMode: DisplayMode.TemplatePicker,
    ...props,
  })

  const cleanPathWithoutChoose = removeChooseFromBasePath(ssrSafeWindow?.location?.pathname || '')
  const ensurePathHasNew = relativeIssueNewPathFromExisting(cleanPathWithoutChoose)
  return `${ensurePathHasNew}?${newSearchComponent}${ssrSafeWindow?.location?.hash}`
}

type newTemplateAbsolutePathType = {
  repositoryAbsolutePath: string
  fileName: string
}

export const newTemplateAbsolutePath = ({repositoryAbsolutePath, fileName}: newTemplateAbsolutePathType): string => {
  const newPath = appendNewToBasePath(repositoryAbsolutePath)
  const url = new URL(newPath, ssrSafeWindow?.location?.origin)
  const searchParams = new URLSearchParams(url.search)
  searchParams.set(URLS.queryParams.template, fileName)
  url.search = searchParams.toString()
  return url.toString()
}

type constructTemplateUrlParamsIfAppropriateType = {
  displayMode: DisplayMode
  template: IssueCreatePayload | undefined
  repository: Repository | undefined
  preselectedRepository: Repository | undefined
} & ConstructIssueCreateParamsType

export const constructTemplateUrlParamsIfAppropriate = ({
  displayMode,
  template,
  repository,
  preselectedRepository,
  title,
  body,
  assignees,
  labels,
  projects,
  milestone,
  type,
}: constructTemplateUrlParamsIfAppropriateType): string => {
  // If we had a preselected repo, then we assume there is no need to include the repository in the URL
  const sharedProps = {
    repository,
    includeRepository: preselectedRepository === undefined,
    templateFileName: template?.fileName,
  }

  if (!template || displayMode === DisplayMode.TemplatePicker || instanceOfContactLinkData(template.data)) {
    return constructIssueCreateParams({...sharedProps})
  }

  const titleParam = template.data.title !== title ? title : undefined
  let bodyParam = undefined
  if (instanceOfIssueTemplateData(template.data) || instanceOfBlankIssueData(template.data)) {
    bodyParam = template.data.body !== body ? body : undefined
  }

  // TODO We currently don't do a smart "diff" for labels, assignees or projects, so we always include them in the URL.
  const assigneesParam = assignees && assignees.length > 0 ? assignees : undefined
  const labelsParam = labels && labels.length > 0 ? labels : undefined
  const projectsParam = projects && projects.length > 0 ? projects : undefined
  const milestoneParam = milestone ?? undefined
  const typeParam = type ?? undefined

  return constructIssueCreateParams({
    ...sharedProps,
    title: titleParam,
    body: bodyParam,
    assignees: assigneesParam,
    labels: labelsParam,
    projects: projectsParam,
    milestone: milestoneParam,
    type: typeParam,
  })
}

export const getPotentialFormDefaultValuesFromUrl = (urlParams?: URLSearchParams): Record<string, string> => {
  const searchParams = urlParams ?? new URLSearchParams(ssrSafeWindow?.location?.search || '')
  const defaultValuesById: Record<string, string> = {}

  for (const [key, value] of searchParams) {
    if (reservedQueryKeys.includes(key)) {
      continue
    } else if (value === null) {
      defaultValuesById[key] = ''
    } else {
      defaultValuesById[key] = value.substring(0, URLS.maxQueryLengthLimits.body)
    }
  }

  return defaultValuesById
}

export const safeStringParamGet = (
  searchParams: URLSearchParams,
  key: string,
  maxLimit: number,
): string | undefined => {
  const value = searchParams.get(key)
  if (value === null) {
    return undefined
  }

  return value.substring(0, maxLimit)
}

export const safeStringParamSet = (
  searchParams: URLSearchParams,
  key: string,
  value: string | undefined,
  maxLimit: number,
): void => {
  if (value === undefined) {
    return
  }

  searchParams.set(key, value.substring(0, maxLimit))
}

export const safeStringArrayParamSet = (
  searchParams: URLSearchParams,
  key: string,
  values: string[] | undefined,
  maxLengthLimit: number,
): void => {
  if (!values) {
    return
  }

  searchParams.set(key, values.slice(0, maxLengthLimit).join(','))
}
