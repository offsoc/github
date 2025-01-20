import {Button, Tooltip} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import {constructReactionButtonLabel, EMOJI_MAP, summarizeReactors} from '../utils/ReactionGroups'
import type {ReactionButton_Reaction$key, ReactionContent} from './__generated__/ReactionButton_Reaction.graphql'

type ReactionButtonProps = {
  reaction: ReactionButton_Reaction$key
  disabled?: boolean
  onReact: (reaction: ReactionContent, viewerHasReacted: boolean) => void
}

export function ReactionButton({reaction, disabled, onReact}: ReactionButtonProps) {
  const {content, reactors, viewerHasReacted} = useFragment(
    graphql`
      fragment ReactionButton_Reaction on ReactionGroup {
        content
        reactors(first: 5) {
          nodes {
            ... on User {
              login
              __typename
            }
            ... on Bot {
              login
              __typename
            }
            ... on Organization {
              login
              __typename
            }
            ... on Mannequin {
              login
              __typename
            }
          }

          totalCount
        }
        viewerHasReacted
      }
    `,
    reaction,
  )

  if (!reactors || reactors.totalCount === 0) return null

  const reactorLogins = ((reactors && reactors.nodes) || []).flatMap(node =>
    node && node?.__typename !== '%other' && node?.login ? [node.login] : [],
  )

  const label = constructReactionButtonLabel(content, viewerHasReacted, reactorLogins, reactors.totalCount)

  return (
    <Tooltip
      aria-label={summarizeReactors(reactorLogins, reactors.totalCount)}
      sx={{maxWidth: '100%'}}
      wrap={true}
      direction="ne"
      align="left"
    >
      <Button
        size="small"
        sx={{
          '&:hover:not([disabled])': {
            backgroundColor: 'accent.muted',
          },
          backgroundColor: viewerHasReacted ? 'accent.subtle' : 'transparent',
          borderColor: viewerHasReacted ? `accent.emphasis` : 'border.default',
          borderRadius: 100,
          px: 2,
          boxShadow: 'none',
        }}
        aria-label={label}
        role="switch"
        aria-checked={viewerHasReacted}
        leadingVisual={() => <>{EMOJI_MAP[content]}</>}
        onClick={() => onReact(content, viewerHasReacted)}
        disabled={disabled}
      >
        {reactors.totalCount}
      </Button>
    </Tooltip>
  )
}
