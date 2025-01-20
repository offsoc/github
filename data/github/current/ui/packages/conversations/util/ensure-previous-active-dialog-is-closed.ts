export function ensurePreviousActiveDialogIsClosed() {
  const activeDialogElement = document.querySelector('#__primerPortalRoot__ div[role="dialog"]')
  if (activeDialogElement) {
    // This pattern of dispatching an event, on the document.body, to close open dialogs is used in place of a React based state management system.
    // Implementing a state managed system would cause every diffline in the app to re-render.
    // This workaround will use the "Esc" keypress eventListener, that is tied to the active dialog's React Portal, to close the active dialog.
    // This code simply simulates a user typing "Esc" to ensure active dialogs are closed.
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', code: 'Escape', ctrlKey: true}))
  }
}
