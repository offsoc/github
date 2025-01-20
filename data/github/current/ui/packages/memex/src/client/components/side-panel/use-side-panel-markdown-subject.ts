import type {Subject} from '@github-ui/comment-box/subject'

import {getInitialState} from '../../helpers/initial-state'
import {useIssueContext} from '../../state-providers/issues/use-issue-context'

export function useSidePanelMarkdownSubject(): Subject | undefined {
  const metadata = useIssueContext().sidePanelMetadata
  const {projectData} = getInitialState()

  return metadata.itemKey.kind === 'issue' && metadata.repository
    ? {
        type: 'issue',
        repository: {
          databaseId: metadata.itemKey.repositoryId,
          nwo: metadata.repository.nameWithOwner,
          slashCommandsEnabled: metadata.slashCommandsSubjectGid !== undefined,
        },
        id: {
          databaseId: metadata.itemKey.itemId,
          id: metadata.slashCommandsSubjectGid ?? '',
        },
      }
    : projectData
      ? {type: 'project', id: {databaseId: projectData.id}}
      : undefined
}
