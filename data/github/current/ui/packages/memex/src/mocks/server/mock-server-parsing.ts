import type {MemexProjectColumnId, SystemColumnId} from '../../client/api/columns/contracts/memex-column'

export function stringToSyntheticId(id: string): MemexProjectColumnId {
  const parsedId = parseInt(id)
  return Number.isNaN(parsedId) ? (id as SystemColumnId) : parsedId
}
