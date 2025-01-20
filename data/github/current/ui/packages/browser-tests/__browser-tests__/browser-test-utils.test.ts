import {suite, setup, teardown, test, assert, fixture, html} from '../browser-tests'

suite('Browser Tests Utils', () => {
  let setupCounter = 0
  let teardownCounter = 0

  setup(() => {
    setupCounter++
  })

  teardown(() => {
    teardownCounter++
  })

  test('globals are available', () => {
    assert.isDefined(suite)
    assert.isDefined(setup)
    assert.isDefined(teardown)
    assert.isDefined(test)
    assert.isDefined(fixture)
    assert.isDefined(html)
  })

  test('setup and teardown work', () => {
    assert.equal(setupCounter, 2)
    assert.equal(teardownCounter, 1)
  })
})
