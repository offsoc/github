/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

// Register with react-core before attempting to render
import '../../ssr-entry'

test('Renders EnterpriseIndex with SSR', async () => {
  const view = await serverRenderReact({
    name: 'landing-pages',
    path: '/enterprise',
    data: {payload: {}},
  })

  // verify the Hero works
  expect(view).toMatch('The AI-powered')

  // verify the SectionIntro works
  expect(view).toMatch('Scale')
  expect(view).toMatch('The enterprise-ready platform that developers know and love.')

  // verify the River works
  expect(view).toMatch('Consolidate DevSecOps processes and enable unparalleled collaboration.')

  // verify the testimonial works
  expect(view).toMatch('We’ve used GitHub from the inception of Datadog.')

  // verify the Bento works
  expect(view).toMatch('Deliver secure software fast, with enterprise-ready CI/CD using GitHub Actions.')

  // Verify the CTA banner
  expect(view).toMatch('Start your journey with GitHub')
})
