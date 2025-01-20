import {Box, Spinner} from '@primer/react'
import {useMemo} from 'react'

import {ItemType} from '../../api/memex-items/item-type'
import type {SidePanelItem} from '../../api/memex-items/side-panel-item'
import type {ReactionEmotion} from '../../api/side-panel/contracts'
import {DraftEdit} from '../../api/stats/contracts'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {useIssueContext} from '../../state-providers/issues/use-issue-context'
import {useProjectNumber} from '../../state-providers/memex/use-project-number'
import {SidePanelComment} from './comment'
import {SidePanelLiveUpdate} from './live-update'
import {TasklistForm} from './tasklist-form'

export const SidePanelBody: React.FC<{item: SidePanelItem; isLoading: boolean; fullHeight?: boolean}> = ({
  item,
  isLoading,
  fullHeight,
}) => {
  const {sidePanelMetadata, editIssue, reactToSidePanelItem, reloadSidePanelMetadata} = useIssueContext()
  const {projectNumber} = useProjectNumber()
  const {tasklist_block, sub_issues} = useEnabledFeatures()

  const {postStats} = usePostStats()

  const capabilities = useMemo(() => new Set(sidePanelMetadata.capabilities), [sidePanelMetadata])

  const onReact = capabilities.has('react')
    ? (reaction: ReactionEmotion, reacted: boolean, actor: string) => reactToSidePanelItem(reaction, reacted, actor)
    : undefined

  const onEdit = useMemo(
    () =>
      capabilities.has('editDescription')
        ? async (body: string, tasklist_blocks_operation_tracker?: string) => {
            await editIssue({body}, null, tasklist_blocks_operation_tracker)
            if (item.contentType === ItemType.DraftIssue)
              postStats({
                name: DraftEdit,
                memexProjectItemId: item.id,
              })
          }
        : undefined,
    [capabilities, editIssue, item.contentType, postStats, item.id],
  )

  const onEditTasklistBlock = useMemo(
    () =>
      capabilities.has('editDescription')
        ? async (
            tasklist_blocks_operation?: string,
            editedBody?: string,
            tasklist_blocks_operation_tracker?: string,
          ) => {
            if (tasklist_blocks_operation && sidePanelMetadata.description) {
              const body = editedBody || sidePanelMetadata.description.body || ''
              await editIssue({body}, tasklist_blocks_operation, tasklist_blocks_operation_tracker)
            } else {
              reloadSidePanelMetadata(false)
            }
          }
        : undefined,
    [capabilities, editIssue, reloadSidePanelMetadata, sidePanelMetadata.description],
  )

  const showAddTasklistButton = !sub_issues && tasklist_block && item.contentType !== ItemType.DraftIssue

  return (
    <Box sx={{flex: fullHeight ? 'auto' : undefined, px: 2}}>
      <SidePanelLiveUpdate />
      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            py: 6,
            justifyContent: 'center',
          }}
        >
          <Spinner aria-label="Loading" />
        </Box>
      ) : (
        <Box as="section" sx={{height: fullHeight ? '100%' : undefined}}>
          <h3 style={{position: 'absolute', clipPath: 'circle(0)'}}>Description</h3>
          <SidePanelComment
            key={item.itemId()}
            allowEmptyBody
            author={sidePanelMetadata.user}
            createdAt={new Date(sidePanelMetadata.createdAt)}
            editedAt={
              sidePanelMetadata.description.editedAt ? new Date(sidePanelMetadata.description.editedAt) : undefined
            }
            reactions={sidePanelMetadata.reactions ?? {}}
            description={sidePanelMetadata.description}
            onEdit={onEdit}
            onEditTasklistBlock={onEditTasklistBlock}
            onReact={onReact}
            showAddTasklistButton={showAddTasklistButton}
          />
          {sidePanelMetadata.itemKey.kind === 'issue' && (
            <Box sx={{display: 'none'}}>
              <TasklistForm
                editedBody={sidePanelMetadata.description.body || ''}
                issueId={sidePanelMetadata.itemKey.itemId}
                repositoryId={sidePanelMetadata.itemKey.repositoryId}
                projectNumber={projectNumber}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
