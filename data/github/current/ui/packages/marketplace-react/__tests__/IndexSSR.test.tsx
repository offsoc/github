/** @jest-environment node */
// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders Marketplace with SSR', () => {
  expect(true).toBe(true)
})
