/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getCodespacesSurveyProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

describe('Codespaces Survey with SSR', () => {
  test('renders the Codespaces Survey banner with Give Feedback button', async () => {
    const props = getCodespacesSurveyProps()
    const view = await serverRenderReact({
      name: 'codespaces-survey',
      data: {props},
    })

    expect(view).toMatch('Help us improve GitHub Codespaces')
    expect(view).toMatch('Give feedback')
  })
})
