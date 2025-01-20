import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {FlywheelReturnToTourElement} from '../flywheel-return-to-tour-element'

suite('flywheel-return-to-tour-element', () => {
  let container: FlywheelReturnToTourElement

  setup(async function () {
    container = await fixture(html`<flywheel-return-to-tour></flywheel-return-to-tour>`)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, FlywheelReturnToTourElement)
  })
})
