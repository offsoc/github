export const HeaderTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const
export type HeaderTag = (typeof HeaderTags)[number]
export const HeaderTagLevels = ['list-view', 'list-view-metadata', 'listitem'] as const
export type HeaderTagLevel = (typeof HeaderTagLevels)[number]
export const defaultTitleHeaderTag = 'h2' as HeaderTag
export const defaultHeaderTags = {
  'list-view': defaultTitleHeaderTag,
  'list-view-metadata': 'h3' as HeaderTag,
  listitem: 'h3' as HeaderTag,
}

export const Variants = ['default', 'compact'] as const

export const defaultVariant = 'default'
export const defaultIsSelectable = false
export const defaultTitle = 'List view'
export const defaultTotalCount = 3
export const defaultSelectedCount = 0
