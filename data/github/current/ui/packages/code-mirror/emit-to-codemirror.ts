import type {CustomEventName, CustomEventDetail} from './types/custom-events'

export function emitToCodeMirror(event: CustomEventName, editorTarget: Element, detail: CustomEventDetail) {
  if (!editorTarget) return

  // codemirror 6 watches for events on its content element, not the root editor element
  const innerEditorTarget = editorTarget.className.includes('cm-content')
    ? editorTarget
    : editorTarget.querySelector<HTMLDivElement>('.cm-content')

  if (!innerEditorTarget) return

  innerEditorTarget.dispatchEvent(new CustomEvent(event, {detail}))
}
