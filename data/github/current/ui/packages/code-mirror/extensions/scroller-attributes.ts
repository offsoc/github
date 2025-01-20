import type {Extension} from '@codemirror/state'
import type {EditorView} from '@codemirror/view'
import {ViewPlugin} from '@codemirror/view'

/**
 * Adds role, tabIndex, and aria-labelledby attributes to the scroller DOM element
 * @param ariaLabelledBy The id of the element that the scroller is labelled by
 * @returns Extension
 */
export function scrollerAttributes(ariaLabelledBy: string): Extension {
  const scroller = ViewPlugin.fromClass(
    class {
      constructor(view: EditorView) {
        view.scrollDOM.tabIndex = 0
        view.scrollDOM.setAttribute('role', 'region')
        view.scrollDOM.setAttribute('aria-labelledby', ariaLabelledBy)
      }
    },
  )

  return [scroller]
}
