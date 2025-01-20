import {getInsightsUrl, TraceDataKey} from '../index'

test('getInsightsUrl - tracing disabled, no params', async () => {
  const inputUrl = '/_graphql'
  const outputUrl = inputUrl

  expect(getInsightsUrl(inputUrl)).toBe(outputUrl)
})

test('getInsightsUrl - tracing disabled, existing params', async () => {
  const inputUrl = '/_graphql?catalog_service=react-app'
  const outputUrl = inputUrl

  expect(getInsightsUrl(inputUrl)).toBe(outputUrl)
})

test('getInsightsUrl - tracing enabled, no params', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootWindowContent = window as {[key: string]: any}
  rootWindowContent[TraceDataKey] = []

  const inputUrl = '/_graphql'
  const outputUrl = '/_graphql?_tracing=true'

  expect(getInsightsUrl(inputUrl)).toBe(outputUrl)
})

test('getInsightsUrl - tracing enabled, existing params', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootWindowContent = window as {[key: string]: any}
  rootWindowContent[TraceDataKey] = []

  const inputUrl = '/_graphql?catalog_service=react-app'
  const outputUrl = '/_graphql?catalog_service=react-app&_tracing=true'

  expect(getInsightsUrl(inputUrl)).toBe(outputUrl)
})
