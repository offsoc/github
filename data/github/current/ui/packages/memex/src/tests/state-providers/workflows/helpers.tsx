import type {ComponentType} from 'react'
import {MemoryRouter, type MemoryRouterProps} from 'react-router-dom'

import type {GetArchiveStatusResponse} from '../../../client/api/memex-items/contracts'
import type {
  CountMatchedRepositoryItemsResponse,
  GetSuggestedRepositoriesResponse,
} from '../../../client/api/repository/contracts'
import ToastContainer from '../../../client/components/toasts/toast-container'
import {ProjectNumberContext} from '../../../client/state-providers/memex/memex-state-provider'
import {ArchiveStatusProvider} from '../../../client/state-providers/workflows/archive-status-state-provider'
import {WorkflowsStateProvider} from '../../../client/state-providers/workflows/workflows-state-provider'
import {DefaultSuggestedRepositories} from '../../../mocks/data/suggestions'
import {MAX_ARCHIVED_ITEMS} from '../../../mocks/data/workflows'
import {respondWithErrorAndMock, respondWithJsonSuccessAndMock} from '../../api-request-helpers'
import {QueryClientWrapper} from '../../test-app-wrapper'
import {existingProject} from '../memex/helpers'

export type WrapperType = ComponentType<{children: React.ReactNode}>

export function createWrapperForWorkflowEditor(routerProps?: MemoryRouterProps) {
  const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => {
    return (
      <QueryClientWrapper>
        <ToastContainer>
          <MemoryRouter initialEntries={['/orgs/monalisa/projects/1']} {...routerProps}>
            <ProjectNumberContext.Provider value={existingProject()}>
              <ArchiveStatusProvider>
                <WorkflowsStateProvider>{children}</WorkflowsStateProvider>
              </ArchiveStatusProvider>
            </ProjectNumberContext.Provider>
          </MemoryRouter>
        </ToastContainer>
      </QueryClientWrapper>
    )
  }
  return wrapper
}

export function mockGetArchiveStatus(response?: Partial<GetArchiveStatusResponse>): jest.Mock {
  return respondWithJsonSuccessAndMock(
    'memex-get-archive-status-api-data',
    'get',
    response ?? {totalCount: MAX_ARCHIVED_ITEMS, isArchiveFull: true, archiveLimit: MAX_ARCHIVED_ITEMS},
  )
}

export function mockGetArchiveStatusError(): jest.Mock {
  return respondWithErrorAndMock('memex-get-archive-status-api-data', 'get', 'Unauthorized')
}

export function mockCountMatchedRepositoryItems(response?: Partial<CountMatchedRepositoryItemsResponse>): jest.Mock {
  return respondWithJsonSuccessAndMock('count-issues-and-pulls-api-data', 'get', response ?? {count: 0})
}

export function mockCountMatchedRepositoryItemsError(): jest.Mock {
  return respondWithErrorAndMock('count-issues-and-pulls-api-data', 'get', 'Unauthorized')
}

export function mockSuggestedRepositories(response?: Partial<GetSuggestedRepositoriesResponse>): jest.Mock {
  return respondWithJsonSuccessAndMock(
    'suggested-repositories-api-data',
    'get',
    response ?? {repositories: DefaultSuggestedRepositories},
  )
}
