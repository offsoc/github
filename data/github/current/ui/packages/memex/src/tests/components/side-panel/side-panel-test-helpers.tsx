import {ThemeProvider} from '@primer/react'
import {Factory} from 'fishery'
import {MemoryRouter} from 'react-router-dom'

import type {MemexColumn} from '../../../client/api/columns/contracts/memex-column'
import {Role, State} from '../../../client/api/common-contracts'
import type {MemexItem} from '../../../client/api/memex-items/contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import type {SidePanelItem} from '../../../client/api/memex-items/side-panel-item'
import type {SidePanelMetadata} from '../../../client/api/side-panel/contracts'
import {CommandProvider} from '../../../client/commands/command-provider'
import ToastContainer from '../../../client/components/toasts/toast-container'
import type {JSONIslandData} from '../../../client/helpers/json-island'
import {overrideDefaultPrivileges} from '../../../client/helpers/viewer-privileges'
import {SidePanelProvider} from '../../../client/hooks/use-side-panel'
import {createMemexItemModel, DraftIssueModel, type MemexItemModel} from '../../../client/models/memex-item-model'
import {ColumnsStateProvider} from '../../../client/state-providers/columns/columns-state-provider'
import {IssueStateProvider} from '../../../client/state-providers/issues/issue-state-provider'
import {ProjectNumberContext} from '../../../client/state-providers/memex/memex-state-provider'
import {RepositoriesStateProvider} from '../../../client/state-providers/repositories/repositories-state-provider'
import {SuggestionsStateProvider} from '../../../client/state-providers/suggestions/suggestions-state-provider'
import {TrackedByItemsStateProvider} from '../../../client/state-providers/tracked-by-items/tracked-by-items-state-provider'
import {ArchiveStatusProvider} from '../../../client/state-providers/workflows/archive-status-state-provider'
import {DefaultMemex} from '../../../mocks/data/memexes'
import {mockRepos} from '../../../mocks/data/repositories'
import {mockUsers} from '../../../mocks/data/users'
import {ProductionDefaultColumns} from '../../../mocks/mock-data'
import {InitialItems} from '../../../stories/data-source'
import {createMockEnvironment} from '../../create-mock-environment'
import {stubGetSidePanelMetadata} from '../../mocks/api/side-panel'
import {existingProject} from '../../state-providers/memex/helpers'
import {createTestQueryClient, QueryClientWrapper} from '../../test-app-wrapper'

export const setupEnvironment = (
  columns?: Array<MemexColumn>,
  items?: Array<MemexItem>,
  jsonIslandData?: Partial<JSONIslandData>,
) => {
  createMockEnvironment({
    jsonIslandData: {
      'memex-data': DefaultMemex,
      'memex-columns-data': columns ?? ProductionDefaultColumns,
      'memex-items-data': items ?? InitialItems,
      'logged-in-user': {
        id: 1,
        global_relay_id: 'MDQ6VXNl',
        login: 'test-user',
        name: 'Test User',
        avatarUrl: 'https://github.com/test-user.png',
        isSpammy: false,
      },
      ...jsonIslandData,
    },
    suggestedRepositories: mockRepos,
    suggestedAssignees: mockUsers,
  })

  const itemModels = (items ?? InitialItems).map(item => createMemexItemModel(item))

  const queryClient = createTestQueryClient()
  const wrapper = getSidePanelWrapper(queryClient)

  return {wrapper, itemModels, queryClient}
}

export const getSidePanelWrapper = (queryClient = createTestQueryClient()) => {
  const Wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
    return (
      <QueryClientWrapper initialData={{queryClient}}>
        <MemoryRouter>
          <ThemeProvider>
            <CommandProvider>
              <ToastContainer>
                <ProjectNumberContext.Provider value={existingProject()}>
                  <RepositoriesStateProvider>
                    <ColumnsStateProvider>
                      <ArchiveStatusProvider>
                        <SuggestionsStateProvider>
                          <TrackedByItemsStateProvider>
                            <SidePanelProvider>{children}</SidePanelProvider>
                          </TrackedByItemsStateProvider>
                        </SuggestionsStateProvider>
                      </ArchiveStatusProvider>
                    </ColumnsStateProvider>
                  </RepositoriesStateProvider>
                </ProjectNumberContext.Provider>
              </ToastContainer>
            </CommandProvider>
          </ThemeProvider>
        </MemoryRouter>
      </QueryClientWrapper>
    )
  }

  return Wrapper
}

export function getDraftIssueModel(itemModels: Array<MemexItemModel>) {
  const item = itemModels.find(i => i instanceof DraftIssueModel) as DraftIssueModel

  if (!item) {
    throw new Error('A DraftIssueModel is required for this test')
  }

  return item
}

export const setupEnvironmentWithDraftIssue = () => {
  const {wrapper, itemModels} = setupEnvironment(undefined, undefined, {
    'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Write}),
  })

  const item = getDraftIssueModel(itemModels)

  const itemId = item.id
  // TODO: This seems like a bogus repositoryId, but DraftIssue has no repo
  const repositoryId = -1
  const contentType = ItemType.DraftIssue

  const sidePanelWrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
    return wrapper({
      children: <IssueStateProvider {...{itemId, repositoryId, contentType}}>{children}</IssueStateProvider>,
    })
  }

  return {wrapper: sidePanelWrapper, item}
}

export const getSidePanelWrapperWithMockedMetadata = (
  itemId: number,
  repositoryId: number,
  mocked: SidePanelMetadata,
  type: ItemType = ItemType.Issue,
) => {
  const {wrapper: Wrapper} = setupEnvironment()
  const getSidePanelMetadataStub = stubGetSidePanelMetadata(mocked)
  const InnerWrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
    return (
      <IssueStateProvider
        itemId={itemId}
        memexItemId={type === ItemType.DraftIssue ? itemId : undefined}
        repositoryId={repositoryId}
        contentType={type}
      >
        {children}
      </IssueStateProvider>
    )
  }
  const sidePanelWrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
    return (
      <Wrapper>
        <InnerWrapper>{children}</InnerWrapper>
      </Wrapper>
    )
  }
  return {wrapper: sidePanelWrapper, getSidePanelMetadataStub}
}

export const MockHierarchySidePanelItemFactory = Factory.define<SidePanelItem>(({sequence}) => {
  return {
    isHierarchy: true,
    contentType: ItemType.Issue,
    id: sequence,
    ownerId: () => sequence,
    getItemIdentifier: () => undefined,
    itemId: () => sequence,
    getState: () => State.Open,
    isDraft: () => false,
    getSuggestionsCacheKey: () => `${sequence}`,
    hierarchyEntry: () => {
      return {ownerId: sequence, itemId: sequence}
    },
    getUrl: () => 'http://www.google.com',
    getRawTitle: () => 'hello hello',
    getHtmlTitle: () => 'hello hello',
    getLabels: () => [],
    getAssignees: () => [],
    getRepositoryName: () => 'repo',
    getItemNumber: () => sequence,
    getMilestone: () => undefined,
    getLinkedPullRequests: () => [],
    getExtendedRepository: () => undefined,
    getStatus: () => undefined,
    getCustomField: () => undefined,
    getCompletion: () => undefined,
    getTrackedBy: () => undefined,
    getIssueType: () => undefined,
  }
})
