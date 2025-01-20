// Emulates submit button submission values by inserting a hidden input to the form.
//
// Submit events can be triggerd in the following ways:
// - User clicks on a submit button.
// - User press Enter when focusing on a form field; also known as "implicit submission".
// - Programmatically via requestSubmit helper.
//
// On GitHub.com, the submission is either handled by the browser or remoteForm.
//
// For submissions triggered by user actions, the name and value of the clicked submit button (also known as
// "the submitter") is passed along in the request, and can be programmatically retrieved with FormData.entries().
//
// However, this value will be lost in the following cases:
// - 1. When the submitter button is disabled, most commonly by [data-disable-with].
// - 2. When submitting via requestSubmit (from form.js), because the submission does not originated from a submitter.
// - 3. When submitting with remoteForm, because FormData(form).entries() does not know about the submitter. In Safari
// the submitter is known during the submission steps, but this behavior is not supported in any other browsers.
//
// @see {@link https://github.com/github/form-data-entries/pull/7}.
//
// For the exact workarounds, refer to ./form.js and ./remote.js.
export function persistSubmitButtonValue(button: HTMLButtonElement | HTMLInputElement) {
  const form = button.closest('form')
  if (!(form instanceof HTMLFormElement)) {
    return
  }

  let input = findPersistedSubmitButtonValue(form)

  if (button.name) {
    const defaultValue = button.matches('input[type=submit]') ? 'Submit' : ''
    const value = button.value || defaultValue
    if (!input) {
      input = document.createElement('input')
      input.type = 'hidden'
      input.classList.add('js-submit-button-value')
      form.prepend(input)
    }
    input.name = button.name
    input.value = value
  } else if (input) {
    input.remove()
  }
}

export function findPersistedSubmitButtonValue(form: HTMLFormElement): HTMLInputElement | null {
  const input = form.querySelector('input.js-submit-button-value')
  return input instanceof HTMLInputElement ? input : null
}
