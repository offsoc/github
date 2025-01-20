/**
 * A state object maintained by the Navigator through navigations. The data type is opaque to the framework. It will
 * likely be extended to include intermediate states so we can attach data like Relay persisted queries to a loading
 * state.
 */

export type RouteState = {
  type: 'loaded'
  /**
   * Note that this title does NOT include the ` · GitHub` suffix.
   */
  title: string
  data: unknown
}
