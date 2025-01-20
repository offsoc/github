export const PageData = {
  changeBase: 'change_base',
  commits: 'commits',
  disableAutoMerge: 'disable_auto_merge',
  enableAutoMerge: 'enable_auto_merge',
  header: 'header',
  statusChecks: 'status_checks',
  tabCounts: 'tab_counts',
  codeButton: 'code_button',
  updateTitle: 'update_title',
  mergeBox: 'merge_box',
} as const

export type PageDataKey = keyof typeof PageData
export type PageDataName = (typeof PageData)[PageDataKey]
