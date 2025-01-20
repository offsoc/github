import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import ContentExclusionFormApp from '../ContentExclusionForm'

async function waitForCodeMirror(cb: () => void) {
  cb()
  await screen.findByTestId('codemirror-editor')
}

jest.mock('../../hooks/use-fetchers', () => ({
  useCopilotContentExclusionMutation: jest.fn(() => [jest.fn(), false]),
}))

test('renders the ContentExclusion form', async () => {
  await waitForCodeMirror(() =>
    render(
      <ContentExclusionFormApp
        initialPayload={{
          updateEndpoint: '/update',
        }}
      />,
    ),
  )

  expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('Content exclusion')
  expect(screen.getByRole('button', {name: 'Save changes'})).toBeInTheDocument()
})

test('uses the correct endpoint when saving', async () => {
  await waitForCodeMirror(() =>
    render(
      <ContentExclusionFormApp
        initialPayload={{
          updateEndpoint: '/update-test-ep',
        }}
      />,
    ),
  )

  const useCopilotContentExclusionMutation =
    jest.requireMock('../../hooks/use-fetchers').useCopilotContentExclusionMutation
  expect(useCopilotContentExclusionMutation).toHaveBeenCalledWith('/update-test-ep', 'PUT')
})
