import {useMemo} from 'react'
import type {Hooks, TableInstance} from 'react-table'

import {ensureValidPluginOrder, useRankingPluginName} from './plugins'

export const useRanking = <D extends object>(hooks: Hooks<D>) => {
  hooks.useInstance.push(useInstance)
}

useRanking.pluginName = useRankingPluginName

/**
 * A simple plug-in hook used to re-assign indexes after
 * groupBy and sortBy hooks processed the instance rows
 * but before the filter is applied.
 * Further reading about the expected indexing behaviour here
 * https://github.com/github/memex/pull/2902
 *
 * @see {@link docs/adr/adr-010-rank-in-memex-table.md}
 *
 * @param instance react-table instance that's being processed
 */
function useInstance<D extends object>(instance: TableInstance<D>) {
  const {rows, plugins} = instance

  ensureValidPluginOrder(plugins, useRanking.pluginName)

  useMemo(() => {
    let index = 0
    for (const row of rows) {
      if (row.isGrouped) {
        for (const subrow of row.subRows) {
          subrow.index = index++
        }
      } else {
        row.index = index++
      }
    }
    return rows
  }, [rows])
}
