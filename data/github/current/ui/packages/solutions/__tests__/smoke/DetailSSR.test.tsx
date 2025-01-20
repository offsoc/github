/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

// Register with react-core before attempting to render
import '../../ssr-entry'

import detailPayload from '../fixtures/routes/Detail/DetailPayload'

test('Renders an Detail page with SSR', async () => {
  const view = await serverRenderReact({
    name: 'solutions',
    path: '/solutions/use-case/kitchen-sink',
    data: {
      payload: detailPayload,
    },
  })

  // verify the title of the page
  expect(view).toMatch('The complete CI/CD solution')

  // verify intro pillars
  expect(view).toMatch('A single, integrated, enterprise-ready platform')

  // verify logo suite
  expect(view).toMatch('Healthcare Industry partner logos')

  // verify river 1
  expect(view).toMatch('Build fast, stay secure')

  // verify river 2
  expect(view).toMatch('Automate manual tasks')

  // verify river 3
  expect(view).toMatch('Drive healthcare innovation with AI')

  // verify featured bento
  expect(view).toMatch('This is my super-sweet')

  // verify statistics
  expect(view).toMatch('100M+')

  // verify featured customer stories header
  expect(view).toMatch('You&#x27;re in good company')

  // verify featured customer stories cards
  expect(view).toMatch('Buffer goes from siloed to synced for better production releases')

  // verify testimonial
  expect(view).toMatch('Healthcare organizations want a service that provides a world-class')

  // verify CTA banner
  expect(view).toMatch('Get started')

  // verify go further header
  expect(view).toMatch('Go further with these')

  // verify go further cards
  expect(view).toMatch('Build like the best teams on the planet.')

  // verify FAQ
  expect(view).toMatch('Frequently asked questions')
})
