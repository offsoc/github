import {assert, fixture, html} from '@github-ui/browser-tests'
import visible from '../visible'

suite('github/visible', function () {
  setup(function () {
    fixture(html`
      <div class="js-test js-hidden" style="display:none;"></div>
      <div class="js-test js-hidden" style="display:none;"></div>
      <div class="js-test js-visible"></div>
    `)
  })

  test('finds only visible elements', function () {
    assert.equal(1, Array.from(document.querySelectorAll<HTMLElement>('.js-test')).filter(visible).length)
  })

  test('can be used as a visible predicate', function () {
    const selector = document.querySelector<HTMLElement>('.js-visible')

    assert.isNotNull(selector)
    assert.isOk(visible(selector))
  })

  test('can be used as a hidden predicate', function () {
    const selector = document.querySelector<HTMLElement>('.js-hidden')

    assert.isNotNull(selector)
    assert.isOk(!visible(selector))
  })
})
