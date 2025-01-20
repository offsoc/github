import {ListError as Error} from '@github-ui/list-view-items-issues-prs/ListError'
import {MESSAGES} from '../../constants/messages'
import {TEST_IDS} from '../../constants/test-ids'

export const ListError = (retry: () => void) => (
  <Error
    retry={retry}
    title={MESSAGES.failedToLoadIssues}
    message={MESSAGES.errorLoadingIssues}
    testid={TEST_IDS.fallback}
  />
)
