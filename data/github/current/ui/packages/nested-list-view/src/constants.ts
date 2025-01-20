export const HeaderTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const
export type HeaderTag = (typeof HeaderTags)[number]
export const HeaderTagLevels = ['nested-list-view', 'nested-list-view-metadata', 'nested-listitem'] as const
export type HeaderTagLevel = (typeof HeaderTagLevels)[number]
export const defaultTitleHeaderTag = 'h2' as HeaderTag
export const defaultHeaderTags = {
  'nested-list-view': defaultTitleHeaderTag,
  'nested-list-view-metadata': 'h3' as HeaderTag,
  'nested-listitem': 'h3' as HeaderTag,
}

export const defaultIsSelectable = false
export const defaultTitle = 'List view'
export const defaultTotalCount = 3
export const defaultSelectedCount = 0
