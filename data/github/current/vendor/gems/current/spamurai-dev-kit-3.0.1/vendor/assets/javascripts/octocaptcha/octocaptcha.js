window.addEventListener('load', () => {
  let loaded = false

  const form = document.querySelector('.js-octocaptcha-form')
  if (form === null) return

  const debugOn = form.getAttribute('data-debug') === "true"
  const debug = (...args) => {
    if (debugOn) {
      console.log(...args)
    }
  }

  const spinner = form.querySelector('.js-octocaptcha-spinner')
  const success = form.querySelector('.js-octocaptcha-success')
  const formSubmit = form.querySelector('.js-octocaptcha-form-submit')
  const iframeContainer = form.querySelector('.js-octocaptcha-frame-container')
  const iframe = form.querySelector('.js-octocaptcha-frame')
  const octocaptchaUrl = form.getAttribute('data-octocaptcha-url')
  const tokenField = document.createElement('input')

  debug("spinner", spinner)
  debug("success", success)
  debug("formSubmit", formSubmit)
  debug("iframeContainer", iframeContainer)
  debug("iframe", iframe)
  debug("octocaptchaUrl", octocaptchaUrl)
  debug("tokenField", tokenField)

  // We use d-none and not type=hidden because hidden fields cannot be required.
  tokenField.classList.add('d-none')
  tokenField.name = 'octocaptcha-token'
  tokenField.required = true
  form.appendChild(tokenField)

  const showSpinner = () => {
    spinner.classList.remove('d-none')
    debug('showSpinner')
  }
  // When js is enabled we want to show the spinner immediately.
  // When js is disabled we don't want to display a spinner.
  // We don't load the page with the spinner showing by default because
  // in a js disabled environment we have no way of hiding it after
  // the captcha has loaded.
  showSpinner()

  // When js is enabled we want to disable submit immediately.
  // When js is disabled we don't disable submit.
  formSubmit.disabled = true

  const showSuccess = () => {
    if (loaded) return
    loaded = true
    spinner.classList.add('d-none')
    success.classList.remove('d-none')
    captchaComplete()
    debug('showSuccess')
  }

  const showCaptcha = () => {
    if (loaded) return
    loaded = true
    spinner.classList.add('d-none')
    iframeContainer.classList.remove('v-hidden', 'zero-height')
    debug('showCaptcha')
  }

  const showFailedToLoadSuccess = () => {
    if (loaded) return
    const hiddenInput = document.createElement('input')
    hiddenInput.type = 'hidden'
    hiddenInput.id = 'error_loading_captcha'
    hiddenInput.name = 'error_loading_captcha'
    hiddenInput.value = '1'

    form.appendChild(hiddenInput)
    tokenField.required = false

    showSuccess()
    debug('showFailedToLoadSuccess')
  }

  const captchaComplete = () => {
    if (form.checkValidity()) {
      formSubmit.disabled = false
    }

    window.postMessage({
      event: 'Octocaptcha',
      action: 'success',
    })
    debug('captchaComplete')
  }

  // If captcha fails to load, let the user through
  setTimeout(showFailedToLoadSuccess, 30000)
  iframe.addEventListener('error', showFailedToLoadSuccess)

  window.addEventListener('message', e => {
    if (e.origin !== octocaptchaUrl) {
      if (e.data.event !== 'Octocaptcha') {
        debug("iframe url", e.origin, " does not match exptected url ", octocaptchaUrl)
      }
      return
    }

    const event = e.data && e.data.event

    debug("Post Message sent to window ", event)
    if (event === 'captcha-loaded') {
      showCaptcha()
    } else if (event === 'captcha-complete') {
      tokenField.value = e.data.sessionToken
      captchaComplete()
    } else if (event === 'captcha-suppressed') {
      showSuccess()
    }
  })
})
