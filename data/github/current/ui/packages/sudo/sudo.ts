import {dialog} from '@github-ui/details-dialog'
import {fetchSafeDocumentFragment} from '@github-ui/fetch-utils'
import type {Kicker} from '@github/remote-form'
import {remoteForm} from '@github/remote-form'
import {webauthnSupportLevel} from '@github-ui/webauthn-support-level'

let sudoPromptExist = false

/**
 * Take a URL and add webauthn params to it.
 *
 * @param {string} oldURL - The old URL.
 * @returns {string} - The new URL with added params.
 */
function urlWithParams(oldURL: string): string {
  const newURL = new URL(oldURL, window.location.origin)
  const params = new URLSearchParams(newURL.search.slice(1))
  params.set('webauthn-support', webauthnSupportLevel())
  newURL.search = params.toString()
  return newURL.toString()
}

async function loadPromptTemplate(): Promise<HTMLTemplateElement> {
  const link = document.querySelector<HTMLLinkElement>('link[rel=sudo-modal]')!
  const template = document.querySelector('.js-sudo-prompt')
  if (template instanceof HTMLTemplateElement) {
    return template
  } else if (link) {
    const fragment = await fetchSafeDocumentFragment(document, urlWithParams(link.href))
    document.body.appendChild(fragment)
    return document.querySelector<HTMLTemplateElement>('.js-sudo-prompt')!
  } else {
    throw new Error("couldn't load sudo prompt")
  }
}

let succeeded = false

/**
 * Provide a sudo prompt, and return when it has been filled in or dismissed.
 *
 * @returns {Promise<boolean>} - Resolves to `true` if the user successfully authed with sudo.
 */
export async function sudoPrompt(currentTarget?: HTMLElement): Promise<boolean> {
  if (sudoPromptExist) return false
  sudoPromptExist = true
  succeeded = false
  const template = await loadPromptTemplate()
  const content = template.content.cloneNode(true)
  const prompt = await dialog({content})

  // open/expanded HTML5 <details> can potentially steal focus from the dialog (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details)
  // Example bug: https://github.com/github/authentication/issues/2208
  // close the open details element that triggered this sudo challenge
  const details = currentTarget?.closest('details[open]') as HTMLElement
  if (details) {
    details.removeAttribute('open')
  }

  await new Promise<void>(resolve => {
    prompt.addEventListener(
      'dialog:remove',
      function () {
        // re-add the open attribute to the details that we closed above
        if (details) {
          details.setAttribute('open', 'open')
        }
        sudoPromptExist = false
        resolve()
      },
      {once: true},
    )
  })
  return succeeded
}

async function sudoModalErrorOrClose(
  form: HTMLFormElement,
  wants: Kicker,
  unauthorizedError = 'Sudo authentication failed.',
  tooManyError = 'Too many authentication attempts. Please try again later.',
  errorSelector = '.js-sudo-error',
  inputElementSelector?: string,
) {
  try {
    await wants.text()
  } catch (error) {
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    if (!error.response) throw error
    let errorMessage
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    switch (error.response.status) {
      case 401:
        errorMessage = unauthorizedError
        break
      case 429:
        errorMessage = tooManyError
        break
      default:
        errorMessage = 'An unknown error occurred. Please try again later.'
    }

    form.querySelector<HTMLElement>(errorSelector)!.textContent = errorMessage
    form.querySelector<HTMLElement>(errorSelector)!.hidden = false
    if (inputElementSelector) {
      form.querySelector<HTMLInputElement>(inputElementSelector)!.value = ''
    }

    // rethrow error if not expected, only after surfacing it in flash
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    if (error.response.status !== 401 && error.response.status !== 429) {
      throw error
    }

    return
  }
  succeeded = true
  form.closest<HTMLElement>('details')!.removeAttribute('open')
}

remoteForm('.js-sudo-webauthn-form', async function (form, wants) {
  await sudoModalErrorOrClose(form, wants)
})

remoteForm('.js-sudo-github-mobile-form', async function (form, wants) {
  await sudoModalErrorOrClose(form, wants)
})

remoteForm('.js-sudo-totp-form', async function (form, wants) {
  await sudoModalErrorOrClose(form, wants, undefined, undefined, '.flash-error', '#totp')
})

remoteForm('.js-sudo-password-form', async function (form, wants) {
  await sudoModalErrorOrClose(
    form,
    wants,
    'Incorrect password.',
    'Too many password attempts. Please wait and try again.',
    undefined,
    '.js-sudo-password',
  )
})

/**
 * Check if user is in sudo mode. If not, show a sudo prompt.
 *
 * @returns {Promise<boolean>} - Will be `true` if user is in or got in sudo mode after prompt.
 */
export default async function triggerSudoPrompt(currentTarget?: HTMLElement): Promise<boolean> {
  const response = await fetch('/sessions/in_sudo', {
    headers: {accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest'},
  })
  if (response.ok) {
    const sudoResponse = await response.text()
    if (sudoResponse === 'true') {
      return true
    }
  }
  return sudoPrompt(currentTarget)
}

export async function fetchSessionInSudo(): Promise<boolean> {
  const response = await fetch('/sessions/in_sudo', {
    headers: {accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest'},
  })
  if (response.ok) {
    const sudoResponse = await response.text()
    if (sudoResponse === 'true') {
      return true
    }
  }
  return false
}
