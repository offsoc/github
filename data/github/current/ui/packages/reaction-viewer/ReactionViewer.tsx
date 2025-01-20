import {FocusKeys} from '@primer/behaviors'
import {ActionList, AnchoredOverlay, Box, useFocusZone} from '@primer/react'
import {useCallback, useState} from 'react'
import {graphql, useFragment, useLazyLoadQuery, useRelayEnvironment} from 'react-relay'

import type {ReactionViewerGroups$key} from './__generated__/ReactionViewerGroups.graphql'
import type {ReactionViewerLazyQuery} from './__generated__/ReactionViewerLazyQuery.graphql'
import {ReactionButton} from './components/ReactionButton'
import {ReactionsMenuItem} from './components/ReactionsMenuItem'
import {ReactionViewerAnchor} from './components/ReactionViewerAnchor'
import type {ReactionContent} from './mutations/__generated__/addReactionMutation.graphql'
import {addReactionMutation} from './mutations/add-reaction-mutation'
import {removeReactionMutation} from './mutations/remove-reaction-mutation'

const ReactionGroupsFragment = graphql`
  fragment ReactionViewerGroups on Reactable {
    reactionGroups {
      ...ReactionButton_Reaction
      ...ReactionsMenuItem_Reaction
    }
  }
`

export type ReactionViewerProps = {
  reactionGroups: ReactionViewerGroups$key
  subjectId: string
  locked?: boolean
}

export function ReactionViewer({reactionGroups, subjectId, locked = false}: ReactionViewerProps) {
  const environment = useRelayEnvironment()
  const reactionGroupsData = useFragment<ReactionViewerGroups$key>(ReactionGroupsFragment, reactionGroups)
  const [isOpen, setOpen] = useState(false)

  const onReact = useCallback(
    (subject: string, reaction: ReactionContent, viewerHasReacted: boolean) => {
      if (locked) return
      if (viewerHasReacted) {
        removeReactionMutation({
          environment,
          input: {subject, content: reaction},
        })
      } else {
        addReactionMutation({
          environment,
          input: {subject, content: reaction},
        })
      }
    },
    [environment, locked],
  )

  const {containerRef} = useFocusZone({
    bindKeys: FocusKeys.HomeAndEnd | FocusKeys.ArrowHorizontal,
    focusOutBehavior: 'wrap',
  })

  return (
    <Box
      role="toolbar"
      aria-label="Reactions"
      ref={containerRef as React.RefObject<HTMLDivElement>}
      sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}
    >
      {!locked && (
        <AnchoredOverlay
          open={isOpen}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          anchorRef={containerRef}
          focusZoneSettings={{
            bindKeys: FocusKeys.ArrowAll | FocusKeys.HomeAndEnd,
            focusOutBehavior: 'wrap',
          }}
          renderAnchor={p => <ReactionViewerAnchor renderAnchorProps={p} />}
        >
          <ActionList
            sx={{display: 'flex', flexDirection: 'row', p: 1, gap: 1}}
            role="menu"
            aria-orientation="horizontal"
          >
            {(reactionGroupsData.reactionGroups || []).map((reactionGroup, index) => (
              <ReactionsMenuItem
                key={index}
                reaction={reactionGroup}
                onReact={(reaction: ReactionContent, viewerHasReacted: boolean) => {
                  onReact(subjectId, reaction, viewerHasReacted)
                  setOpen(false)
                }}
              />
            ))}
          </ActionList>
        </AnchoredOverlay>
      )}

      {(reactionGroupsData.reactionGroups || []).map((reactionGroup, index) => (
        <ReactionButton
          reaction={reactionGroup}
          key={index}
          onReact={(reaction: ReactionContent, viewerHasReacted: boolean) =>
            onReact(subjectId, reaction, viewerHasReacted)
          }
        />
      ))}
    </Box>
  )
}

/**
 * Query component for the ReactionViewer, used to fetch the reaction groups for a given subject.
 * @param id The relay ID of the subject to fetch reactions for.
 * @param subjectLocked Whether the subject is locked and reactions should not be allowed.
 * @returns The ReactionViewer component with the fetched reaction groups.
 */
export function ReactionViewerQueryComponent({id, subjectLocked}: {id: string; subjectLocked?: boolean}) {
  const data = useLazyLoadQuery<ReactionViewerLazyQuery>(
    graphql`
      query ReactionViewerLazyQuery($id: ID!) {
        node(id: $id) {
          ... on Comment {
            ...ReactionViewerGroups
          }
        }
      }
    `,
    {id},
    {fetchPolicy: 'store-or-network'},
  )

  if (!data.node) {
    return null
  }

  return <ReactionViewer subjectId={id} reactionGroups={data.node} locked={subjectLocked} />
}

export default ReactionViewer
