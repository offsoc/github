import DetailsDialogElement from '@github/details-dialog-element'
import {isFormField} from '@github-ui/form-utils'
import {ssrSafeDocument} from '@github-ui/ssr-utils'

// Check if container has any user interactions that could be lost if replaced.
//
// container - An Element to check for user interactions.
// ignoreFocusedContainer - A Boolean, `true` to skip the
// focus check if the container is the focused element. Dirty field and
// mousedown checks are still performed.
export function hasInteractions(
  container: Element,
  ignoreFocusedContainer = false,
  ignoreDirtyFields = false,
): boolean {
  return (
    (!ignoreDirtyFields && hasDirtyFields(container)) ||
    hasFocus(container, ignoreFocusedContainer) ||
    hasMousedown(container) ||
    markedAsDirty(container)
  )
}

export function hasDirtyFields(container: Element): boolean {
  for (const field of container.querySelectorAll('input, textarea')) {
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
      if (formFieldValueChanged(field)) {
        return true
      }
    }
  }
  return false
}

function formFieldValueChanged(input: HTMLInputElement | HTMLTextAreaElement): boolean {
  if (input instanceof HTMLInputElement && (input.type === 'checkbox' || input.type === 'radio')) {
    if (input.checked !== input.defaultChecked) return true
  } else {
    if (input.value !== input.defaultValue) return true
  }
  return false
}

let stubbedActiveElement: Element | null

export async function withActiveElement(element: Element, fn: () => unknown): Promise<void> {
  stubbedActiveElement = element
  try {
    await fn()
  } finally {
    stubbedActiveElement = null
  }
}

function getActiveElement(container: Element): Element | null {
  if (stubbedActiveElement instanceof Element) {
    return stubbedActiveElement
  } else if (container && container.ownerDocument && container.ownerDocument.activeElement) {
    return container.ownerDocument.activeElement
  }
  return null
}

let latestMousedownTarget: EventTarget | null
let latestMouseupTarget: EventTarget | null

ssrSafeDocument?.addEventListener(
  'mousedown',
  function (event: Event) {
    latestMousedownTarget = event.target
  },
  true,
)

ssrSafeDocument?.addEventListener(
  'mouseup',
  function (event: Event) {
    latestMousedownTarget = null
    latestMouseupTarget = event.target
  },
  true,
)

ssrSafeDocument?.addEventListener(
  'contextmenu',
  function (event: Event) {
    // Treat `contextmenu` events like `mouseup` events so that we still
    // update content if the user right-clicks on a safe element.
    latestMousedownTarget = null
    latestMouseupTarget = event.target
  },
  true,
)

ssrSafeDocument?.addEventListener(
  'dragend',
  function () {
    // Drag and drop does not result in a mouseup event.
    latestMousedownTarget = null
  },
  true,
)

function hasFocus(container: Element, ignoreFocusedContainer: boolean): boolean {
  const activeElement = getActiveElement(container)
  if (activeElement === null) return false
  if (ignoreFocusedContainer && activeElement === container) return false

  // Updatable container hasFocus if one of the following is true:
  // 1. Focus target is both a form field AND the update target
  const formFieldFocused = activeElement === container && isFormField(activeElement)
  if (formFieldFocused) return true
  // 2. Focus target is relevent (ie not a UPDATABLE_INTERACTIVE_TARGET)
  //
  // We consider it safe to update content if the focused element is a button or a link, as
  // both likely only trigger transient actions
  const focusTargetIsRelevent = container.contains(activeElement) && !activeElementIsSafe(activeElement)
  if (focusTargetIsRelevent) return true

  // 3. The last clicked element is an open details summary
  const interactingWithOpenDetails =
    latestMouseupTarget instanceof Element &&
    container.contains(latestMouseupTarget) &&
    !!latestMouseupTarget.closest('details[open] > summary')
  return interactingWithOpenDetails
}

const UPDATABLE_INTERACTIVE_TARGET = 'a[href], button'

function activeElementIsSafe(activeElement: Element): boolean {
  if (activeElement instanceof DetailsDialogElement) return true

  const isLinkOrButton = activeElement instanceof HTMLAnchorElement || activeElement instanceof HTMLButtonElement
  const isInsideTaskItem = activeElement.parentElement?.classList.contains('task-list-item')
  if (isLinkOrButton && isInsideTaskItem) {
    return true
  }

  if (!(latestMouseupTarget instanceof Element)) return false
  const updatableActiveElement = activeElement.closest(UPDATABLE_INTERACTIVE_TARGET)
  if (!updatableActiveElement) return false
  const updatableMouseupElement = latestMouseupTarget.closest(UPDATABLE_INTERACTIVE_TARGET)
  return updatableActiveElement === updatableMouseupElement
}

function hasMousedown(container: Element): boolean {
  return container.matches(':active:enabled') || container.contains(latestMousedownTarget as Node | null)
}

function markedAsDirty(container: Element): boolean {
  return container.closest('.is-dirty') || container.querySelector('.is-dirty') ? true : false
}
