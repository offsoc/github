import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {INIT_EVENT, END_EVENT} from '@github-ui/copilot-summary-banner/constants'
import {CopilotMarkdownToolbarButton} from '../CopilotMarkdownToolbarButton'
import {getCopilotMarkdownToolbarButtonProps} from '../test-utils/mock-data'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {verifiedFetch} from '@github-ui/verified-fetch'

jest.mock('@github-ui/verified-fetch')
const mockedVerifiedFetch = jest.mocked(verifiedFetch)

const resp = Promise.resolve({ok: true} as Response)
mockedVerifiedFetch.mockReturnValue(resp)

jest.mock('@github-ui/feature-flags')

test('Renders the component', () => {
  const props = getCopilotMarkdownToolbarButtonProps()
  render(
    <>
      <div className="js-previewable-comment-form">
        <button id={props.anchorId}>Copilot actions</button>
        <textarea className="js-comment-field" />
        <CopilotMarkdownToolbarButton {...props} />
      </div>
    </>,
  )

  expect(screen.getByTestId('copilot-md-actions')).toBeInTheDocument()
})

test('Renders both the PR summary action and the RAI message ActionList items', async () => {
  const props = getCopilotMarkdownToolbarButtonProps()
  const {user} = render(
    <>
      <form>
        <div className="js-previewable-comment-form">
          <button id={props.anchorId} type="button">
            Copilot actions
          </button>
          <textarea className="js-comment-field" />
          <CopilotMarkdownToolbarButton {...props} />
        </div>
      </form>
    </>,
  )

  const copilotButton = await screen.findByText('Copilot actions')

  await user.click(copilotButton)

  expect(screen.getByTestId('copilot-pr-summary-btn')).toBeVisible()
  expect(screen.getByTestId('copilot-pr-summary-rai-ux')).toBeVisible()
})

test('Renders both the "Summary" and "Outline" action items when the split actions feature flag is enabled', async () => {
  const props = getCopilotMarkdownToolbarButtonProps()

  ;(isFeatureEnabled as jest.Mock).mockImplementation(name => name === 'copilot_split_actions_enabled')

  const {user} = render(
    <>
      <form>
        <div className="js-previewable-comment-form">
          <button id={props.anchorId} type="button">
            Copilot actions
          </button>
          <textarea className="js-comment-field" />
          <CopilotMarkdownToolbarButton {...props} />
        </div>
      </form>
    </>,
  )

  const copilotButton = await screen.findByText('Copilot actions')

  await user.click(copilotButton)

  expect(screen.getByTestId('copilot-pr-summary-btn')).toBeVisible()
  expect(screen.getByTestId('copilot-pr-outline-btn')).toBeVisible()
})

test('renders the text completion toggle button', async () => {
  const props = getCopilotMarkdownToolbarButtonProps()

  const {user} = render(
    <>
      <form>
        <div className="js-previewable-comment-form">
          <button id={props.anchorId} type="button">
            Copilot actions
          </button>
          <textarea className="js-comment-field" />
          <CopilotMarkdownToolbarButton {...props} />
        </div>
      </form>
    </>,
  )

  const copilotButton = await screen.findByText('Copilot actions')

  await user.click(copilotButton)

  expect(screen.getByTestId('copilot-autocomplete-toggle-btn')).toBeVisible()
})

test('RAI ActionList item includes a link to the Copilot PR Summaries documentation', async () => {
  const props = getCopilotMarkdownToolbarButtonProps()
  const {user} = render(
    <>
      <form>
        <div className="js-previewable-comment-form">
          <button id={props.anchorId} type="button">
            Copilot actions
          </button>
          <textarea className="js-comment-field" />
          <CopilotMarkdownToolbarButton {...props} />
        </div>
      </form>
    </>,
  )

  const copilotButton = await screen.findByText('Copilot actions')

  await user.click(copilotButton)

  const RaiButton = screen.getByTestId('copilot-pr-summary-rai-ux')
  expect(RaiButton).toBeVisible()
  expect(RaiButton.getAttribute('href')).toEqual(
    'https://docs.github.com/copilot/github-copilot-enterprise/copilot-pull-request-summaries/about-copilot-pull-request-summaries',
  )
})

