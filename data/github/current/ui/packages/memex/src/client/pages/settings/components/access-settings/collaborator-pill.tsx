import {GitHubAvatar} from '@github-ui/github-avatar'
import {testIdProps} from '@github-ui/test-id-props'
import {XIcon} from '@primer/octicons-react'
import {Box, Button, Text} from '@primer/react'

type CollaboratorPillProps = {
  login: string
  avatarUrl: string
  id: string
  onRemove: () => void
}

export function CollaboratorPill({login, id, onRemove, avatarUrl}: CollaboratorPillProps) {
  return (
    <Box
      key={id}
      sx={{
        m: 1,
        pl: '2px',
        pr: 1,
        pt: '2px',
        pb: '2px',
        display: 'flex',
        borderRadius: '20px',
        bg: 'accent.subtle',
        flexDirection: 'row',
        alignItems: 'center',
      }}
      {...testIdProps(`collaborator-pill-${login}`)}
    >
      <GitHubAvatar loading="lazy" alt={login} src={avatarUrl} sx={{mr: 1}} />
      <Text sx={{mr: 1, color: 'accent.fg'}}>{login}</Text>
      <Button variant="invisible" onClick={() => onRemove()} sx={{p: 0, height: 'auto'}}>
        <XIcon />
      </Button>
    </Box>
  )
}
