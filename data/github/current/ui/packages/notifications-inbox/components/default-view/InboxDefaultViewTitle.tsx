import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import {LABELS} from '@github-ui/issue-viewer/Labels'
import {issueHovercardPath} from '@github-ui/paths'
import {SafeHTMLBox, type SafeHTMLString} from '@github-ui/safe-html'
import {LinkIcon} from '@primer/octicons-react'
import {Box, Heading, Link, Text} from '@primer/react'
import {useMemo} from 'react'

import {LABELS as NotificationsLabels} from '../../notifications/constants/labels'

type OwnerProps = {
  login: string | null
  listName: string
}

type Props = {
  number: number | null | undefined
  url: string
  title: string | null | undefined
  subjectType: string
  owner: OwnerProps
}

const NotificationDefaultViewTitle = ({number, url, title, subjectType, owner}: Props) => {
  const copyLinkLabel = useMemo(() => copyLinkType(subjectType), [subjectType])

  const copyLinkStyles = {
    position: 'absolute',
    left: '-25px',
    opacity: 0,
    '&:hover, &:focus': {
      opacity: 1,
    },
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
        position: 'relative',
        '&:hover [data-component="copy-link"], &:focus [data-component="copy-link"]': {
          opacity: 1,
        },
        '&:hover [data-component="copy-link"] button, &:focus [data-component="copy-link"] button': {
          color: 'var(--fgColor-accent, var(--color-accent-fg))',
        },
      }}
    >
      <Box as="span" data-component="copy-link" sx={copyLinkStyles}>
        <CopyToClipboardButton
          icon={LinkIcon}
          tooltipProps={{direction: 's'}}
          sx={{backgroundColor: 'transparent !important'}}
          textToCopy={url}
          ariaLabel={NotificationsLabels.copyLink(copyLinkLabel)}
          accessibleButton={false}
        />
      </Box>
      <Heading as="h1" sx={{fontSize: 3}}>
        {subjectType === 'PullRequest' ? (
          <SafeHTMLBox
            sx={{display: 'inline', wordBreak: 'break-word', mr: 1}}
            className="markdown-title"
            html={title as SafeHTMLString}
          />
        ) : (
          <Text sx={{display: 'inline', wordBreak: 'break-word', mr: 1}}>{title}</Text>
        )}
        {subjectType === 'PullRequest' && number ? (
          <Link
            href={url}
            target="_blank"
            data-hovercard-url={issueHovercardPath({
              owner: owner.login ?? '',
              repo: owner.listName,
              issueNumber: number,
            })}
            sx={{color: 'fg.muted', fontWeight: 'normal'}}
          >
            {LABELS.issueNumber(number)}
          </Link>
        ) : (
          <Link href={url} target="_blank" sx={{color: 'fg.muted', fontWeight: 'normal'}}>
            {number && LABELS.issueNumber(number)}
          </Link>
        )}
      </Heading>
    </Box>
  )
}

const copyLinkType = (state: string) => {
  switch (state) {
    case 'PullRequest':
      return 'pull request'
    case 'RepositoryInvitation':
      return 'repository invitation'
    case 'Discussion':
      return 'discussion'
    case 'TeamDiscussion':
      return 'team discussion'
    case 'WorkflowRun':
      return 'workflow run'
    default:
      return null
  }
}

export default NotificationDefaultViewTitle
