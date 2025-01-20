export class DiffSelectionEvent extends Event {
  static readonly NAME = 'diff-line-selection'

  constructor() {
    super(DiffSelectionEvent.NAME, {
      bubbles: false,
      cancelable: true,
    })
  }

  static dispatch() {
    window.dispatchEvent(new DiffSelectionEvent())
  }
}

declare global {
  interface WindowEventMap {
    'diff-line-selection': DiffSelectionEvent
  }
}
