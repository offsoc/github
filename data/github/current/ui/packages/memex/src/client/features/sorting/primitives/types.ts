import type {MemexItemModel} from '../../../models/memex-item-model'

/**
 * A minimal type representing the parameters needed to perform a comparison
 * of two rows (alongside the current row value).
 */
export type RowWithId = Pick<MemexItemModel, 'id' | 'contentType' | 'prioritizedIndex'>
