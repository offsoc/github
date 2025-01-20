/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getActionsSurveyProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

describe('Actions Survey with SSR', () => {
  test('renders the Actions Survey banner with Give Feedback button', async () => {
    const props = getActionsSurveyProps()
    const view = await serverRenderReact({
      name: 'actions-survey',
      data: {props},
    })

    expect(view).toMatch('Help us improve GitHub Actions')
    expect(view).toMatch('Give feedback')
  })
})
