/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

// Register with react-core before attempting to render
import '../../ssr-entry'

import categoryPagePayload from '../fixtures/routes/Category/CategoryPayload'
test('Renders Solution Category with SSR', async () => {
  const testPayload = categoryPagePayload
  const view = await serverRenderReact({
    name: 'solutions',
    path: '/solutions/industry',
    data: {payload: testPayload},
  })

  // verify the hero label
  expect(view).toMatch('Hero Label')

  // verify the hero title
  expect(view).toMatch('Lorem ipsum dolor sit amet')

  // verify the hero description
  expect(view).toMatch('Line lengths for body text are usually between 60 to 130 characters.')

  // verify the solutions heading
  expect(view).toMatch('Solutions Card Heading')

  // verify the solutions description
  expect(view).toMatch('Solutions Card Description')

  // verify related solutions heading
  expect(view).toMatch('Related Solutions Heading')

  // verify the related solutions description
  expect(view).toMatch('Related Solutions Description')

  // verify the statistic heading
  expect(view).toMatch('$2M+')

  // verify the statistic description
  expect(view).toMatch('given back to our maintainers')

  // verify the CTA banner heading
  expect(view).toMatch('Get started')

  // verify the CTA banner description
  expect(view).toMatch(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sapien sit ullamcorper id. Aliquam luctus sed turpis felis nam pulvinar risus elementum',
  )

  // verify the CTA banner primary button
  expect(view).toMatch('Primary Action')

  // verify the CTA banner secondary button
  expect(view).toMatch('Secondary Action')
})
