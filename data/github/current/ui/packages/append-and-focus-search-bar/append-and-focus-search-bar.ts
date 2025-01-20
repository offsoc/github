/*
 * An event to trigger the search bar to append a query to the current query and focus it
 * (used by faceting to suggest further facets)
 */
const appendAndFocusEvent = 'blackbird_monolith_append_and_focus_input'

/*
 * Trigger the search bar to append a query to the current query and focus it
 * (used by faceting to suggest further facets)
 */
export function appendAndFocusSearchBar({
  appendQuery,
  retainScrollPosition,
  returnTarget,
}: {
  appendQuery?: string
  retainScrollPosition?: boolean
  returnTarget?: HTMLElement
}): void {
  window.dispatchEvent(
    new CustomEvent(appendAndFocusEvent, {
      detail: {
        appendQuery,
        retainScrollPosition,
        returnTarget,
      },
    }),
  )
}
