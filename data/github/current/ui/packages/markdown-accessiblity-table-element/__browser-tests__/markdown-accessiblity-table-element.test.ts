import {assert, fixture, html, suite, test, waitUntil} from '@github-ui/browser-tests'
import {MarkdownAccessiblityTableElement} from '../markdown-accessiblity-table-element'

suite('markdown-accessiblity-table-element', () => {
  let container

  test('isConnected', async () => {
    container = await fixture(html`<markdown-accessiblity-table></markdown-accessiblity-table>`)
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, MarkdownAccessiblityTableElement)
  })

  test('component does not make unoverflowed tables tabbable', async () => {
    const nestedTable = html`<table id="nested-table">
      <tr>
        <td>foo</td>
      </tr>
    </table>`
    const parentTable = html`<table id="parent-table">
      <tr>
        <td>${nestedTable}</td>
      </tr>
    </table>`

    container = await fixture(html`<markdown-accessiblity-table> ${parentTable} </markdown-accessiblity-table>`)
    const parent = container.querySelector('#parent-table')
    const nested = container.querySelector('#nested-table')
    assert.isNull(parent?.getAttribute('tabindex'))
    assert.isNull(nested?.getAttribute('tabindex'))
  })

  test('component should not overwrite previously set tabindex', async () => {
    container = await fixture(
      html`<markdown-accessiblity-table>
        <table id="table" tabindex="-1">
          <tr>
            <td>foo</td>
          </tr>
        </table>
      </markdown-accessiblity-table>`,
    )
    const parent = container.querySelector('#table')
    assert.equal(parent?.getAttribute('tabindex'), '-1')
  })

  test('component makes overflowing tables tabbable', async () => {
    const overflowStyle = html`<style>
      #parent-table {
        width: 500px; /* Ensure this width causes overflow */
      }
      div {
        display: block;
        width: 300px; /* Smaller than the table to cause overflow */
        max-width: 300px;
        overflow: auto; /* Allows scrolling */
      }
    </style>`

    const headers = Array.from(new Array(40)).map(() => html`<th>foo</th>`)
    const rows = Array.from(new Array(40)).map(() => html`<td>foo</td>`)

    const nestedTable = html`<table id="nested-table">
      <tbody>
        <tr>
          ${rows}
        </tr>
      </tbody>
    </table>`

    const parentTable = html`<table id="parent-table">
      <thead>
        <tr>
          ${headers}
        </tr>
      </thead>
      <tbody>
        <tr>
          ${rows}
        </tr>
        <tr>
          <td>${nestedTable}</td>
        </tr>
      </tbody>
    </table>`

    container = await fixture<HTMLElement>(
      html`<div>${overflowStyle}<markdown-accessiblity-table> ${parentTable} </markdown-accessiblity-table></div>`,
    )

    const parent = container.querySelector('#parent-table')
    const nested = container.querySelector('#nested-table')

    // mock client overflow
    Object.defineProperty(parent, 'clientWidth', {
      value: 300,
      writable: true, // Allows the property to be rewritten in future, if needed
    })

    container.style.width = '501px'

    await waitUntil(() => parent?.getAttribute('tabindex') === '0', 'tab index not applied correctly')
    assert.equal(parent?.getAttribute('tabindex'), '0')
    // should not apply to nested tables
    assert.isNull(nested?.getAttribute('tabindex'))
  })
})
