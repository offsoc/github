import type {Extension} from '@codemirror/state'
import {type Panel, showPanel} from '@codemirror/view'

/**
 * Creates a help panel extension from an HTMLElement
 * @param panelDom help panel HTMLElement
 * @param position position of the help panel, either 'top' or 'bottom'
 * @returns help panel extension
 */
export function helpPanelConstructor(
  panelDom: HTMLElement | null = null,
  position: 'top' | 'bottom' = 'bottom',
): Extension {
  const panelConstructor = () => {
    return {
      dom: panelDom,
      top: position === 'top',
    } as Panel
  }

  return [showPanel.of(panelConstructor)]
}
