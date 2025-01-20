import {Assignees} from '@github-ui/assignees'
import {ReadonlySectionHeader} from '@github-ui/issue-metadata/ReadonlySectionHeader'
import {Section} from '@github-ui/issue-metadata/Section'
import {SectionHeader} from '@github-ui/issue-metadata/SectionHeader'
import {AssigneeFragment, AssigneePicker} from '@github-ui/item-picker/AssigneePicker'
import type {
  AssigneePickerAssignee$data,
  AssigneePickerAssignee$key,
} from '@github-ui/item-picker/AssigneePicker.graphql'
import {ERRORS} from '@github-ui/item-picker/Errors'
import {commitReplaceAssigneesForAssignableMutation} from '@github-ui/item-picker/replaceAssigneesForAssignableMutation'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ActionList} from '@primer/react'
import {useMemo} from 'react'
import {graphql, readInlineData, useFragment, useRelayEnvironment} from 'react-relay'

import type {AssigneesSection_pullrequest$key} from './__generated__/AssigneesSection_pullrequest.graphql'

export default function AssigneesSection({pullRequest}: {pullRequest: AssigneesSection_pullrequest$key}) {
  const assigneesData = useFragment(
    graphql`
      fragment AssigneesSection_pullrequest on PullRequest {
        id
        number
        viewerCanAssign
        baseRepository {
          name
        }
        baseRepositoryOwner {
          login
        }
        assignees(first: 20) {
          nodes {
            # eslint-disable-next-line relay/must-colocate-fragment-spreads
            ...AssigneePickerAssignee
          }
        }
        suggestedAssignees(first: 20) {
          nodes {
            # eslint-disable-next-line relay/must-colocate-fragment-spreads
            ...AssigneePickerAssignee
          }
        }
      }
    `,
    pullRequest,
  )

  type Assignee = AssigneePickerAssignee$data

  const assignees = useMemo(() => {
    return (assigneesData.assignees.nodes || []).flatMap(assignee =>
      // eslint-disable-next-line no-restricted-syntax
      assignee ? [readInlineData<AssigneePickerAssignee$key>(AssigneeFragment, assignee)] : [],
    )
  }, [assigneesData])

  const suggestedAssignees = useMemo(() => {
    return (assigneesData.suggestedAssignees.nodes || []).flatMap(suggestedAssignee =>
      // eslint-disable-next-line no-restricted-syntax
      suggestedAssignee ? [readInlineData<AssigneePickerAssignee$key>(AssigneeFragment, suggestedAssignee)] : [],
    )
  }, [assigneesData])

  const pullRequestId = assigneesData.id
  const environment = useRelayEnvironment()
  const {addToast} = useToastContext()

  const viewerCanAssign = assigneesData.viewerCanAssign

  const assigneeSectionHeader = useMemo(() => {
    return viewerCanAssign ? (
      <AssigneePicker
        anchorElement={props => <SectionHeader buttonProps={props} headingProps={{as: 'h3'}} title="Assignees" />}
        assignees={assignees}
        number={assigneesData.number}
        owner={assigneesData.baseRepositoryOwner?.login || ''}
        readonly={false}
        repo={assigneesData.baseRepository?.name || ''}
        shortcutEnabled={false}
        suggestions={suggestedAssignees}
        onSelectionChange={(selectedAssignees: Assignee[]) => {
          commitReplaceAssigneesForAssignableMutation({
            environment,
            input: {
              assignableId: pullRequestId,
              assignees: selectedAssignees,
              participants: suggestedAssignees,
              typename: 'PullRequest',
            },
            onError: () =>
              // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
              addToast({
                type: 'error',
                message: ERRORS.couldNotUpdateAssignees,
              }),
          })
        }}
      />
    ) : (
      <ReadonlySectionHeader headingProps={{as: 'h3'}} title="Assignees" />
    )
  }, [
    viewerCanAssign,
    assignees,
    assigneesData.baseRepository?.name,
    assigneesData.baseRepositoryOwner?.login,
    assigneesData.number,
    suggestedAssignees,
    environment,
    pullRequestId,
    addToast,
  ])

  return (
    <Section
      emptyText={assignees.length > 0 ? undefined : 'None'}
      id="assignees-section"
      sectionHeader={assigneeSectionHeader}
    >
      <ActionList sx={{py: 0, px: 0, width: '100%'}}>
        <Assignees assignees={assignees} sx={{px: 0, mt: 1}} />
      </ActionList>
    </Section>
  )
}
