import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {SecurityAnalysisGhasElement} from '../security-analysis-ghas-element'

suite('security-analysis-ghas-element', () => {
  let container: SecurityAnalysisGhasElement

  setup(async function () {
    container = await fixture(
      html` <security-analysis-ghas>
        <input id="enabled_box" type="checkbox" />
        <input id="disabled_box" type="checkbox" data-action="click:security-analysis-ghas#checkDisabledCheckbox" />
      </security-analysis-ghas>`,
    )
  })

  test('cannot check disabled checkboxes', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, SecurityAnalysisGhasElement)

    const disabledBox = <HTMLInputElement>container.querySelector('#disabled_box')
    const enabledBox = <HTMLInputElement>container.querySelector('#enabled_box')
    assert.isNotNull(disabledBox)
    assert.isNotNull(enabledBox)

    assert.isFalse(disabledBox.checked)
    assert.isFalse(enabledBox.checked)

    disabledBox.click()
    assert.isFalse(disabledBox.checked)

    // but can click regular checkboxes
    enabledBox.click()
    assert.isTrue(enabledBox.checked)
  })
})
