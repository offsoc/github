import {ProjectSymlinkIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, Button} from '@primer/react'
import {useCallback, useEffect, useState} from 'react'

import type {IssueNodeType} from '../ListItems'
import type {SharedListHeaderActionProps} from './ListItemsHeader'
import {BulkProjectPicker, ProjectPickerProjectFragment, type Project} from '@github-ui/item-picker/ProjectPicker'
import {graphql, readInlineData, useRelayEnvironment} from 'react-relay'
import type {
  AddToProjectsActionQuery,
  AddToProjectsActionQuery$data,
} from './__generated__/AddToProjectsActionQuery.graphql'
import type {ProjectPickerProject$key} from '@github-ui/item-picker/ProjectPickerProject.graphql'
import {IS_SERVER} from '@github-ui/ssr-utils'
import {clientSideRelayFetchQueryRetained} from '@github-ui/relay-environment'

type AddToProjectsActionProps = {
  issueNodes: IssueNodeType[]
  owner: string
  repo: string
} & SharedListHeaderActionProps

const AddToProjectsQuery = graphql`
  query AddToProjectsActionQuery($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Issue {
        id
        projectItemsNext(first: 10) {
          edges {
            node {
              id
              project {
                ...ProjectPickerProject
              }
            }
          }
        }
      }
    }
  }
`
export const AddToProjectsAction = ({disabled = false, nested, ...props}: AddToProjectsActionProps) => {
  const [wasTriggered, setWasTriggered] = useState(false)

  const anchorElement = useCallback(
    (anchorProps: React.HTMLAttributes<HTMLElement>) => {
      const anchorText = 'Project'

      if (nested) {
        return (
          <ActionList.Item disabled={disabled} {...anchorProps} role="menuitem">
            <ActionList.LeadingVisual>
              <ProjectSymlinkIcon />
            </ActionList.LeadingVisual>
            {anchorText}
          </ActionList.Item>
        )
      }

      return (
        <Button
          data-testid={'bulk-add-to-project-button'}
          disabled={disabled}
          leadingVisual={ProjectSymlinkIcon}
          trailingVisual={TriangleDownIcon}
          {...anchorProps}
        >
          {anchorText}
        </Button>
      )
    },
    [disabled, nested],
  )

  if (!wasTriggered) {
    return anchorElement({
      onClick: () => {
        setWasTriggered(true)
      },
    })
  }

  return <LazyBulkProjectPicker disabled={disabled} anchorElement={anchorElement} {...props} />
}

const LazyBulkProjectPicker = ({
  issuesToActOn,
  repositoryId,
  anchorElement,
  useQueryForAction,
  query,
  onCompleted,
  onError,
  nested,
  singleKeyShortcutsEnabled,
  owner,
  repo,
}: AddToProjectsActionProps & {anchorElement: (props: React.HTMLAttributes<HTMLElement>) => JSX.Element}) => {
  //get selected issues IDs
  const environment = useRelayEnvironment()
  const [issueNodes, setIssueNodes] = useState<AddToProjectsActionQuery$data['nodes']>([])

  useEffect(() => {
    if (IS_SERVER) return

    clientSideRelayFetchQueryRetained<AddToProjectsActionQuery>({
      environment,
      query: AddToProjectsQuery,
      variables: {ids: issuesToActOn},
    }).subscribe({
      next: data => {
        setIssueNodes(data.nodes)
        // setIsLoading(false)
      },
    })
  }, [environment, issuesToActOn])

  const existingIssueProjects = new Map<string, string[]>()
  const selectedIssuesProjects = (issueNodes || []).map(node => {
    const nodeId = node?.id
    if (!nodeId) return []

    const projects = (node.projectItemsNext?.edges || []).flatMap(a =>
      // eslint-disable-next-line no-restricted-syntax
      a?.node ? [readInlineData<ProjectPickerProject$key>(ProjectPickerProjectFragment, a.node.project)] : [],
    )

    return (
      projects.map(project => {
        const existingProjects = existingIssueProjects.get(nodeId) || []
        existingProjects.push(project.id)
        existingIssueProjects.set(nodeId, existingProjects)

        return {issueId: nodeId, projectId: project.id, projectNode: project}
      }) ?? []
    )
  })

  const projectAppliedToAll = {} as {[key: string]: Project}
  for (const issueProjects of selectedIssuesProjects) {
    for (const project of issueProjects) {
      if (project.projectId in projectAppliedToAll) continue

      if (
        selectedIssuesProjects.every(otherIssueProjects =>
          otherIssueProjects.some(p => p.projectId === project.projectId),
        )
      ) {
        projectAppliedToAll[project.projectId] = project.projectNode
      }
    }
  }

  return (
    <BulkProjectPicker
      pickerId={'add-to-projects-project-picker'}
      issueIds={issuesToActOn}
      repositoryId={repositoryId}
      readonly={false}
      shortcutEnabled={singleKeyShortcutsEnabled}
      triggerOpen={true}
      query={query}
      useQueryForAction={useQueryForAction}
      selectedProjects={Object.values(projectAppliedToAll)}
      onCompleted={onCompleted}
      onError={onError}
      nested={nested}
      anchorElement={anchorElement}
      owner={owner}
      repo={repo}
    />
  )
}
