import {act, renderHook} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'

import {ViewType} from '../../client/helpers/view-type'
import type {NormalizedPageView} from '../../client/hooks/use-view-state-reducer/types'
import {
  useViewStateReducer,
  validateViewSessionData,
} from '../../client/hooks/use-view-state-reducer/use-view-state-reducer'
import {ViewStateActionTypes} from '../../client/hooks/use-view-state-reducer/view-state-action-types'
import {ColumnsContext, ColumnsStableContext} from '../../client/state-providers/columns/columns-state-provider'
import {ProjectNumberContext} from '../../client/state-providers/memex/memex-state-provider'
import {systemColumnFactory} from '../factories/columns/system-column-factory'
import {viewFactory} from '../factories/views/view-factory'
import {mockUseHasColumnData} from '../mocks/hooks/use-has-column-data'
import {mockUseRepositories} from '../mocks/hooks/use-repositories'
import {createColumnsContext} from '../mocks/state-providers/columns-context'
import {createColumnsStableContext} from '../mocks/state-providers/columns-stable-context'
import {existingProject} from '../state-providers/memex/helpers'
import {createTestEnvironment, TestAppContainer} from '../test-app-wrapper'

const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
  return (
    <MemoryRouter initialEntries={['/orgs/monalisa/projects/1']}>
      <ProjectNumberContext.Provider value={existingProject()}>
        <ColumnsContext.Provider value={createColumnsContext()}>
          <ColumnsStableContext.Provider value={createColumnsStableContext()}>{children}</ColumnsStableContext.Provider>
        </ColumnsContext.Provider>
      </ProjectNumberContext.Provider>
    </MemoryRouter>
  )
}

describe('useViewStateReducer', () => {
  it('should not throw if no json island nor view params present', () => {
    const {result} = renderHook(() => useViewStateReducer(), {wrapper})
    expect(result.current.currentView).toBeUndefined()
  })

  describe('reducer', () => {
    beforeEach(() => {
      // Mock async data fetching hooks to avoid open handles
      mockUseHasColumnData()
      mockUseRepositories()
    })

    describe('SetViewServerStates', () => {
      describe('column widths', () => {
        it('should apply column widths from server state on SetViewServerStates', () => {
          const columns = [
            systemColumnFactory.title().build(),
            systemColumnFactory.status({optionNames: ['todo', 'in progress', 'done']}).build(),
          ]
          const serverColumnWidths = {[columns[0].databaseId.toString()]: 200}
          const localColumnWidths = {[columns[0].databaseId.toString()]: 100}

          const view = viewFactory.table().build({
            layoutSettings: {
              table: {
                columnWidths: serverColumnWidths,
              },
            },
          })

          createTestEnvironment({
            'memex-columns-data': columns,
            'memex-views': [view],
          })

          const {result} = renderHook(() => useViewStateReducer(), {wrapper: TestAppContainer})

          // Apply local view state for column widths
          act(() => {
            result.current.viewStateDispatch({
              type: ViewStateActionTypes.SetColumnWidths,
              viewType: ViewType.Table,
              viewNumber: view.number,
              columnWidths: localColumnWidths,
            })
          })

          expect(result.current.currentView?.localViewStateDeserialized.layoutSettings?.table?.columnWidths).toEqual(
            localColumnWidths,
          )

          // Receive live update from server containing changed column widths
          act(() => {
            result.current.viewStateDispatch({
              type: ViewStateActionTypes.SetViewServerStates,
              viewStates: [view],
            })
          })

          expect(result.current.currentView?.localViewStateDeserialized.layoutSettings?.table?.columnWidths).toEqual(
            serverColumnWidths,
          )
        })
      })
    })
  })
})

describe('validateViewSessionData', () => {
  // Regression test for https://github.com/github/memex/issues/14954
  it('validates the layout type', () => {
    const view = viewFactory.table().build({layout: 'roadmap_layout'})
    const normalizedView: NormalizedPageView = {
      ...view,
      filter: view.filter ?? '',
      aggregationSettings: view.aggregationSettings!,
    }

    expect(validateViewSessionData({[view.number]: normalizedView})).toEqual(true)
    // @ts-expect-error: Overriding with invalid layout type to test validation
    expect(validateViewSessionData({[view.number]: {...normalizedView, layout: 'timeline_layout'}})).toEqual(false)
  })
})
