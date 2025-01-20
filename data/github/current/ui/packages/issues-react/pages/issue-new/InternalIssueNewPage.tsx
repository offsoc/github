import type {IssueCreateMetadataTypes} from '@github-ui/issue-create/TemplateArgs'
import {AssigneeFragment} from '@github-ui/item-picker/AssigneePicker'
import type {AssigneePickerAssignee$key} from '@github-ui/item-picker/AssigneePicker.graphql'
import {LabelFragment} from '@github-ui/item-picker/LabelPicker'
import type {LabelPickerLabel$key} from '@github-ui/item-picker/LabelPickerLabel.graphql'

import type {MilestonePickerMilestone$key} from '@github-ui/item-picker/MilestonePickerMilestone.graphql'
import {MilestoneFragment} from '@github-ui/item-picker/MilestonePicker'
import {graphql, type PreloadedQuery, readInlineData, usePreloadedQuery} from 'react-relay'

import type {InternalIssueNewPageUrlArgumentsMetadataQuery} from './__generated__/InternalIssueNewPageUrlArgumentsMetadataQuery.graphql'
import {IssueCreatePane, type IssueCreatePaneProps} from './IssueCreatePane'
import {ProjectPickerProjectFragment} from '@github-ui/item-picker/ProjectPicker'
import type {ProjectPickerProject$key} from '@github-ui/item-picker/ProjectPickerProject.graphql'
import {IssueTypeFragment} from '@github-ui/item-picker/IssueTypePicker'
import type {IssueTypePickerIssueType$key} from '@github-ui/item-picker/IssueTypePickerIssueType.graphql'

export const InternalIssueNewPageUrlArgumentsMetadata = graphql`
  query InternalIssueNewPageUrlArgumentsMetadataQuery(
    $owner: String!
    $name: String!
    $withAnyMetadata: Boolean = false
    $withAssignees: Boolean = false
    $assigneeLogins: String = ""
    $withLabels: Boolean = false
    $labelNames: String = ""
    $withMilestone: Boolean = false
    $milestoneTitle: String = ""
    $type: String = ""
    $withType: Boolean = false
    $withProjects: Boolean = false
    $projectNumbers: [Int!] = []
    $withTriagePermission: Boolean = false
  ) {
    repository(owner: $owner, name: $name) @include(if: $withAnyMetadata) {
      viewerIssueCreationPermissions {
        assignable @include(if: $withAssignees)
        labelable @include(if: $withLabels)
        milestoneable @include(if: $withMilestone)
        triageable @include(if: $withTriagePermission)
        typeable @include(if: $withType)
      }
      assignableUsers(first: 10, loginNames: $assigneeLogins) @include(if: $withAssignees) {
        nodes {
          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...AssigneePickerAssignee
        }
      }
      labels(first: 20, names: $labelNames) @include(if: $withLabels) {
        nodes {
          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...LabelPickerLabel
        }
      }
      milestoneByTitle(title: $milestoneTitle) @include(if: $withMilestone) {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...MilestonePickerMilestone
      }
      issueType(name: $type) @include(if: $withType) {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...IssueTypePickerIssueType
      }
      # eslint-disable-next-line relay/unused-fields
      owner {
        ... on ProjectV2Owner {
          # eslint-disable-next-line relay/unused-fields
          projectsV2ByNumber(first: 20, numbers: $projectNumbers) @include(if: $withProjects) {
            nodes {
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...ProjectPickerProject
            }
          }
        }
      }
    }
  }
`

type InternalIssueNewPageProps = Partial<IssueCreatePaneProps> &
  Pick<IssueCreatePaneProps, 'initialMetadataValues'> & {
    urlParameterQueryData?: PreloadedQuery<
      InternalIssueNewPageUrlArgumentsMetadataQuery,
      Record<string, unknown>
    > | null
  }

export const InternalIssueNewPageWithUrlParams = ({urlParameterQueryData, ...props}: InternalIssueNewPageProps) => {
  const repositoryData = usePreloadedQuery<InternalIssueNewPageUrlArgumentsMetadataQuery>(
    InternalIssueNewPageUrlArgumentsMetadata,
    urlParameterQueryData!,
  )?.repository

  const assigneeNodes = repositoryData?.assignableUsers?.nodes
  const assignees =
    assigneeNodes && repositoryData.viewerIssueCreationPermissions?.assignable
      ? // eslint-disable-next-line no-restricted-syntax
        assigneeNodes.flatMap(e => (e ? [readInlineData<AssigneePickerAssignee$key>(AssigneeFragment, e)] : []))
      : undefined

  const labelNodes = repositoryData?.labels?.nodes
  const labels =
    labelNodes && repositoryData.viewerIssueCreationPermissions?.labelable
      ? // eslint-disable-next-line no-restricted-syntax
        labelNodes.flatMap(e => (e ? [readInlineData<LabelPickerLabel$key>(LabelFragment, e)] : []))
      : undefined

  const projectNodes = repositoryData?.owner?.projectsV2ByNumber?.nodes
  const projects =
    projectNodes && repositoryData.viewerIssueCreationPermissions?.triageable
      ? projectNodes.flatMap(e =>
          // eslint-disable-next-line no-restricted-syntax
          e ? [readInlineData<ProjectPickerProject$key>(ProjectPickerProjectFragment, e)] : [],
        )
      : undefined

  const milestone =
    repositoryData?.milestoneByTitle && repositoryData.viewerIssueCreationPermissions?.milestoneable
      ? // eslint-disable-next-line no-restricted-syntax
        readInlineData<MilestonePickerMilestone$key>(MilestoneFragment, repositoryData?.milestoneByTitle)
      : undefined

  const issueType =
    repositoryData?.issueType &&
    repositoryData.viewerIssueCreationPermissions?.triageable &&
    repositoryData.viewerIssueCreationPermissions?.typeable
      ? // eslint-disable-next-line no-restricted-syntax
        readInlineData<IssueTypePickerIssueType$key>(IssueTypeFragment, repositoryData?.issueType)
      : undefined

  const initialMetadataValues: IssueCreateMetadataTypes = {
    ...(assignees !== undefined && {assignees}),
    ...(labels !== undefined && {labels}),
    ...(milestone !== undefined && {milestone}),
    ...(projects !== undefined && {projects}),
    ...(issueType !== undefined && {type: issueType}),
  }

  return <InternalIssueNewPage initialMetadataValues={initialMetadataValues} {...props} />
}

export const InternalIssueNewPage = ({...props}: InternalIssueNewPageProps) => {
  return <IssueCreatePane {...props} />
}
