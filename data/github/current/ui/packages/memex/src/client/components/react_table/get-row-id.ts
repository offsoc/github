import type {Row} from 'react-table'

/**
 * Overrides the default getRowId function from react-table.
 * Provides a more stable row id based on the item's id instead
 * of the row index.
 * https://github.com/TanStack/table/blob/v7/docs/src/pages/docs/api/useTable.md#table-options
 */
export function getRowId<T extends object>(item: T & {id: number | string}, _index: number, parent?: Row<T>): string {
  const itemId = item.id.toString()
  // This parent.id syntax is copied from the react-table default:
  // https://github.com/TanStack/table/blob/06703a56890122cedf1b2fa4b82982999537774e/src/hooks/useTable.js#L31-L32
  // The `useCustomGroupBy` hook currently assigns a different id when grouping is enabled.
  return parent ? [parent.id, itemId].join('.') : itemId
}
