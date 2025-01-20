import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {hasInteractions, withActiveElement} from '../has-interactions'

suite('hasInteractions', function () {
  let container: HTMLElement

  setup(async function () {
    const div = await fixture(html`
      <div>
        <div class="container">
          <input type="checkbox" />
          <input type="text" />
          <a href="http://example.com"><span>Test results</span></a>
          <button><span>Expand</span></button>
        </div>
        <p>Unrelated content</p>
      </div>
    `)
    container = div.querySelector('.container')!
  })

  test('no interactions', function () {
    assert.isFalse(hasInteractions(container))
  })

  test('container is focused', function () {
    return withActiveElement(container, function () {
      assert.isTrue(hasInteractions(container))
    })
  })

  test('container focus is ignored', function () {
    return withActiveElement(container, function () {
      assert.isFalse(hasInteractions(container, true))
    })
  })

  test('container has active element', function () {
    const field = container.querySelector('input[type=text]')
    if (!field) {
      throw new Error('field not found')
    }
    field.dispatchEvent(new CustomEvent('mouseup', {bubbles: true}))
    return withActiveElement(field, function () {
      assert.isTrue(hasInteractions(container))
    })
  })

  test('active element outside of container', function () {
    if (!container.nextElementSibling) {
      throw new Error('nextElementSibling not found')
    }
    return withActiveElement(container.nextElementSibling, function () {
      assert.isFalse(hasInteractions(container))
    })
  })

  test('container is active form field', function () {
    const field = container.querySelector('input[type=text]')
    if (!field) {
      throw new Error('field not found')
    }
    return withActiveElement(field, function () {
      assert.isTrue(hasInteractions(field))
    })
  })

  test('container has dirty element', function () {
    const field: HTMLInputElement | null = container.querySelector('input[type=checkbox]')
    if (!field) {
      throw new Error('field not found')
    }
    field.checked = true
    assert.isTrue(hasInteractions(container))
  })

  test('container is marked as dirty', function () {
    container.classList.add('is-dirty')
    assert.isTrue(hasInteractions(container))
  })

  test('container is within an element marked as dirty', function () {
    if (!container.parentElement) {
      throw new Error('parentElement not found')
    }
    container.parentElement.classList.add('is-dirty')
    assert.isTrue(hasInteractions(container))
  })

  test('container has element marked as dirty', function () {
    const input = container.querySelector('input[type=text]')
    if (!input) {
      throw new Error('field not found')
    }
    input.classList.add('is-dirty')
    assert.isTrue(hasInteractions(container))
  })

  test('ignores link given focus by mouse click', function () {
    const button = container.querySelector('a[href] span')
    const link = container.querySelector('a[href]')
    if (!button) {
      throw new Error('button not found')
    }
    if (!link) {
      throw new Error('link not found')
    }
    button.dispatchEvent(new CustomEvent('mouseup', {bubbles: true}))
    return withActiveElement(link, function () {
      assert.isFalse(hasInteractions(container))
    })
  })

  test('ignores button given focus by mouse click', function () {
    const buttonSpan = container.querySelector('button span')
    const button = container.querySelector('button')
    if (!buttonSpan) {
      throw new Error('buttonSpan not found')
    }
    if (!button) {
      throw new Error('button not found')
    }
    buttonSpan.dispatchEvent(new CustomEvent('mouseup', {bubbles: true}))
    return withActiveElement(button, function () {
      assert.isFalse(hasInteractions(container))
    })
  })
})
