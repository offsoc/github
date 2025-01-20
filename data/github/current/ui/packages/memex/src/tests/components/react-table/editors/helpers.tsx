import {ThemeProvider} from '@primer/react'

import {SuggestionsStateProvider} from '../../../../client/state-providers/suggestions/suggestions-state-provider'
import {QueryClientWrapper} from '../../../test-app-wrapper'

export function createWrapper(): React.FC<{children: React.ReactNode}> {
  return function Wrapper({children}) {
    return (
      <QueryClientWrapper>
        <ThemeProvider>
          <SuggestionsStateProvider>{children}</SuggestionsStateProvider>
        </ThemeProvider>
      </QueryClientWrapper>
    )
  }
}
