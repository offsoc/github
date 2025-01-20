import {Box} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import type {Reactions$key} from './__generated__/Reactions.graphql'

export const ReactionsQuery = graphql`
  fragment Reactions on Reactable {
    reactionGroups {
      content
      reactors {
        totalCount
      }
    }
  }
`

type Props = {
  dataKey: Reactions$key
  reactionEmojiToDisplay: {reaction: string; reactionEmoji: string}
  showCompactDensity?: boolean
}

export const Reactions = ({dataKey, reactionEmojiToDisplay, showCompactDensity = false}: Props) => {
  const data = useFragment(ReactionsQuery, dataKey)
  const totalReactionCount =
    data.reactionGroups?.filter(e => e.content === reactionEmojiToDisplay.reaction)[0]?.reactors.totalCount || 0

  if (!reactionEmojiToDisplay?.reactionEmoji || totalReactionCount === 0) {
    return null
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        fontSize: 0,
        minWidth: showCompactDensity ? 0 : '45px',
        ml: showCompactDensity ? 0 : 3,
      }}
    >
      {totalReactionCount > 0 && (
        <>
          <span>{reactionEmojiToDisplay.reactionEmoji}</span>
          <span>{totalReactionCount}</span>
        </>
      )}
    </Box>
  )
}
