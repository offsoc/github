import {ensurePluginOrder, type PluginHook, useColumnOrder, useSortBy} from 'react-table'

export const useCustomGroupByPluginName = 'useCustomGroupBy'
export const useRankingPluginName = 'useRanking'
export const useSortedByGroupOrderingPluginName = 'useSortedByGroupOrdering'

const PLUGIN_ORDER = [
  useColumnOrder.pluginName,
  useSortBy.pluginName,
  useCustomGroupByPluginName,
  useSortedByGroupOrderingPluginName,
  useRankingPluginName,
]

export function ensureValidPluginOrder<D extends object>(plugins: Array<PluginHook<D>>, pluginName: string) {
  let pluginsBeforeCurrent: Array<string> = []
  const pluginIndex = PLUGIN_ORDER.indexOf(pluginName)
  if (pluginIndex > -1) {
    pluginsBeforeCurrent = PLUGIN_ORDER.slice(0, pluginIndex)
  }
  return ensurePluginOrder(plugins, pluginsBeforeCurrent, pluginName)
}
