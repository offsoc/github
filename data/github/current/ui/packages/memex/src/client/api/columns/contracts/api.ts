// This module contains the type information for interacting with the Memex
// backend. If you are making changes to these types, ensure there is a
// corresponding backend PR to github/github that supports this.

import type {IColumnWithItems} from './column-with-items'
import type {Iteration, IterationConfiguration} from './iteration'
import type {MemexColumn, MemexColumnDataType, MemexProjectColumnId, SystemColumnId} from './memex-column'
import type {ProgressConfiguration} from './progress'
import type {NewOptions, NewSingleOption, SingleSelectValue, UpdateOptions, UpdateSingleOption} from './single-select'

export interface CreateMemexColumnRequest {
  memexProjectColumn: MemexColumnCreateData
}

export interface CreateMemexColumnResponse {
  memexProjectColumn: MemexColumn
}

export interface UpdateMemexColumnRequest extends IUpdateColumnMetadataData {
  memexProjectColumnId: MemexProjectColumnId
}

export interface UpdateMemexColumnResponse {
  memexProjectColumn: IColumnWithItems
}

export interface DestroyMemexColumnRequest {
  memexProjectColumnId: number
}

export type IDestroyMemexColumnResponse = void

export interface GetMemexColumnsRequest {
  memexProjectColumnIds: Array<SystemColumnId | number>
}

export interface GetMemexColumnsResponse {
  memexProjectColumns: Array<IColumnWithItems>
}

export interface CreateColumnOptionRequest {
  memexProjectColumnId: MemexProjectColumnId
  option: NewSingleOption
}

export interface CreateColumnOptionResponse {
  memexProjectColumn: MemexColumn
}

export interface UpdateColumnOptionResponse {
  memexProjectColumn: MemexColumn
}

export interface DestroyColumnOptionRequest {
  memexProjectColumnId: MemexProjectColumnId
  option: SingleSelectValue
}

export interface DestroyColumnOptionResponse {
  memexProjectColumn: MemexColumn
}

export type MemexColumnCreateData = {
  name?: string
  dataType?: MemexColumnDataType
  defaultColumn?: boolean
  settings?: {
    options?: NewOptions
    configuration?: CreateIterationConfiguration
  }
}

type IUpdateColumnMetadataData = {
  name?: string
  width?: number
  settings?:
    | {options: UpdateOptions}
    | {configuration: UpdateIterationConfiguration}
    | {progressConfiguration: UpdateProgressConfiguration}
  previousMemexProjectColumnId?: MemexProjectColumnId | null
}

// when creating an iteration we do not need to include the id for each iteration
export type CreateIterationConfiguration = Omit<IterationConfiguration, 'iterations' | 'completedIterations'> & {
  iterations: Array<Omit<Iteration, 'id' | 'titleHtml'>>
  completedIterations: Array<Omit<Iteration, 'id' | 'titleHtml'>>
}

// when updating an iteration we do not need to include titleHtml for each iteration
export type UpdateIterationConfiguration = Omit<IterationConfiguration, 'completedIterations' | 'iterations'> & {
  iterations: Array<Omit<Iteration, 'titleHtml'>>
  completedIterations: Array<Omit<Iteration, 'titleHtml'>>
}

export type UpdateProgressConfiguration = ProgressConfiguration

export interface UpdateColumnIterationData {
  id: string
  name: string
}

export interface UpdateColumnOptionRequest {
  memexProjectColumnId: MemexProjectColumnId
  option: UpdateSingleOption
}
