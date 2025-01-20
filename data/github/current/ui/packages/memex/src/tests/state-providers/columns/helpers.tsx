import type {MemexColumn} from '../../../client/api/columns/contracts/memex-column'
import type {
  ColumnsContextType,
  ColumnsStableContextType,
} from '../../../client/state-providers/columns/columns-state-provider'
import type {
  ProjectDetailsContextType,
  ProjectNumberContextType,
  SetProjectContextType,
} from '../../../client/state-providers/memex/memex-state-provider'
import type {stubSetAllColumnsFn} from '../../mocks/state-providers/columns-context'
import {createWrapperWithContexts} from '../../wrapper-utils'

export function createWrapperWithColumnsContext(contextValue: ColumnsContextType) {
  return createWrapperWithContexts({Columns: contextValue})
}

export function createWrapperWithColumnsStableContext(contextValue: ColumnsStableContextType) {
  return createWrapperWithContexts({ColumnsStable: contextValue})
}

export function createWrapperWithProjectAndColumnsStableContext(
  setProject: SetProjectContextType,
  projectNumber: ProjectNumberContextType,
  projectDetailsValue: ProjectDetailsContextType,
  contextValue: ColumnsStableContextType,
) {
  return createWrapperWithContexts({
    SetProject: setProject,
    ProjectNumber: projectNumber,
    ProjectDetails: projectDetailsValue,
    ColumnsStable: contextValue,
  })
}

export function expectMockWasCalledWithColumns(
  stub: ReturnType<typeof stubSetAllColumnsFn>,
  expectedColumns: Array<MemexColumn>,
) {
  const columnModelsSetAllColumnsWasCalledWith = stub.mock.calls[0][0]
  expect(columnModelsSetAllColumnsWasCalledWith).toHaveLength(expectedColumns.length)
  for (let i = 0; i < expectedColumns.length; i++) {
    expect(columnModelsSetAllColumnsWasCalledWith[i].id).toEqual(expectedColumns[i].id)
  }
}
