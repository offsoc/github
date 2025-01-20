import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {FgpSearchElement} from '../fgp-search-element'
import {http, HttpResponse} from 'msw'
import {setupWorker} from 'msw/browser'

const MOCK_FGP_METADATA = {
  test: {label: 'Test', description: 'Test Description', category: 'Test Category'},
}

suite('fgp-search-container', () => {
  let container: FgpSearchElement

  setup(async function () {
    const worker = setupWorker(
      http.get('/dummy-src', () => {
        return HttpResponse.json({
          json: MOCK_FGP_METADATA,
          status: 200,
          headers: {
            'Content-type': 'application/json',
          },
        })
      }),
    )
    await worker.start()

    container = await fixture(html`
      <fgp-search data-src="dummy-src">
        <filter-input aria-owns="org-permissions-list">
          <input
            type="text"
            data-target="fgp-search.searchInput"
            data-action="focusin:fgp-search#openSearch blur:fgp-search#closeSearch"
          />
        </filter-input>
        <div
          id="org-permissions-list"
          data-target="fgp-search.resultList"
          data-action="mousedown:fgp-search#keepOpen"
          hidden
        >
          <label>
            <input
              id="checkbox"
              type="checkbox"
              value="test"
              checked
              role="option"
              data-action="change:fgp-search#handleFgpChange"
            />
          </label>
          <div id="empty-state" data-filter-empty-state hidden></div>
        </div>
        <div data-target="fgp-search.emptyState" />
        <ul data-target="fgp-search.fgpSummaryList" hidden></ul>
      </fgp-search>
    `)

    worker.stop()
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, FgpSearchElement)
  })

  test('filter input opens and closes', () => {
    assert.isTrue(container.resultList.hidden)
    container.openSearch()
    assert.isFalse(container.resultList.hidden)
    container.closeSearch()
    assert.isTrue(container.resultList.hidden)
  })
})
