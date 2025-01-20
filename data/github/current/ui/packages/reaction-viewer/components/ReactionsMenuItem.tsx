import {ActionList} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import {EMOJI_MAP} from '../utils/ReactionGroups'
import type {ReactionContent} from './__generated__/ReactionButton_Reaction.graphql'
import type {ReactionsMenuItem_Reaction$key} from './__generated__/ReactionsMenuItem_Reaction.graphql'

type ReactionsMenuItemProps = {
  onReact: (reaction: ReactionContent, viewerHasReacted: boolean) => void
  reaction: ReactionsMenuItem_Reaction$key
}

export function ReactionsMenuItem({onReact, reaction}: ReactionsMenuItemProps) {
  const {content, viewerHasReacted} = useFragment<ReactionsMenuItem_Reaction$key>(
    graphql`
      fragment ReactionsMenuItem_Reaction on ReactionGroup {
        content
        viewerHasReacted
      }
    `,
    reaction,
  )
  return (
    <ActionList.Item
      key={content}
      sx={{
        '&:hover': {
          backgroundColor: 'accent.emphasis',
        },
        py: 1,
        px: 2,
        m: 0,
        backgroundColor: viewerHasReacted ? 'accent.subtle' : 'transparent',
      }}
      role="menuitemcheckbox"
      aria-checked={viewerHasReacted}
      onSelect={() => onReact(content, viewerHasReacted)}
    >
      {EMOJI_MAP[content]}
    </ActionList.Item>
  )
}
