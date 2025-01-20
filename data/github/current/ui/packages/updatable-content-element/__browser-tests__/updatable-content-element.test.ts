import {assert, fixture, html, suite, test, waitUntil, spread} from '@github-ui/browser-tests'
import {http, HttpResponse} from 'msw'
import {setupWorker} from 'msw/browser'

import {UpdatableContentElement} from '../updatable-content-element'

const worker = setupWorker(
  http.get('/test-endpoint', () => {
    // eslint-disable-next-line github/unescaped-html-literal
    return new HttpResponse(`<div class="result">foo</div>`, {headers: {'Content-Type': 'text/html'}})
  }),
)

suite('updatable-content-element', () => {
  let container: HTMLElement
  let component: UpdatableContentElement

  interface ComponentFixtureProps {
    url?: string | null
    gid?: string | null
  }

  type Html = ReturnType<typeof html>

  const componentTemplate = ({url = '/test-endpoint', gid}: ComponentFixtureProps, child?: Html) =>
    html`<updatable-content ${spread({'data-url': url, 'data-gid': gid})}>${child}</updatable-content>`

  async function setupFixture(props?: ComponentFixtureProps, child?: Html) {
    container = await fixture(html`<div id="container">${componentTemplate(props || {}, child)}</div>`)
    component = container.querySelector('updatable-content') as UpdatableContentElement
    if (!component) {
      throw new Error('Could not find updatable-content element')
    }
  }

  suiteSetup(async function () {
    await worker.start()
  })

  suiteTeardown(function () {
    worker.stop()
  })

  teardown(function () {
    worker.resetHandlers()
  })

  test('isConnected', async () => {
    await setupFixture()

    assert.isTrue(component.isConnected)
    assert.instanceOf(component, UpdatableContentElement)
  })

  test('updates target without gid', async function () {
    await setupFixture()

    component.dispatchEvent(new CustomEvent('socket:message', {detail: {name: 'c:1', data: {}}}))

    await waitUntil(
      () => container.querySelector('.result')?.textContent === 'foo',
      'Expected to find `.result` element with text "foo"',
    )
  })

  test('updates target with gid', async function () {
    await setupFixture({gid: 'foobar'})

    component.dispatchEvent(new CustomEvent('socket:message', {detail: {name: 'c:1', data: {gid: 'foobar'}}}))

    await waitUntil(
      () => container.querySelector('.result')?.textContent === 'foo',
      'Expected to find `.result` element with text "foo"',
    )
  })

  test('updates target with gid on child', async function () {
    await setupFixture({url: undefined}, html`<div data-gid="foobar" data-url="/test-endpoint"></div>`)

    component.dispatchEvent(new CustomEvent('socket:message', {detail: {name: 'c:1', data: {gid: 'foobar'}}}))

    await waitUntil(
      () => component.querySelector('.result')?.textContent === 'foo',
      'Expected to find `.result` element with text "foo"',
    )
  })

  test('updates target with gid on child inside child with gid, but no data-url', async function () {
    await setupFixture(
      {url: null},
      html`<div data-gid="foobar"><div data-gid="foobar" data-url="/test-endpoint"></div></div>`,
    )
    component.dispatchEvent(new CustomEvent('socket:message', {detail: {name: 'c:1', data: {gid: 'foobar'}}}))

    await waitUntil(
      () => component.querySelector('div[data-gid="foobar"] > .result')?.textContent === 'foo',
      'Expected to find `.result` element with text "foo"',
    )
  })

  test('updates target with gid on child and retains focus', async function () {
    await setupFixture(
      {url: null},
      html`<button data-gid="foobar" data-retain-focus data-url="/test-endpoint-button"></button>`,
    )

    worker.use(
      http.get('/test-endpoint-button', () => {
        // eslint-disable-next-line github/unescaped-html-literal
        return new HttpResponse('<button class="result">foo</button>', {headers: {'Content-Type': 'text/html'}})
      }),
    )

    const button = container.querySelector('button')
    if (!button) {
      throw new Error('Could not find button')
    }

    button.focus()

    component.dispatchEvent(new CustomEvent('socket:message', {detail: {name: 'c:1', data: {gid: 'foobar'}}}))

    await waitUntil(
      () => container.querySelector('.result')?.textContent === 'foo',
      'Expected to find `.result` element with text "foo"',
    )
    assert.equal(document.activeElement, document.querySelector('.result'), 'Expected `button.result` to retain focus')
  })

  test('does not throw when passed nonexistent gid', async function () {
    await setupFixture()

    assert.doesNotThrow(() => {
      component.dispatchEvent(new CustomEvent('socket:message', {detail: {name: 'c:1', data: {gid: 'foobar'}}}))
    })
  })

  test('updates target with gid and retain opened details', async function () {
    await setupFixture(
      {url: null},
      html`
        <details id="details" data-url="/test-endpoint-details" data-gid="foobar" open>
          <details id="foo"></details>
          <details id="bar" open></details>
        </details>
      `,
    )
    const response = `
      <details id="details" data-url="/test-endpoint-details" data-gid="foobar">
        <details id="foo">foo</details>
        <details id="bar">bar</details>
      </details>
    `
    worker.use(
      http.get('/test-endpoint-details', () => {
        return new HttpResponse(response, {headers: {'Content-Type': 'text/html'}})
      }),
    )

    component.dispatchEvent(new CustomEvent('socket:message', {detail: {name: 'c:1', data: {gid: 'foobar'}}}))

    await waitUntil(
      () => container.querySelector('#foo')?.textContent === 'foo',
      'Expected to find `#foo` element with text "foo"',
    )
    assert.equal((container.querySelector('#details') as HTMLDetailsElement).open, true, '#details should be open')
    assert.equal((container.querySelector('#foo') as HTMLDetailsElement).open, false, '#foo should be closed')
    assert.equal((container.querySelector('#bar') as HTMLDetailsElement).open, true, '#bar should be open')
  })
})
