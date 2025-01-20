/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

import payload from '../fixtures/routes/about/diversity/payload'

// Register with react-core before attempting to render
import '../../ssr-entry'

test('Renders DiversityIndex with SSR', async () => {
  const view = await serverRenderReact({
    name: 'landing-pages',
    path: '/about/diversity',
    data: {payload},
  })

  // verify the Hero works
  expect(view).toMatch('Global diversity, inclusion, and belonging at GitHub')

  // verify the River works
  expect(view).toMatch('Platform')
  expect(view).toMatch(
    'Our goal is to speed up human progress by enabling developers to collaborate regardless of their skills or experience. We prioritize global accessibility through localization, outreach, community building, compliance.',
  )

  // verify the gradient text block
  expect(view).toMatch(
    'Software development should be accessible, inclusive, and sustainable, so that developers around the world learn, contribute, grow, and feel like they belong.',
  )

  // verify the features lists
  expect(view).toMatch('Apply data to our hiring process')
  expect(view).toMatch(
    'We set and track ambitious hiring, retention, and promotional goals for underrepresented communities.',
  )

  // Verify the CTA banner
  expect(view).toMatch('Join us on our path to diversity, inclusion, and belonging for all')
})
