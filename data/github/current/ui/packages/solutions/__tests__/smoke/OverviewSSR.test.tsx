/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

// Register with react-core before attempting to render
import '../../ssr-entry'

import overviewPagePayload from '../fixtures/routes/Overview/OverviewPayload'
test('Renders Solution Category with SSR', async () => {
  const testPayload = overviewPagePayload
  const view = await serverRenderReact({
    name: 'solutions',
    path: '/solutions',
    data: {payload: testPayload},
  })

  // verify the hero label
  expect(view).toMatch('Solutions Overview Label')

  // verify the hero title
  expect(view).toMatch('Solutions Hero Heading')

  // verify the hero description
  expect(view).toMatch('Line lengths for body text are usually between 60 to 130 characters.')

  // verify the hero primary CTA
  expect(view).toMatch('Solutions Overview Primary CTA')

  // verify the hero secondary CTA
  expect(view).toMatch('Solutions Overview Secondary CTA')

  // verify the solutions company size heading
  expect(view).toMatch('Solutions overview company size section intro heading')

  // verify the solutions company size card
  expect(view).toMatch('Non-profits')

  // Verify the solutions bento heading
  expect(view).toMatch('The enterprise-ready platform that developers know and love.')

  // Verify the solutions bento heading CTA
  expect(view).toMatch('Read customer story')

  // verify the solutions indusrty section heading
  expect(view).toMatch('Solutions overview industry section intro')

  // verify the solutions use-case section heading
  expect(view).toMatch('Solutions overview use case intro')

  // verify the solutions related solution heading
  expect(view).toMatch('Adopted by the world&#x27;s leading organizations')

  // verify the solutions related solution card
  expect(view).toMatch('Shopify keeps pushing eCommerce forward with help from GitHub tools.')

  // verify the CTA banner heading
  expect(view).toMatch('Solutions overview get started')

  // verify the CTA banner description
  expect(view).toMatch('Solutions overview CTA banner description')

  // verify the CTA banner primary button
  expect(view).toMatch('Primary action')

  // verify the CTA banner secondary button
  expect(view).toMatch('Secondary')
})
