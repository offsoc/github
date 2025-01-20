import {ChevronDownIcon, ChevronRightIcon, FileSymlinkFileIcon} from '@primer/octicons-react'
import {Box, IconButton, Label, Text} from '@primer/react'
import {Tooltip} from '@primer/react/next'

type ConversationHeaderProps = {
  isCollapsed: boolean
  isOutdated: boolean
  isResolved: boolean
  line?: number | null
  onNavigateToDiffThread: () => void
  onToggleCollapsed: () => void
  path: string
  rightSideContent?: JSX.Element
}

export function ConversationHeader({
  isCollapsed,
  isOutdated,
  isResolved,
  line,
  onToggleCollapsed,
  onNavigateToDiffThread,
  path,
  rightSideContent,
}: ConversationHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        p: 2,
        backgroundColor: 'canvas.subtle',
        borderRadius: isCollapsed ? 2 : 0,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        borderBottom: isCollapsed ? 'none' : '1px solid',
        borderBottomColor: 'border.default',
      }}
    >
      {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
      <IconButton
        aria-label={isCollapsed ? 'Open review comment' : 'Close review comment'}
        icon={isCollapsed ? ChevronRightIcon : ChevronDownIcon}
        size="small"
        unsafeDisableTooltip={true}
        variant="invisible"
        onClick={onToggleCollapsed}
      />
      <Box as="h4" sx={{ml: 1, display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0, mr: 2}}>
        <Text
          sx={{
            overflow: 'hidden',
            fontFamily: 'var(--fontStack-monospace)',
            fontWeight: 500,
            fontSize: 0,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            direction: 'rtl',
          }}
        >
          {path}
        </Text>
        {!!line && (
          <Text sx={{fontSize: 0, color: 'fg.muted', fontWeight: 'normal', ml: 2, whiteSpace: 'nowrap'}}>
            Line {line}
          </Text>
        )}
      </Box>
      {isResolved && (
        <Label size="large" sx={{mx: 1}} variant="done">
          Resolved
        </Label>
      )}
      {isOutdated && !isResolved && (
        <Label size="large" sx={{mx: 1}} variant="attention">
          Outdated
        </Label>
      )}
      <Tooltip direction="sw" id="jump-to-thread" text="Jump to the thread in the diff" type="label">
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          aria-labelledby="jump-to-thread"
          icon={FileSymlinkFileIcon}
          unsafeDisableTooltip={true}
          variant="invisible"
          onClick={onNavigateToDiffThread}
        />
      </Tooltip>
      {rightSideContent}
    </Box>
  )
}
