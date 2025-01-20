import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {OrgRoleRowElement} from '../org-role-row-element'

suite('org-role-row-element', () => {
  let container: OrgRoleRowElement

  setup(async function () {
    container = await fixture(html`
      <org-role-row>
        <button
          id="showButton"
          data-action="click:org-role-row#showDetails"
          data-target="org-role-row.showDetailsButton"
        />
        <button
          id="hideButton"
          hidden
          data-action="click:org-role-row#hideDetails"
          data-target="org-role-row.hideDetailsButton"
        />
        <div id="permissionDetails" hidden data-target="org-role-row.permissionDetails" />
      </org-role-row>
    `)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, OrgRoleRowElement)
  })

  test('toggle visibility', () => {
    const showDetailsButton = <HTMLButtonElement>container.querySelector('#showButton')
    const hideDetailsButton = <HTMLButtonElement>container.querySelector('#hideButton')
    const permissionDetails = <HTMLElement>container.querySelector('#permissionDetails')

    // Assert state before clicking
    assert.isFalse(showDetailsButton.hidden)
    assert.isTrue(hideDetailsButton.hidden)
    assert.isTrue(permissionDetails.hidden)

    showDetailsButton.click()

    // After click, hide button and details section is visible
    assert.isTrue(showDetailsButton.hidden)
    assert.isFalse(hideDetailsButton.hidden)
    assert.isFalse(permissionDetails.hidden)

    // Clicking hide button resets to starting state
    hideDetailsButton.click()
    assert.isFalse(showDetailsButton.hidden)
    assert.isTrue(hideDetailsButton.hidden)
    assert.isTrue(permissionDetails.hidden)
  })
})
