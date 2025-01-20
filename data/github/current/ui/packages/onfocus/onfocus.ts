// React to elements receiving focus
//
// Often we need to apply some behavior to form elements when they start getting
// interacted with. We could use `observe`, but that can be expensive if there
// are many such elements on the page, and when we aren't actually interested in
// those elements until they receive focus.
//
// This is a lightweight and preferred alternative to the family of methods
// from `github/focused` module.
//
// Examples
//
//   onFocus('.js-widget', element => {
//     // ...
//   })

import SelectorSet from 'selector-set'

let initialized = false
const selectorSet: SelectorSet<(el: HTMLElement) => void> = new SelectorSet()

function handleFocus(event: FocusEvent) {
  const focused = event.target
  if (focused instanceof HTMLElement && focused.nodeType !== Node.DOCUMENT_NODE) {
    for (const match of selectorSet.matches(focused)) {
      match.data.call(null, focused)
    }
  }
}

export function onFocus(selector: string, fn: (el: HTMLElement) => unknown) {
  if (!initialized) {
    initialized = true
    // We use the "focus" event in the capture phase because Firefox
    // historically had a limitation with "focusin" not bubbling.
    document.addEventListener('focus', handleFocus, true)
  }
  selectorSet.add(selector, fn)

  if (document.activeElement instanceof HTMLElement && document.activeElement.matches(selector)) {
    fn(document.activeElement)
  }
}

export function onKey(
  eventType: 'keydown' | 'keypress' | 'keyup',
  selector: string,
  inputHandler: (event: KeyboardEvent) => unknown,
) {
  function blurHandler(event: Event) {
    const currentTarget = event.currentTarget as HTMLElement
    if (!currentTarget) return
    currentTarget.removeEventListener(eventType, inputHandler)
    currentTarget.removeEventListener('blur', blurHandler)
  }

  onFocus(selector, function (field) {
    field.addEventListener(eventType, inputHandler)
    field.addEventListener('blur', blurHandler)
  })
}

export function onInput(selector: string, inputHandler: EventListener) {
  function blurHandler(event: Event) {
    const {currentTarget} = event
    if (!currentTarget) return

    currentTarget.removeEventListener('input', inputHandler)
    currentTarget.removeEventListener('blur', blurHandler)
  }

  onFocus(selector, function (field) {
    field.addEventListener('input', inputHandler)
    field.addEventListener('blur', blurHandler)
  })
}
