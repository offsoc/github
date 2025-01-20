import {Box, Link, Text} from '@primer/react'
import {useMemo} from 'react'

import {notificationsFeedbackUrl} from '../../notifications/utils/urls'

type Props = {
  url: string
  subjectType: string
}

const NotificationDefaultViewAlert = ({url, subjectType}: Props) => {
  const typeName = useMemo(() => getTypeName(subjectType), [subjectType])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: ['column', 'row'],
        gap: 2,
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 2,
        py: 3,
        px: 3,
        mb: 4,
        justifyContent: 'space-between',
      }}
    >
      <Text sx={{color: 'fg.muted'}}>
        {`Not all data is available inside of Inbox. `}
        <Link
          href={notificationsFeedbackUrl}
          target="_blank"
          sx={{
            whiteSpace: 'nowrap',
          }}
        >
          Give feedback
        </Link>
      </Text>
      <Link
        href={url}
        target="_blank"
        sx={{
          whiteSpace: 'nowrap',
        }}
      >
        Open {typeName} in GitHub
      </Link>
    </Box>
  )
}

const getTypeName = (subjectTypeName: string) => {
  switch (subjectTypeName) {
    case 'PullRequest':
      return 'Pull Request'
    case 'AdvisoryCredit':
      return 'Advisory Credit'
    case 'RepositoryAdvisory':
      return 'Repository Advisory'
    case 'RepositoryInvitation':
      return 'Repository Invitation'
    case 'RepositoryDependabotAlertsThread':
      return 'Repository Dependabot Alert'
    case 'SecurityAdvisory':
      return 'Security Advisory'
    case 'TeamDiscussion':
      return 'Team Discussion'
    case 'WorkflowRun':
      return 'Workflow Run'
    default:
      return subjectTypeName
  }
}

export default NotificationDefaultViewAlert
