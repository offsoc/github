import {userHovercardPath} from '@github-ui/paths'
import {Box, Label, Link, StateLabel, Text} from '@primer/react'

import {Ago} from '../../utils/Ago'

type Props = {
  subjectType: string
  state: string | null
  isDraft: boolean
  author: string | null
  owner: {
    login: string | null
  }
  createdAt: string | null
}

const NotificationDefaultViewState = ({state, subjectType, isDraft, author, owner, createdAt}: Props) => {
  const prStatus = subjectType === 'PullRequest' && state ? pullRequestStateStatus(isDraft ? 'DRAFT' : state) : null

  return (
    <Box sx={{pb: 4}}>
      <Box sx={{display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 2, marginBottom: 2}}>
        {prStatus && state ? (
          <StateLabel
            variant="small"
            status={prStatus}
            sx={{textTransform: 'lowercase', '&:first-letter': {textTransform: 'capitalize'}}}
          >
            {stateString(state)}
          </StateLabel>
        ) : (
          state && (
            <Label>
              <Text sx={{textTransform: 'lowercase', '&:first-letter': {textTransform: 'capitalize'}}}>
                {stateString(state)}
              </Text>
            </Label>
          )
        )}
        {author && (
          <Box sx={{color: 'fg.muted', fontSize: 0}}>
            <Link
              href={`/${owner.login}`}
              data-hovercard-url={userHovercardPath({owner: author})}
              sx={{
                color: 'fg.muted',
                fontWeight: 'bold',
              }}
            >
              {author}
            </Link>{' '}
            {createdAt && (
              <>
                created <Ago timestamp={new Date(createdAt)} />
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}

const pullRequestStateStatus = (state: string): 'pullOpened' | 'pullClosed' | 'pullMerged' | 'draft' | null => {
  switch (state) {
    case 'OPEN':
      return 'pullOpened'
    case 'CLOSED':
      return 'pullClosed'
    case 'MERGED':
      return 'pullMerged'
    case 'DRAFT':
      return 'draft'
    default:
      return null
  }
}

const stateString = (state: string): string => {
  switch (state) {
    case 'OPEN':
      return 'Open'
    case 'CLOSED':
      return 'Closed'
    case 'MERGED':
      return 'Merged'
    case 'DRAFT':
      return 'Draft'
    case 'ANSWERED':
      return 'Answered'
    case 'UNANSWERED':
      return 'Unanswered'
    default:
      return state.replace(/_/g, ' ')
  }
}

export default NotificationDefaultViewState
