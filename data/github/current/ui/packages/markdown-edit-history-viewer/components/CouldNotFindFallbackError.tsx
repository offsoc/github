import {ErrorWithRetry} from '@github-ui/error-with-retry'

import {ERRORS} from '../constants/errors'

export const CouldNotFindFallbackError = ({retry}: {retry: () => void}) => (
  <ErrorWithRetry message={ERRORS.couldNotLoad} retry={retry} sx={{p: 4}} />
)
