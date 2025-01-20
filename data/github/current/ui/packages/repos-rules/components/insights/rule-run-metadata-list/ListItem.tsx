import {Box, Octicon, Text, Tooltip} from '@primer/react'
import {AlertIcon, CheckIcon, XIcon} from '@primer/octicons-react'
import {GitHubAvatar} from '@github-ui/github-avatar'

type ListItemProps = {
  state: string
  avatarLabel?: string
  avatarUrl?: string
  hovercardUrl?: string
  title: string
  description?: string
  warning?: string
  titleClass?: string
  paddingY?: number
  paddingLeft?: number
}
export function ListItem({
  state,
  avatarLabel,
  avatarUrl,
  hovercardUrl,
  title,
  description,
  warning,
  titleClass,
  paddingY,
  paddingLeft,
}: ListItemProps) {
  return (
    <Box
      as="li"
      sx={{
        paddingY: paddingY ?? 2,
        marginX: 3,
        paddingLeft: paddingLeft ?? 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 2,
      }}
    >
      <Octicon
        icon={state === 'success' ? CheckIcon : XIcon}
        sx={{
          color: state === 'success' ? 'success.fg' : 'danger.fg',
        }}
      />
      {avatarUrl && <GitHubAvatar aria-label={avatarLabel} src={avatarUrl} data-hovercard-url={hovercardUrl} />}
      <Text className={titleClass} sx={{fontWeight: titleClass ? undefined : 'bold'}}>
        {title}
      </Text>
      {description ? (
        <Text sx={{color: 'fg.muted', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflowX: 'clip'}}>
          {description}
        </Text>
      ) : null}
      {warning && (
        <Tooltip aria-label={warning} wrap={true}>
          <AlertIcon size={16} />
        </Tooltip>
      )}
    </Box>
  )
}
