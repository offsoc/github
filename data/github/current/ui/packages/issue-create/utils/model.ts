import type {RepositoryPickerRepositoryIssueTemplates$data} from '@github-ui/item-picker/RepositoryPickerRepositoryIssueTemplates.graphql'
import {hasAnyInitialValues, type IssueCreateArguments} from './template-args'
import type {createIssueMutation} from '../mutations/__generated__/createIssueMutation.graphql'

type CreatedIssue = Exclude<
  Exclude<createIssueMutation['response']['createIssue'], null | undefined>['issue'],
  null | undefined
>

export type OnCreateProps = {
  issue: CreatedIssue
  createMore: boolean
}

type Data = RepositoryPickerRepositoryIssueTemplates$data

type Unpacked<T> = T extends Array<infer U> ? U : T

type IssueFormData = Unpacked<NonNullable<Data['issueForms']>>[number]
type IssueTemplateData = Unpacked<NonNullable<Data['issueTemplates']>>[number]
type ContactLinkData = Unpacked<NonNullable<Data['contactLinks']>>[number]
type BlankIssueData = {
  __typename: 'BlankIssue'
  __id: 'BLANK_ISSUE'
  title: ''
  body: ''
  assignees: {
    edges: []
  }
  labels: {
    edges: []
  }
}
export type IssueCreationData = IssueFormData | IssueTemplateData | ContactLinkData | BlankIssueData

export type IssueCreatePayload = {
  name: string
  fileName: string
  kind: IssueCreationKind
  data: IssueCreationData
}

export const BLANK_ISSUE = 'Blank issue'
export const BLANK_ISSUE_ID = 'BLANK_ISSUE'

export function repoHasAvailableTemplates(templates: RepositoryPickerRepositoryIssueTemplates$data | null) {
  if (!templates) return false
  return (
    (templates.issueTemplates?.length ?? 0) !== 0 ||
    (templates.issueForms?.length ?? 0) !== 0 ||
    (templates.contactLinks?.length ?? 0) !== 0
  )
}

export function getPreselectedTemplate({
  templates,
  issueCreateArguments,
}: {
  templates: RepositoryPickerRepositoryIssueTemplates$data | null
  issueCreateArguments?: IssueCreateArguments
}): IssueCreatePayload | undefined {
  const templateFileName = issueCreateArguments?.templateFileName
  const selectedTemplate =
    templates?.issueTemplates?.find(template => template.filename === templateFileName) ||
    templates?.issueForms?.find(form => form.filename === templateFileName)

  const preselectedTemplateData =
    (selectedTemplate && getIssueTemplate(selectedTemplate)) ||
    (templateFileName === BLANK_ISSUE && getBlankIssue()) ||
    (hasAnyInitialValues(issueCreateArguments?.initialValues) && getBlankIssue()) ||
    undefined

  return preselectedTemplateData
}

export function getIssueTemplate(data: IssueCreationData): IssueCreatePayload {
  if (instanceOfIssueFormData(data)) {
    return {
      name: data.name,
      fileName: data.filename,
      kind: IssueCreationKind.IssueForm,
      data,
    }
  } else if (instanceOfIssueTemplateData(data)) {
    return {
      name: data.name,
      fileName: data.filename,
      kind: IssueCreationKind.IssueTemplate,
      data,
    }
  } else if (instanceOfBlankIssueData(data)) {
    return {
      name: BLANK_ISSUE,
      fileName: BLANK_ISSUE, // Arbitrary filename for blank issue
      kind: IssueCreationKind.BlankIssue,
      data,
    }
  } else if (instanceOfContactLinkData(data)) {
    return {
      name: data.name,
      fileName: data.name, // Contact link doesn't have an associated filename
      kind: IssueCreationKind.ContactLink,
      data,
    }
  }
  throw new Error('Unknown data shape')
}

export function instanceOfIssueFormData(data: IssueCreationData): data is IssueFormData {
  return data.__typename === 'IssueForm'
}

export function instanceOfIssueTemplateData(data: IssueCreationData): data is IssueTemplateData {
  return data.__typename === 'IssueTemplate'
}

export function instanceOfContactLinkData(data: IssueCreationData): data is ContactLinkData {
  return data.__typename === 'RepositoryContactLink'
}

export function instanceOfBlankIssueData(data: IssueCreationData): data is BlankIssueData {
  return data.__typename === 'BlankIssue'
}

export enum IssueCreationKind {
  IssueForm,
  IssueTemplate,
  ContactLink,
  BlankIssue,
}

const blankIssue: IssueCreatePayload = {
  name: BLANK_ISSUE,
  fileName: BLANK_ISSUE,
  kind: IssueCreationKind.BlankIssue,
  data: {
    __typename: 'BlankIssue',
    __id: BLANK_ISSUE_ID,
    title: '',
    body: '',
    assignees: {
      edges: [],
    },
    labels: {
      edges: [],
    },
  },
}

export function getBlankIssue(): IssueCreatePayload {
  return blankIssue
}
