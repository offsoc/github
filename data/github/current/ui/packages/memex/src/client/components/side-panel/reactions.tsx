import {testIdProps} from '@github-ui/test-id-props'
import {FocusKeys} from '@primer/behaviors'
import {SmileyIcon} from '@primer/octicons-react'
import {ActionList, AnchoredOverlay, Box, Button, IconButton, Tooltip, useFocusZone} from '@primer/react'
import {useState} from 'react'

import {ReactionEmotion, type Reactions} from '../../api/side-panel/contracts'
import {getInitialState} from '../../helpers/initial-state'

export const SidePanelReactions: React.FC<{
  reactions: Reactions
  onReact?: (reaction: ReactionEmotion, reacted: boolean, actor: string) => Promise<void>
}> = ({reactions, onReact: externalOnReact}) => {
  const {loggedInUser} = getInitialState()
  const userLogin = loggedInUser?.login || ''

  const reactionEntries = Object.values(ReactionEmotion).map(reaction => [reaction, reactions[reaction] ?? []] as const)

  const reactedReactions = new Set(
    reactionEntries.filter(([, reactors]) => reactors?.includes(userLogin) ?? false).map(([reaction]) => reaction),
  )

  const disabled = externalOnReact === undefined
  const onReact = (reaction: ReactionEmotion) => externalOnReact?.(reaction, reactedReactions.has(reaction), userLogin)

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
      {...testIdProps('reactions-toolbar')}
    >
      {!disabled && <ReactionsMenu onReact={onReact} reactedReactions={reactedReactions} />}

      {reactionEntries.map(([reaction, reactedUsers]) => (
        <ReactionButton
          reaction={reaction}
          reactedUsers={reactedUsers}
          key={reaction}
          reacted={reactedReactions.has(reaction)}
          onClick={() => onReact(reaction)}
          disabled={disabled}
        />
      ))}
    </Box>
  )
}

const ReactionsMenu: React.FC<{
  onReact: (emotion: ReactionEmotion) => void
  reactedReactions: Set<ReactionEmotion>
}> = ({onReact, reactedReactions}) => {
  const [isOpen, setOpen] = useState(false)

  const {containerRef} = useFocusZone()

  const react = (emotion: ReactionEmotion) => {
    setOpen(false)
    onReact(emotion)
  }

  return (
    <AnchoredOverlay
      open={isOpen}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      anchorRef={containerRef}
      focusZoneSettings={{
        bindKeys: FocusKeys.ArrowAll | FocusKeys.HomeAndEnd,
        focusOutBehavior: 'wrap',
      }}
      renderAnchor={p => (
        <IconButton
          size="small"
          sx={{
            borderRadius: '50%',
            height: 28,
            width: 28,
            '& > span': {
              ml: '-1px',
            },
          }}
          icon={SmileyIcon}
          {...testIdProps('all-reactions-button')}
          {...p}
          aria-label="All reactions"
          aria-labelledby={undefined}
        />
      )}
    >
      <ActionList
        sx={{display: 'flex', flexDirection: 'row', p: 1, gap: 1}}
        role="menu"
        aria-orientation="horizontal"
        {...testIdProps('reactions-overlay')}
      >
        {Object.values(ReactionEmotion).map(emotion => (
          <ActionList.Item
            key={emotion}
            sx={{
              '&:hover': {
                backgroundColor: 'accent.emphasis',
              },
              py: 1,
              px: 2,
              m: 0,
              backgroundColor: reactedReactions.has(emotion) ? 'accent.subtle' : 'transparent',
            }}
            role="menuitemcheckbox"
            aria-checked={reactedReactions.has(emotion)}
            onClick={() => react(emotion)}
            onKeyDown={e => {
              // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation()
                react(emotion)
              }
            }}
            {...testIdProps(`all-reactions-${emotion}-reaction-button`)}
          >
            {getReactionEmoji(emotion)}
          </ActionList.Item>
        ))}
      </ActionList>
    </AnchoredOverlay>
  )
}

const ReactionButton: React.FC<{
  reaction: ReactionEmotion
  reactedUsers: Array<string>
  disabled?: boolean
  reacted: boolean
  onClick: React.MouseEventHandler<HTMLButtonElement>
}> = ({reaction, reactedUsers, disabled, reacted, onClick}) => {
  if (reactedUsers.length === 0) return null

  const label = `${reacted ? 'React' : 'Unreact'} with ${getReactionEmoji(reaction)} (${
    reactedUsers.length
  } ${getReactionEmoji(reaction)} reaction${
    reactedUsers.length === 1 ? '' : 's'
  } so far, including ${summarizeReactions(reactedUsers)})`

  return (
    <Tooltip aria-label={summarizeReactions(reactedUsers)} sx={{maxWidth: '100%'}} wrap direction="ne" align="left">
      <Button
        size="small"
        sx={{
          '&:hover:not([disabled])': {
            backgroundColor: 'accent.muted',
          },
          backgroundColor: reacted ? 'accent.subtle' : 'transparent',
          borderColor: reacted ? `accent.emphasis` : 'border.default',
          borderRadius: 20,
          px: 2,
          boxShadow: 'none',
        }}
        aria-label={label}
        role="switch"
        aria-checked={reacted}
        leadingVisual={() => <>{getReactionEmoji(reaction)}</>}
        {...testIdProps(`${reaction}-reaction-button`)}
        onClick={onClick}
        disabled={disabled}
      >
        {reactedUsers.length}
      </Button>
    </Tooltip>
  )
}

function summarizeReactions(reactions: Array<string>) {
  const max = 5

  const summary = reactions.slice(0, max)
  if (reactions.length > max) summary.push(`${reactions.length - max} more`)

  if (summary.length === 1) return summary[0]
  if (summary.length === 2) return summary.join(' and ')

  summary.push(`and ${summary.pop()}`)
  return summary.join(', ')
}

function getReactionEmoji(reaction: ReactionEmotion): string {
  switch (reaction) {
    case ReactionEmotion.THUMBS_UP:
      return '👍'
    case ReactionEmotion.THUMBS_DOWN:
      return '👎'
    case ReactionEmotion.SMILE:
      return '😄'
    case ReactionEmotion.TADA:
      return '🎉'
    case ReactionEmotion.THINKING_FACE:
      return '😕'
    case ReactionEmotion.HEART:
      return '❤️'
    case ReactionEmotion.ROCKET:
      return '🚀'
    case ReactionEmotion.EYES:
      return '👀'
    default:
      throw new Error(`${reaction} must be handled`)
  }
}
