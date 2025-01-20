import {useRef, useSyncExternalStore} from 'react'

function arraysEqual(a: unknown[], b: unknown[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

/**
 * Observe a selector and force a rerender when it changes. Returns the array of matched elements (note we don't
 * return a `NodeList` here, because nobody likes `NodeList`).
 * @param selector The CSS selector to observe.
 * @param elementClass Optional class to filter the elements by. Often `querySelectorAll` is used with a simple type
 * parameter or an assertion because it returns an array of `Element` when it's often clear what the element type will
 * be from the selector. This can be used to safely ensure that all the elements are of that expected type without
 * having to use an assertion. For example, setting to `HTMLInputElement` will ensure that all returned elements are
 * inputs.
 */
export function useObserveSelector<E extends Element>(
  selector: string,
  elementClass: {new (): E} = Element as {new (): E},
): E[] {
  const cachedValue = useRef<E[]>()

  return useSyncExternalStore(
    onUpdate => {
      const observer = new MutationObserver(() => onUpdate())
      observer.observe(document.body, {subtree: true, childList: true})
      return () => observer.disconnect()
    },
    () => {
      const elements = Array.from(document.querySelectorAll(selector)).filter((e): e is E => e instanceof elementClass)
      if (cachedValue.current && arraysEqual(cachedValue.current, elements)) return cachedValue.current
      return (cachedValue.current = elements)
    },
  )
}
