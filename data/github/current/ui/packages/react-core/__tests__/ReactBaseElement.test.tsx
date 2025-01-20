import '../test-utils/ReactTestElement'
import {render, screen} from '@testing-library/react'
import reactDomClient from 'react-dom/client'
import {EXPECTED_ERRORS} from '../expected-errors'

let consoleError: Console['error']

jest.spyOn(reactDomClient, 'createRoot')
jest.spyOn(reactDomClient, 'hydrateRoot')

const SSR_CONTENT = 'SSR Content'

describe('ReactBaseElement', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation()
    // eslint-disable-next-line no-console
    consoleError = console.error
  })

  it('renders', async () => {
    const data = {foo: 'bar'}
    await renderReactElement({data, ssr: false})
    expect(reactDomClient.createRoot).toHaveBeenCalled()
    expect(screen.queryByText(SSR_CONTENT)).not.toBeInTheDocument()
  })

  it('renders ssr', async () => {
    const data = {foo: 'SSR'}
    await renderReactElement({data})
    expect(reactDomClient.hydrateRoot).toHaveBeenCalled()
    expect(screen.getByText(SSR_CONTENT)).toBeInTheDocument()
  })

  describe('SSR error logging', () => {
    it('logs ssr error', async () => {
      const error = {
        type: 'TestError',
        value: 'Some error',
        stacktrace: [
          {function: 'testFunc', filename: '/test/filename.js', lineno: '111', colno: '33'},
          {function: '<unknown>', filename: '/test/unknown.js', lineno: '333', colno: '11'},
        ],
      }
      const stacktrace = `
  at testFunc (/test/filename.js:111:33)
  at <unknown> (/test/unknown.js:333:11)`

      await renderReactElement({error: JSON.stringify(error)})

      expect(consoleError).toHaveBeenCalledWith('Error During Alloy SSR:', 'TestError: Some error\n', error, stacktrace)
    })

    it('handles missing stacktrace', async () => {
      const error = {
        type: 'TestError',
        value: 'Some error',
      }

      await renderReactElement({error: JSON.stringify(error)})

      expect(consoleError).toHaveBeenCalledWith('Error During Alloy SSR:', 'TestError: Some error\n', error, '')
    })

    it('logs ssr error with an invalid error type', async () => {
      const error = 'invalid error'

      await renderReactElement({error})

      expect(consoleError).toHaveBeenCalledWith('Error During Alloy SSR:', 'invalid error', 'unable to parse as json')
    })

    for (const error of Object.keys(EXPECTED_ERRORS)) {
      it(`logs custom message for expected error: ${error}`, async () => {
        await renderReactElement({error})

        expect(consoleError).toHaveBeenCalledWith('SSR failed with an expected error:', EXPECTED_ERRORS[error])
      })
    }
  })
})

interface RenderReactElementOptions {
  error?: string
  data?: Record<string, unknown>
  ssr?: boolean
}

async function renderReactElement({error, data = {}, ssr = true}: RenderReactElementOptions) {
  return await render(
    <react-test app-name="test-app" initial-path="/test-path" style={{minHeight: 'calc(100vh - 62px)'}} data-ssr={ssr}>
      {error && (
        <script type="application/json" data-target="react-test.ssrError">
          {error}
        </script>
      )}
      <script type="application/json" data-target="react-test.embeddedData">
        {JSON.stringify(data)}
      </script>
      <div data-target="react-test.reactRoot" style={{minHeight: '100%'}}>
        {ssr && SSR_CONTENT}
      </div>
    </react-test>,
  )
}
