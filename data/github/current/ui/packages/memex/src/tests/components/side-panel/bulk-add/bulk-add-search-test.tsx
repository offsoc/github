/* eslint eslint-comments/no-use: off */

import {ThemeProvider} from '@primer/react'
import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router-dom'

import {CommandProvider} from '../../../../client/commands/command-provider'
import {BulkAddItemsProvider} from '../../../../client/components/side-panel/bulk-add/bulk-add-items-provider'
import {BulkAddView} from '../../../../client/components/side-panel/bulk-add/bulk-add-view'
import ToastContainer from '../../../../client/components/toasts/toast-container'
import {useRepositoryItems} from '../../../../client/hooks/use-repository-items'
import {SidePanelProvider} from '../../../../client/hooks/use-side-panel'
import {ColumnsStateProvider} from '../../../../client/state-providers/columns/columns-state-provider'
import {
  ProjectDetailsContext,
  ProjectNumberContext,
  SetProjectContext,
} from '../../../../client/state-providers/memex/memex-state-provider'
import {RepositoriesStateProvider} from '../../../../client/state-providers/repositories/repositories-state-provider'
import {useRepositories} from '../../../../client/state-providers/repositories/use-repositories'
import {SuggestionsStateProvider} from '../../../../client/state-providers/suggestions/suggestions-state-provider'
import {DefaultMemex} from '../../../../mocks/data/memexes'
import {DefaultSuggestedRepositories} from '../../../../mocks/data/suggestions'
import {ProductionDefaultColumns} from '../../../../mocks/mock-data'
import {InitialItems} from '../../../../stories/data-source'
import {createMockEnvironment} from '../../../create-mock-environment'
import {asMockHook} from '../../../mocks/stub-utilities'
import {defaultProjectDetails, existingProject, setProjectContext} from '../../../state-providers/memex/helpers'
import {QueryClientWrapper} from '../../../test-app-wrapper'

jest.mock('../../../../client/state-providers/repositories/use-repositories')
jest.mock('../../../../client/hooks/use-repository-items')
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  return {
    ...originalModule,
    useSearchParams: jest.fn().mockImplementation(() => {
      return [new URLSearchParams(), jest.fn()]
    }),
  }
})
const getWrapper = () => {
  const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
    return (
      <MemoryRouter>
        <QueryClientWrapper>
          <ThemeProvider>
            <CommandProvider>
              <ToastContainer>
                <SetProjectContext.Provider value={setProjectContext()}>
                  <ProjectNumberContext.Provider value={existingProject()}>
                    <ProjectDetailsContext.Provider value={defaultProjectDetails()}>
                      <RepositoriesStateProvider>
                        <ColumnsStateProvider>
                          <BulkAddItemsProvider>
                            <SuggestionsStateProvider>
                              <SidePanelProvider>{children}</SidePanelProvider>
                            </SuggestionsStateProvider>
                          </BulkAddItemsProvider>
                        </ColumnsStateProvider>
                      </RepositoriesStateProvider>
                    </ProjectDetailsContext.Provider>
                  </ProjectNumberContext.Provider>
                </SetProjectContext.Provider>
              </ToastContainer>
            </CommandProvider>
          </ThemeProvider>
        </QueryClientWrapper>
      </MemoryRouter>
    )
  }

  return wrapper
}

const setupEnvironment = () => {
  createMockEnvironment({
    jsonIslandData: {
      'memex-data': DefaultMemex,
      'memex-columns-data': ProductionDefaultColumns,
      'memex-items-data': InitialItems,
    },
  })
  const wrapper = getWrapper()

  return {wrapper}
}

async function waitForStatePropagation() {
  return new Promise(resolve => setTimeout(resolve, 350))
}

let user: ReturnType<typeof userEvent.setup>
beforeEach(() => {
  asMockHook(useRepositories).mockReturnValue({
    suggestRepositories: () => Promise.resolve(DefaultSuggestedRepositories),
    clearCachedSuggestions: jest.fn(),
  })

  asMockHook(useRepositoryItems).mockReturnValue({
    items: [],
    refresh: jest.fn((_repositoryId: number, _query: string, _force?: any) => Promise.resolve()),
  })
  user = userEvent.setup()
})

async function renderBulkAddView() {
  const {wrapper} = setupEnvironment()

  // eslint-disable-next-line testing-library/no-unnecessary-act, @typescript-eslint/require-await
  await act(async () => {
    // Leaving a note for this first act ignore directive.
    // It is necessary to wrap rendering of the BulkAddView in act due to side effects that update internal component state on render.
    // Which doesn't have any visible effect that we can screen.findBy to wait for.
    render(<BulkAddView />, {wrapper})
  })

  return {wrapper}
}

describe('Search', () => {
  it('should not initially show the search button', async () => {
    const {wrapper} = setupEnvironment()

    // eslint-disable-next-line testing-library/no-unnecessary-act, @typescript-eslint/require-await
    await act(async () => {
      // Leaving a note for this first act ignore directive.
      // It is necessary to wrap rendering of the BulkAddView in act due to side effects that update internal component state on render.
      render(<BulkAddView />, {wrapper})
    })
    const searchInput = screen.queryByTestId('bulk-add-search-input')
    expect(searchInput).toBeNull()
  })

  it('should show the search button when in the input has text', async () => {
    await renderBulkAddView()

    const searchInput = await screen.findByTestId<HTMLInputElement>('suggested-items-search-input')
    expect(searchInput).not.toBeNull()

    await user.type(searchInput, 'test')
    expect(searchInput).toHaveValue('test')

    const searchButton = await screen.findByTestId('bulk-add-search-button')
    expect(searchButton).not.toBeNull()
  })

  it('should query relevant suggestions when search button is clicked', async () => {
    await renderBulkAddView()

    const searchInput = await screen.findByTestId<HTMLInputElement>('suggested-items-search-input')
    expect(searchInput).not.toBeNull()

    // "type" into the input
    await user.type(searchInput, 'test')
    expect(searchInput).toHaveValue('test')

    const searchButton = await screen.findByTestId('bulk-add-search-button')
    expect(searchButton).not.toBeNull()

    // execute the search
    await user.click(searchButton)

    // currently the search is triggered as a side effect to state/props changes, so we need to wait for state propagation
    await waitForStatePropagation()

    expect(useRepositoryItems(jest.fn()).refresh).toHaveBeenCalledWith(DefaultSuggestedRepositories[0].id, 'test', true)
  })
})
