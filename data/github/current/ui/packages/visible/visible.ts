// Due to the way `visible` is implemented, it causes the browser to
// perform a full page reflow, it lays out all elements again, when called. This
// is one of the most time consuming operations the browser can perform, so it
// affects perceived page load times.
//
// The preferred way to determine element visibility is check for the presence
// of the `hidden` attribute: `if (el.hidden) ...` and `el.hidden = false`.
//
// More info: https://github.com/github/eslint-plugin-github/blob/master/docs/rules/no-d-none.md.
//
// We would ideally like to remove the `visible` function and consistently
// use the `hidden` attribute.
//
// Returns true if the element is hidden.
function hidden(element: HTMLElement): boolean {
  return element.offsetWidth <= 0 && element.offsetHeight <= 0
}

export default function visible(element: HTMLElement): boolean {
  return !hidden(element)
}
