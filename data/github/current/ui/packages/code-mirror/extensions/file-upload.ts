import type {Extension} from '@codemirror/state'
import {EditorView} from '@codemirror/view'
import {findAndReplace, insertAtCursor, replaceSelection, somethingSelected} from '../utils'
import type {UploadChangeDetail, UploadCursorChangeDetail, UploadEvents} from '../types/custom-events'

const handleUploadChange = (event: Event, view: EditorView) => {
  const customEvent = event as CustomEvent<UploadChangeDetail>
  const {state, placeholder, replacementText} = customEvent.detail

  if (state === 'uploading') {
    if (somethingSelected(view)) {
      replaceSelection(view, placeholder)
    } else {
      insertAtCursor(view, replacementText)
    }
  } else if (state === 'uploaded' || state === 'failed') {
    findAndReplace(view, placeholder, replacementText)
  }
}

// positions the cursor where the user expects the file upload to be insert
const handleCursorChange = (event: Event, view: EditorView) => {
  const customEvent = event as CustomEvent<UploadCursorChangeDetail>
  const {left, top} = customEvent.detail
  const dropPos = view.posAtCoords({x: left, y: top})

  if (!dropPos) return

  view.dispatch({selection: {anchor: dropPos, head: dropPos}})
}

type EventHandlers = {
  [key in UploadEvents]: (event: Event, view: EditorView) => void
}

export function fileUploadListener(): Extension {
  const eventHandlers: EventHandlers = {
    'upload:editor:change': handleUploadChange,
    'upload:editor:cursor': handleCursorChange,
  }

  return [EditorView.domEventHandlers(eventHandlers)]
}
