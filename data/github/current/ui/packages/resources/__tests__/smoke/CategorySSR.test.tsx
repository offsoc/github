/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

// Register with react-core before attempting to render
import '../../ssr-entry'

import categoryPagePayloadJSON from '../fixtures/routes/Category/CategoryPayload.json'

test('Renders a Category page with SSR with pagination', async () => {
  const withTotalPages = {
    ...categoryPagePayloadJSON,
    additionalProps: {
      pageHeading: 'CI/CD',
      page: 1,
      totalPages: 5,
    },
  }

  const view = await serverRenderReact({
    name: 'resources',
    path: '/resources/articles/ai',
    data: {
      payload: JSON.parse(JSON.stringify(withTotalPages)),
    },
  })

  // verify the title of the page
  expect(view).toMatch('CI/CD')

  // verify the featured thumbnail title
  expect(view).toMatch('CI generic Article')

  // verify the thumbnail excerpt
  expect(view).toMatch(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  )

  // verify pagination renders
  expect(view).toMatch('Previous')
})

test('Renders a Category page with SSR without pagination', async () => {
  const view = await serverRenderReact({
    name: 'resources',
    path: '/resources/articles/ai',
    data: {
      payload: JSON.parse(JSON.stringify(categoryPagePayloadJSON)),
    },
  })

  // verify the title of the page
  expect(view).toMatch('CI/CD')

  // verify the featured thumbnail title
  expect(view).toMatch('CI generic Article')

  // verify the thumbnail excerpt
  expect(view).toMatch(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  )
  // verify pagination does not render
  expect(view).not.toMatch('Previous')
})
