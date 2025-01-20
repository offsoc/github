import type {ReactElement} from 'react'

/**
 * Express how tightly packed elements should be, where 'none' implies there's no space between them.
 */
export type Density = 'none' | 'condensed' | 'normal' | 'spacious'

/**
 * Represents a control to display in an ActionBar.
 */
export type Action = {
  /**
   * A unique identifier for this action. Should be unique within the ActionBar instance, but does not need to be
   * unique on the entire page.
   */
  key: string
  /**
   * A handler that defines how the action should render.
   * @param isOverflowMenu Whether the action is being rendered visibly in the page (false) versus hidden in an
   * overflow menu (true)
   * @returns Suggested to return `ActionList.Item`, `NestableActionMenu`, or `NestableActionMenu.NestedSelectPanel`
   * when `isOverflowMenu` is true.
   */
  render: (isOverflowMenu: boolean) => ReactElement
}

/**
 * Represents a control to always display in an ActionBar's overflow menu.
 */
export type StaticMenuAction = {
  /**
   * A unique identifier for this action. Should be unique within the ActionBar instance, but does not need to be
   * unique on the entire page.
   */
  key: string
  /**
   * A handler that defines how the action should render. Can be null if conditional logic is needed.
   * @returns Suggested to return `ActionList.Item`, `NestableActionMenu`, or `NestableActionMenu.NestedSelectPanel`.
   */
  render: () => ReactElement | null | undefined
}
