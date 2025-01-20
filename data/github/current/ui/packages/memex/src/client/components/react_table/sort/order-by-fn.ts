import type {OrderByFn, Row} from 'react-table'

/**
 * Row indices are manually reassigned to match the new row order after a sorting operation
 * via the "useRanking" plugin.
 *
 * The defaultOrderByFn from react-table uses the row index as a fallback for sorting
 * when two rows would yield the same sorting result. When sorting by descending order, this
 * can produce a non-deterministic result.
 *
 * If rowA (index=0) and rowB (index=1) each have the same value for "Repository" and direction is descending,
 * the row with highest index would take precedence (rowB). After rewriting the indices, sorting again would
 * produce a different result: rowA (now index=1) would be sorted before rowB (now index=0).
 *
 * This function ensures that lowest index is always preferred where rows have an equal sorting value.
 */
export function orderByFn<T extends object>(
  rows: Array<Row<T>>,
  sortFns: Array<OrderByFn<T>>,
  directions: Array<boolean | string>,
) {
  return [...rows].sort((rowA, rowB) => {
    for (let i = 0; i < sortFns.length; i += 1) {
      const sortFn = sortFns[i]
      const desc = directions[i] === false || directions[i] === 'desc'
      const sortInt = sortFn?.(rowA, rowB) ?? 0
      if (sortInt !== 0) {
        return desc ? -sortInt : sortInt
      }
    }
    // Unlike the defaultOrderByFn, lower indices are sorted first regardless of sort direction.
    // This line is the only divergence from the default order-by mechanism:
    // https://github.com/TanStack/react-table/blob/v7/src/plugin-hooks/useSortBy.js#L390
    return rowA.index - rowB.index
  })
}
