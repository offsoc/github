import {ThemeProvider} from '@primer/react'

import {IssueState, IssueStateReason} from '../../../client/api/common-contracts'
import {BulkAddItemsProvider} from '../../../client/components/side-panel/bulk-add/bulk-add-items-provider'
import ToastContainer from '../../../client/components/toasts/toast-container'
import {ColumnsStateProvider} from '../../../client/state-providers/columns/columns-state-provider'
import {ProjectNumberContext} from '../../../client/state-providers/memex/memex-state-provider'
import {RepositoriesStateProvider} from '../../../client/state-providers/repositories/repositories-state-provider'
import {SuggestionsStateProvider} from '../../../client/state-providers/suggestions/suggestions-state-provider'
import {TrackedByItemsStateProvider} from '../../../client/state-providers/tracked-by-items/tracked-by-items-state-provider'
import {ArchiveStatusProvider} from '../../../client/state-providers/workflows/archive-status-state-provider'
import {DefaultMemex} from '../../../mocks/data/memexes'
import {mockRepos} from '../../../mocks/data/repositories'
import {mockUsers} from '../../../mocks/data/users'
import {createMockEnvironment} from '../../create-mock-environment'
import {QueryClientWrapper} from '../../test-app-wrapper'
import {existingProject} from '../memex/helpers'

export const mockTrackedItemsByParent = {
  count: 2,
  items: [
    {
      uuid: 'b7180bad-5c02-4073-96e4-b30cb0fdd5bd',
      itemId: 3,
      title: 'child 2',
      state: IssueState.Open,
      stateReason: IssueStateReason.NotPlanned,
      url: 'http://github.localhost:56055/github/public-server/issues/3',
      displayNumber: 3,
      repositoryId: 3,
      repositoryName: 'public-server',
      ownerLogin: 'github',
      assignees: [],
      labels: [],
      position: 400,
      ownerId: 1,
    },
    {
      uuid: 'b7180bad-5c02-4072-96e4-b30cb0fdd5bd',
      itemId: 4,
      title: 'child 3',
      state: IssueState.Closed,
      stateReason: IssueStateReason.Completed,
      url: 'http://github.localhost:56055/github/public-server/issues/4',
      displayNumber: 4,
      repositoryId: 3,
      repositoryName: 'public-server',
      ownerLogin: 'github',
      assignees: [],
      labels: [],
      position: 500,
      ownerId: 3,
    },
  ],
  parentCompletion: {
    total: 2,
    completed: 1,
    percent: 50,
  },
}

export function createTrackedByItemsStateProviderWrapper() {
  createMockEnvironment({
    jsonIslandData: {
      'memex-data': DefaultMemex,
    },
    suggestedRepositories: mockRepos,
    suggestedAssignees: mockUsers,
  })

  const InnerWrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
    return <TrackedByItemsStateProvider>{children}</TrackedByItemsStateProvider>
  }

  const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
    return (
      <QueryClientWrapper>
        <ThemeProvider>
          <ToastContainer>
            <ProjectNumberContext.Provider value={existingProject()}>
              <RepositoriesStateProvider>
                <ColumnsStateProvider>
                  <ArchiveStatusProvider>
                    <SuggestionsStateProvider>
                      <TrackedByItemsStateProvider>
                        <BulkAddItemsProvider>{children}</BulkAddItemsProvider>
                      </TrackedByItemsStateProvider>
                    </SuggestionsStateProvider>
                  </ArchiveStatusProvider>
                </ColumnsStateProvider>
              </RepositoriesStateProvider>
            </ProjectNumberContext.Provider>
          </ToastContainer>
        </ThemeProvider>
      </QueryClientWrapper>
    )
  }

  const trackedByWrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
    return wrapper({
      children: <InnerWrapper>{children}</InnerWrapper>,
    })
  }

  return {trackedByWrapper}
}
