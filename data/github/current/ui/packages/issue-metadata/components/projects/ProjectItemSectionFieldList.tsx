/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
import {Box, Text, Link} from '@primer/react'
import {graphql, useLazyLoadQuery, useRelayEnvironment} from 'react-relay'

import {LABELS} from '../../constants/labels'
import {ProjectItemSectionFieldsLoading} from './ProjectItemSectionFieldsLoading'
import {ProjectItemSectionFields} from './ProjectItemSectionFields'
import {Suspense, useCallback} from 'react'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {commitUnArchiveProjectItem} from '../../mutations/unarchive-project-item'
import type {ProjectItemSectionFieldListQuery} from './__generated__/ProjectItemSectionFieldListQuery.graphql'

export type ProjectItemSectionFieldListProps = {
  projectId: string
  projectItemId: string
  isArchived: boolean
  onIssueUpdate?: () => void
}

export function ProjectItemSectionFieldList(props: ProjectItemSectionFieldListProps) {
  return (
    <Box
      as="ul"
      sx={{
        listStyle: 'none',
        gap: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Suspense fallback={<ProjectItemSectionFieldsLoading />}>
        <ProjectItemSectionFieldListInternal {...props} />
      </Suspense>
    </Box>
  )
}

function ProjectItemSectionFieldListInternal({
  isArchived,
  projectItemId,
  projectId,
  onIssueUpdate,
}: ProjectItemSectionFieldListProps) {
  const environment = useRelayEnvironment()
  const {addToast} = useToastContext()
  const {node} = useLazyLoadQuery<ProjectItemSectionFieldListQuery>(
    graphql`
      query ProjectItemSectionFieldListQuery($id: ID!) {
        node(id: $id) {
          ... on ProjectV2Item {
            project {
              viewerCanUpdate
              url
              id
            }
            ...ProjectItemSectionFields
          }
        }
      }
    `,
    {id: projectItemId},
  )

  const restore = useCallback(() => {
    commitUnArchiveProjectItem({
      environment,
      input: {projectId, itemId: projectItemId},
      onCompleted: () => {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({type: 'success', message: LABELS.archivedSuccess})
      },
      onError: () => {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({type: 'error', message: LABELS.archivedError})
      },
    })
  }, [environment, projectId, projectItemId, addToast])

  if (!node || !node.project) return null
  const canRestore = isArchived && node.project.viewerCanUpdate
  return (
    <>
      {canRestore && (
        <Box as="li" sx={{pl: 'var(--control-xsmall-paddingInline-spacious)'}}>
          <Text sx={{fontSize: 0, color: 'fg.muted', display: 'block'}}>
            {LABELS.archivedDescription}
            &nbsp;
            <Link onClick={restore} sx={{cursor: 'pointer'}}>
              Restore
            </Link>
          </Text>
        </Box>
      )}
      <ProjectItemSectionFields onIssueUpdate={onIssueUpdate} projectItem={node} />
    </>
  )
}
