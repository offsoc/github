import type {ColumnModel} from '../../../../models/column-model'

export interface CopyOptions {
  /** Control whether column headers are included in the copied output. @default false */
  withHeaders?: boolean
  /** If provided, only these fields will be included. @default visibleFields */
  selectedFields?: ReadonlyArray<ColumnModel>
}