test('Kicks off summarization when summary button is clicked', async () => {
  const props = getCopilotMarkdownToolbarButtonProps()
  const {container, user} = render(
    <>
      <form>
        <div className="js-previewable-comment-form">
          <button id={props.anchorId} type="button">
            Copilot actions
          </button>
          <textarea className="js-comment-field" />
          <CopilotMarkdownToolbarButton {...props} />
        </div>
      </form>
    </>,
  )

  let event
  // eslint-disable-next-line testing-library/no-container
  container.addEventListener(INIT_EVENT, e => {
    event = e
  })

  const copilotButton = await screen.findByText('Copilot actions')

  await user.click(copilotButton)
  expect(screen.getByTestId('copilot-pr-summary-btn')).toBeVisible()

  expect(event).toBe(undefined)

  await user.click(screen.getByTestId('copilot-pr-summary-btn'))

  // Fires CopilotSummaryBanner trigger event
  expect(event).not.toBe(undefined)
})

test('Kicks off enroll/unenroll from ghostpilot feat when toggle button is clicked', async () => {
  const props = getCopilotMarkdownToolbarButtonProps()

  const {user} = render(
    <>
      <form>
        <div className="js-previewable-comment-form">
          <button id={props.anchorId} type="button">
            Copilot actions
          </button>
          <textarea className="js-comment-field" />
          <CopilotMarkdownToolbarButton {...props} />
        </div>
      </form>
    </>,
  )

  const copilotButton = await screen.findByText('Copilot actions')
  await user.click(copilotButton)
  expect(screen.getByTestId('copilot-autocomplete-toggle-btn')).toBeVisible()
  await user.click(screen.getByTestId('copilot-autocomplete-toggle-btn'))
  await user.click(screen.getByTestId('copilot-autocomplete-disable-btn'))

  await act(async () => {
    await resp
  })
  expect(mockedVerifiedFetch).toHaveBeenCalled()

  mockedVerifiedFetch.mockClear()
  await user.click(copilotButton)
  expect(screen.getByTestId('copilot-autocomplete-toggle-btn')).toBeVisible()
  await user.click(screen.getByTestId('copilot-autocomplete-toggle-btn'))
  await user.click(screen.getByTestId('copilot-autocomplete-disable-btn'))

  await act(async () => {
    await resp
  })
  expect(mockedVerifiedFetch).not.toHaveBeenCalled()
})

test('Disables the summary button until end event is fired', async () => {
  const props = getCopilotMarkdownToolbarButtonProps()
  const {container, user} = render(
    <>
      <form data-testid="test-form">
        <div className="js-previewable-comment-form">
          <button id={props.anchorId} type="button">
            Copilot actions
          </button>
          <textarea className="js-comment-field" />
          <CopilotMarkdownToolbarButton {...props} />
        </div>
      </form>
    </>,
  )

  let event
  // eslint-disable-next-line testing-library/no-container
  container.addEventListener(INIT_EVENT, e => {
    event = e
  })
  expect(event).toBe(undefined)

  const copilotButton = await screen.findByText('Copilot actions')

  await user.click(copilotButton)

  expect(screen.getByTestId('copilot-pr-summary-btn')).toBeVisible()

  await user.click(screen.getByTestId('copilot-pr-summary-btn'))

  // First click triggers a PR summary event
  expect(event).not.toBe(undefined)
  event = undefined

  await user.click(copilotButton)

  const summaryButton = screen.getByTestId('copilot-pr-summary-btn')
  expect(summaryButton).toBeVisible()
  expect(summaryButton.getAttribute('aria-disabled')).toBe('true')

  const form = screen.getByTestId('test-form')
  act(() => {
    form.dispatchEvent(new CustomEvent(END_EVENT, {bubbles: true}))
  })

  expect(summaryButton.getAttribute('aria-disabled')).toBe(null)

  await user.click(summaryButton)

  // End event re-enabled the button
  expect(event).not.toBe(undefined)
})
