/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

// Register with react-core before attempting to render
import '../../ssr-entry'

import articlePagePayload from '../fixtures/routes/Article/ArticlePayload'

test('Renders an Article page with SSR', async () => {
  const view = await serverRenderReact({
    name: 'resources',
    path: '/resources/articles/ai/what-is-devops',
    data: {
      payload: articlePagePayload,
    },
  })

  // verify the title of the page
  expect(view).toMatch('What is Devops?')

  // verify the featured CTA
  expect(view).toMatch('GitHub Copilot')

  // verify the article content
  expect(view).toMatch('Adapting the DevOps idea of continuous improvement')

  // verify the heading
  expect(view).toMatch('Is DevOps a methodology or a process')

  // verify the image caption
  expect(view).toMatch('Abstract image of a green circle in an empty void of space.')

  // verify the cards heading
  expect(view).toMatch('More DevOps resources')
})
