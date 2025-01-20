import {RepoAvatar} from '@github-ui/copilot-chat/components/RepoAvatar'
import type {CopilotChatRepo} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {LinkExternalIcon} from '@primer/octicons-react'
import {ActionList, AnchoredOverlay, Box, Button, Text} from '@primer/react'
import {useCallback, useState} from 'react'

export function RepoButton({repo}: {repo: CopilotChatRepo}) {
  const [isOpen, setIsOpen] = useState(false)
  const openOverlay = useCallback(() => setIsOpen(true), [setIsOpen])
  const closeOverlay = useCallback(() => setIsOpen(false), [setIsOpen])

  return (
    <AnchoredOverlay
      renderAnchor={anchorProps => (
        <Button
          {...anchorProps}
          leadingVisual={() => <RepoAvatar ownerLogin={repo.ownerLogin} ownerType={repo.ownerType} size={20} />}
          sx={{color: 'fg.default', height: '28px'}}
          variant="invisible"
        >
          {repo.name}
        </Button>
      )}
      open={isOpen}
      onOpen={openOverlay}
      onClose={closeOverlay}
      overlayProps={{width: 'large'}}
    >
      <Box sx={{display: 'flex', flexDirection: 'column', maxWidth: '500px', padding: 2}}>
        <Box sx={{display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', p: 2, pb: 0}}>
          <RepoAvatar ownerLogin={repo.ownerLogin} ownerType={repo.ownerType} size={32} />
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <Text sx={{fontSize: 1, fontWeight: 600}}>{repo.name}</Text>
            <Text sx={{color: 'fg.muted', fontSize: 0}}>
              <span style={{textTransform: 'capitalize'}}>{repo.visibility}</span> repository
            </Text>
          </Box>
        </Box>
        {repo.description && <Text sx={{p: 2, pt: 3}}>{repo.description}</Text>}
        <ActionList.Divider sx={{mx: '-8px'}} />
        <ActionList.LinkItem href={`/${repo.ownerLogin}/${repo.name}?copilot=1`}>
          <ActionList.LeadingVisual>
            <LinkExternalIcon />
          </ActionList.LeadingVisual>
          Open this conversation in repository view
        </ActionList.LinkItem>
      </Box>
    </AnchoredOverlay>
  )
}
