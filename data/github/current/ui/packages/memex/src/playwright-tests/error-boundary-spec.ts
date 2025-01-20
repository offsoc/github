import {test} from './fixtures/test-extended'

test.describe('Error Boundary', () => {
  test.describe('Error boundary rendering', () => {
    test(' displays error message and cta', async ({memex}) => {
      await memex.navigateToStory('integrationTestErrorBoundary', {testIdToAwait: 'project-error-fallback'})
    })
  })
})
