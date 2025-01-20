import {StopIcon} from '@primer/octicons-react'
import {Box, Octicon, Text} from '@primer/react'
import {ErrorWithRetry} from '@github-ui/error-with-retry'

import {MESSAGES} from '../../constants/messages'

const GenericError = ({retry}: {retry: () => void}) => (
  <ErrorWithRetry message={MESSAGES.couldNotLoad} retry={retry} sx={{p: 4}} />
)

const NotFoundError = () => (
  <Box
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    }}
  >
    <Octicon size="medium" icon={StopIcon} sx={{color: 'danger.fg'}} />
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1}}>
      <h2>{MESSAGES.issueNotFound}</h2>
      <Text sx={{color: 'fg.muted'}}>{MESSAGES.issueNotFoundDescription}</Text>
    </Box>
  </Box>
)

export const renderGenericError = (retry: () => void) => <GenericError retry={retry} />

export const renderIssueViewerErrors = (retry: () => void, error: Error) => {
  if (error.message.includes('NOT_FOUND')) {
    return <NotFoundError />
  }

  return renderGenericError(retry)
}
