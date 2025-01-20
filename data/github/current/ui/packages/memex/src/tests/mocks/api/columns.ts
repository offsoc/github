import type {
  CreateColumnOptionRequest,
  CreateColumnOptionResponse,
  CreateMemexColumnRequest,
  CreateMemexColumnResponse,
  DestroyColumnOptionRequest,
  DestroyColumnOptionResponse,
  DestroyMemexColumnRequest,
  GetMemexColumnsResponse,
  IDestroyMemexColumnResponse,
  UpdateColumnOptionRequest,
  UpdateColumnOptionResponse,
  UpdateMemexColumnRequest,
  UpdateMemexColumnResponse,
} from '../../../client/api/columns/contracts/api'
import type {MemexColumn} from '../../../client/api/columns/contracts/memex-column'
import type {GetRequestType} from '../../../mocks/msw-responders'
import {
  delete_destroyMemexColumn,
  delete_destroyMemexColumnOption,
  get_getMemexColumns,
  post_createMemexColumn,
  post_createMemexColumnOption,
  put_updateMemexColumn,
  put_updateMemexColumnOption,
} from '../../../mocks/msw-responders/columns'
import {stubApiMethod} from './stub-api-method'

export function stubCreateColumn(createdColumn: MemexColumn) {
  return stubApiMethod<CreateMemexColumnRequest, CreateMemexColumnResponse>(post_createMemexColumn, {
    memexProjectColumn: createdColumn,
  })
}

export function stubUpdateColumn(column: MemexColumn) {
  return stubApiMethod<UpdateMemexColumnRequest, UpdateMemexColumnResponse>(put_updateMemexColumn, {
    memexProjectColumn: column,
  })
}

export function stubDestroyColumn() {
  return stubApiMethod<DestroyMemexColumnRequest, IDestroyMemexColumnResponse>(delete_destroyMemexColumn, undefined)
}

export function stubGetColumnsFn(columns: Array<MemexColumn>) {
  return stubApiMethod<GetRequestType, GetMemexColumnsResponse>(get_getMemexColumns, {
    memexProjectColumns: columns,
  })
}

export function stubAddOption(column: MemexColumn) {
  return stubApiMethod<CreateColumnOptionRequest, CreateColumnOptionResponse>(post_createMemexColumnOption, {
    memexProjectColumn: column,
  })
}

export function stubUpdateOption(column: MemexColumn) {
  return stubApiMethod<UpdateColumnOptionRequest, UpdateColumnOptionResponse>(put_updateMemexColumnOption, {
    memexProjectColumn: column,
  })
}

export function stubDestroyOption(column: MemexColumn) {
  return stubApiMethod<DestroyColumnOptionRequest, DestroyColumnOptionResponse>(delete_destroyMemexColumnOption, {
    memexProjectColumn: column,
  })
}
