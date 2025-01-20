import {changeValue, isFormField, requestSubmit} from '../form-utils'
import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'

suite('Form helpers', function () {
  let form: HTMLFormElement

  setup(async function () {
    form = await fixture(html`
      <form data-turbo="false">
        <input type="checkbox" name="checkbox">
        <input type="text" name="text">
        <textarea name="textarea"></textarea>
      </div>
    `)
  })

  test('submit allowed', function () {
    let submitFired = false
    form.addEventListener('submit', () => {
      submitFired = true
    })

    let submitInvoked = false
    form.submit = function () {
      submitInvoked = true
    }

    requestSubmit(form)
    assert.isTrue(submitFired)
    assert.isTrue(submitInvoked)
  })

  test('submit prevented', function () {
    let submitFired = false
    form.addEventListener('submit', event => {
      submitFired = true
      event.preventDefault()
    })

    let submitInvoked = false
    form.submit = function () {
      submitInvoked = true
    }

    requestSubmit(form)
    assert.isTrue(submitFired)
    assert.isFalse(submitInvoked)
  })

  test('changeValue text field', function () {
    const field = form.querySelector('input[type=text]') as HTMLInputElement

    let changeTarget
    form.addEventListener('change', event => {
      changeTarget = event.target
    })

    changeValue(field, 'Hello!')
    assert.equal(field.value, 'Hello!')
    assert.strictEqual(changeTarget, field)
  })

  test('changeValue checkbox', function () {
    const field = form.querySelector('input[type=checkbox]') as HTMLInputElement

    let changeTarget
    form.addEventListener('change', event => {
      changeTarget = event.target
    })

    changeValue(field, true)
    assert.isTrue(field.checked)
    assert.strictEqual(changeTarget, field)
  })

  test('changeValue textarea', function () {
    const field = form.querySelector('textarea') as HTMLTextAreaElement

    let changeTarget
    form.addEventListener('change', event => {
      changeTarget = event.target
    })

    changeValue(field, 'Hello!')
    assert.equal(field.value, 'Hello!')
    assert.strictEqual(changeTarget, field)
  })
})

suite('isFormField helper', function () {
  test('DIV element is not form interaction', function () {
    const el = document.createElement('div')
    assert.isFalse(isFormField(el))
  })

  test('INPUT field is form interaction', function () {
    const el = document.createElement('input')
    assert.isTrue(isFormField(el))
  })

  test('INPUT[type=text] field is form interaction', function () {
    const el = document.createElement('input')
    el.type = 'text'
    assert.isTrue(isFormField(el))
  })

  test('INPUT[type=search] field is form interaction', function () {
    const el = document.createElement('input')
    el.type = 'search'
    assert.isTrue(isFormField(el))
  })

  test('INPUT[type=submit] button is not form interaction', function () {
    const el = document.createElement('input')
    el.type = 'submit'
    assert.isFalse(isFormField(el))
  })

  test('INPUT[type=reset] button is not form interaction', function () {
    const el = document.createElement('input')
    el.type = 'reset'
    assert.isFalse(isFormField(el))
  })

  test('BUTTON is not form interaction', function () {
    const el = document.createElement('button')
    assert.isFalse(isFormField(el))
  })

  test('TEXTAREA is form interaction', function () {
    const el = document.createElement('textarea')
    assert.isTrue(isFormField(el))
  })

  test('SELECT box is form interaction', function () {
    const el = document.createElement('select')
    assert.isTrue(isFormField(el))
  })
})
