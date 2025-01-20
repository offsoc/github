/**
 * A generic type representing any focus state
 *
 * - `D` = A type representing data about the focus state
 */
export type Focus<D = Record<string, unknown> | null> = {
  type: string
  details: D
  focusType: FocusType
}

/**
 * A type representing a focus on a 2D coordinate.
 *
 * - `CX` = A type representing a value along the X axis in a 2D plane
 * - `CY` = A type representing a value along the Y axis in a 2D plane
 * - `M` = A type representing implementation-specific metadata
 */
export type CoordinateFocus<CX, CY, M = Record<string, unknown> | void> = Focus<{x: CX; y: CY; meta: M}> & {
  type: 'coordinate'
}

/**
 * A state describing the type of focus currently being employed
 */
export const FocusType = {
  /** The item is styled as selected, but is in read-only mode. */
  Focus: 'Focus',

  /** The item is both styled as selected and is in direct write mode. */
  Edit: 'Edit',

  /**
   * The item is styled as selected and is in write mode, but update is being performed in a modal
   * dialog that is not a descendant of the item in the DOM. */
  Suspended: 'Suspended',

  /**
   * This is a special value used to indicate that the item should retain whatever `FocusType`
   * it already has.
   */
  Same: 'Same',
} as const
export type FocusType = ObjectValues<typeof FocusType>

/**
 * A type describing navigation of focus along one or both axes
 * - `S` = A type representing extra metadata for a navigation action. Useful if it's not purely a
 * movement along the XY axes.
 */
export type FocusNavigation<S> = {
  /** Movement along the X axis */
  x?: NavigationDirection
  /** Movement along the Y axis */
  y?: NavigationDirection
  /** The type of focus state to use (default = no change) */
  focusType?: FocusType
  /** Extra details for special navigation actions */
  details?: S
}

/**
 * A direction along the X or Y axis to navigate focus, in
 * left-to-right/top-to-bottom ordering
 *
 * The `Same` value is a special value meaning that the user wishes to retain
 * their current focus position. This is mostly useful as a way to reduce code
 * branching by passing `Same` as the navigation type to some function, rather
 * than conditionally only calling it if a navigation was provided.
 */
export const NavigationDirection = {
  First: 'First',
  Second: 'Second',
  Previous: 'Previous',
  Same: 'Same',
  Next: 'Next',
  Last: 'Last',
} as const
export type NavigationDirection = ObjectValues<typeof NavigationDirection>
