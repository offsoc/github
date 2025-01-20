import {clear, focus, refocus} from '../input-navigation-behavior'
import {assert, fixture, html} from '@github-ui/browser-tests'

suite('Navigation Behavior', function () {
  let container: HTMLElement

  setup(async function () {
    container = await fixture(html`
      <ul class="js-navigation-container">
        <li class="js-navigation-item">One</li>
        <li class="js-navigation-item">Two</li>
        <li class="js-navigation-item">Three</li>
      </ul>
    `)
  })

  test('focus activates container', function () {
    assert.isOk(!container.classList.contains('js-active-navigation-container'))
    focus(container, container)
    assert.isOk(container.classList.contains('js-active-navigation-container'))
  })

  test('focus adds attribute to first item', function () {
    assert.isOk(!container.querySelector('.navigation-focus'))
    focus(container, container)
    assert.isOk(container.querySelector('.navigation-focus'))
  })

  test('clear current focus', function () {
    focus(container, container)
    assert.isOk(container.querySelector('.navigation-focus'))
    clear(container)
    assert.isOk(!container.querySelector('.navigation-focus'))
  })

  test('refocus adds class to first item', function () {
    assert.isOk(!container.querySelector('.navigation-focus'))
    refocus(container, container)
    assert.isOk(container.querySelector('.navigation-focus'))
  })

  test('focus empty container', function () {
    container.textContent = ''
    assert.isOk(!container.classList.contains('js-active-navigation-container'))
    focus(container, container)
    assert.isOk(container.classList.contains('js-active-navigation-container'))
  })

  test('focus fires navigation:focus event', function () {
    let focused = false
    container.addEventListener('navigation:focus', () => (focused = true), {once: true})
    focus(container, container)
    assert.isOk(focused)
  })

  test('canceling focus event prevents class from being added', function () {
    assert.isOk(!container.querySelector('.navigation-focus'))
    container.addEventListener('navigation:focus', event => event.preventDefault(), {once: true})
    focus(container, container)
    assert.isOk(!container.querySelector('.navigation-focus'))
  })
})
