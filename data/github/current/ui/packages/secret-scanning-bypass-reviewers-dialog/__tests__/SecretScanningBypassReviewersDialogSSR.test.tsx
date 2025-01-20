/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getSecretScanningBypassReviewersDialogProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

it('Renders secret-scanning-bypass-reviewers-dialog partial with SSR', async () => {
  const props = getSecretScanningBypassReviewersDialogProps()

  const view = await serverRenderReact({
    name: 'secret-scanning-bypass-reviewers-dialog',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch('Add role or team')
})
