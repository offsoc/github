import {MemoryRouter} from 'react-router-dom'

import {CommandProvider} from '../../../client/commands/command-provider'
import ToastContainer from '../../../client/components/toasts/toast-container'
import {ViewContext} from '../../../client/hooks/use-views'
import {ColumnsContext, ColumnsStableContext} from '../../../client/state-providers/columns/columns-state-provider'
import {
  ProjectDetailsContext,
  ProjectNumberContext,
  SetProjectContext,
} from '../../../client/state-providers/memex/memex-state-provider'
import {ProjectMigrationStateProvider} from '../../../client/state-providers/project-migration/project-migration-state-provider'
import {WorkflowsContext} from '../../../client/state-providers/workflows/workflows-state-provider'
import {seedJSONIsland} from '../../../mocks/server/mock-server'
import {InitialItems} from '../../../stories/data-source'
import {createColumnsContext} from '../../mocks/state-providers/columns-context'
import {createColumnsStableContext} from '../../mocks/state-providers/columns-stable-context'
import {QueryClientWrapper} from '../../test-app-wrapper'
import {defaultProjectDetails, existingProject} from '../memex/helpers'

const viewContextValue = {viewStateDispatch: jest.fn(), updateViewServerStates: jest.fn()} as any
const workflowsContextValue = {setWorkflows: jest.fn(), setAllWorkflows: jest.fn()} as any

export function createProjectMigrationStateProviderWrapper(memexItems = InitialItems) {
  seedJSONIsland('memex-items-data', memexItems)
  const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => (
    <QueryClientWrapper>
      <MemoryRouter initialEntries={['/orgs/monalisa/projects/1']}>
        <ToastContainer>
          <SetProjectContext.Provider value={{setProject: jest.fn()}}>
            <ColumnsContext.Provider value={createColumnsContext()}>
              <ColumnsStableContext.Provider value={createColumnsStableContext()}>
                <ProjectNumberContext.Provider value={existingProject()}>
                  <ProjectDetailsContext.Provider value={defaultProjectDetails()}>
                    <CommandProvider>
                      <ViewContext.Provider value={viewContextValue}>
                        <WorkflowsContext.Provider value={workflowsContextValue}>
                          <ProjectMigrationStateProvider>{children}</ProjectMigrationStateProvider>
                        </WorkflowsContext.Provider>
                      </ViewContext.Provider>
                    </CommandProvider>
                  </ProjectDetailsContext.Provider>
                </ProjectNumberContext.Provider>
              </ColumnsStableContext.Provider>
            </ColumnsContext.Provider>
          </SetProjectContext.Provider>
        </ToastContainer>
      </MemoryRouter>
    </QueryClientWrapper>
  )

  return wrapper
}
