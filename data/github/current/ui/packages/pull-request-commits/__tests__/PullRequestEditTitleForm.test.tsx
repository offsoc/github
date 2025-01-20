import {screen} from '@testing-library/react'
import {
  BlankPRTitleError,
  MaxPRTitleLength,
  PullRequestEditTitleForm,
  maxPRTitleLengthError,
  type PullRequestEditTitleFormProps,
} from '../components/PullRequestEditTitleForm'
import queryClient from '@github-ui/pull-request-page-data-tooling/query-client'
import {expectMockFetchCalledTimes, mockFetch} from '@github-ui/mock-fetch'
import {getCommitsRoutePayload} from '../test-utils/mock-data'
import {BASE_PAGE_DATA_URL, renderWithClient} from '@github-ui/pull-request-page-data-tooling/render-with-query-client'
import {PageData} from '@github-ui/pull-request-page-data-tooling/page-data'

function PullRequestEditTitleFormTestComponent(props: PullRequestEditTitleFormProps) {
  return <PullRequestEditTitleForm {...props} />
}

describe('Pull Request Edit Title Form', () => {
  test('saves a new title', async () => {
    const headerUrl = `${BASE_PAGE_DATA_URL}/page_data/${PageData.header}`
    const {pullRequest} = getCommitsRoutePayload()
    queryClient.setQueryData(['header', headerUrl], {pullRequest: {title: pullRequest.title}})
    const onCloseForm = jest.fn()
    const newTitle = 'New PR Title'

    const {user} = renderWithClient(
      <PullRequestEditTitleFormTestComponent
        initialTitle={pullRequest.title}
        pullRequestNumber={pullRequest.number}
        onCloseForm={onCloseForm}
      />,
    )

    const editTitleTextbox = screen.getByRole('textbox')
    await user.clear(editTitleTextbox)
    await user.type(editTitleTextbox, newTitle)

    mockFetch.mockRouteOnce(/update_title/, {pullRequest: {title: newTitle}})

    const saveButton = screen.getByRole('button', {name: /Save/})
    await user.click(saveButton)

    expectMockFetchCalledTimes(/update_title/, 1)
    expect(onCloseForm).toHaveBeenCalled()
  })

  test('cancels editing', async () => {
    const {pullRequest} = getCommitsRoutePayload()
    const onCloseForm = jest.fn()
    const newTitle = 'New PR Title'

    const {user} = renderWithClient(
      <PullRequestEditTitleFormTestComponent
        initialTitle={pullRequest.title}
        pullRequestNumber={pullRequest.number}
        onCloseForm={onCloseForm}
      />,
    )

    const editTitleTextbox = screen.getByRole('textbox')
    await user.type(editTitleTextbox, newTitle)

    mockFetch.mockRouteOnce(/update_title/, {pullRequest: {title: newTitle}})

    const cancelButton = screen.getByRole('button', {name: /Cancel/})
    await user.click(cancelButton)

    expectMockFetchCalledTimes(/update_title/, 0)
    expect(onCloseForm).toHaveBeenCalled()
  })

  test('displays an error for a title that is too long', async () => {
    const {pullRequest} = getCommitsRoutePayload()
    const onCloseForm = jest.fn()
    const longTitle = 'a'.repeat(MaxPRTitleLength + 1)

    const {user} = renderWithClient(
      <PullRequestEditTitleFormTestComponent
        initialTitle={pullRequest.title}
        pullRequestNumber={pullRequest.number}
        onCloseForm={onCloseForm}
      />,
    )

    const editTitleTextbox = screen.getByRole<HTMLInputElement>('textbox')
    await user.clear(editTitleTextbox)
    await user.type(editTitleTextbox, longTitle)

    expect(screen.getByText(maxPRTitleLengthError(longTitle))).toBeInTheDocument()
  })

  test('displays an error for an empty title', async () => {
    const {pullRequest} = getCommitsRoutePayload()
    const onCloseForm = jest.fn()

    const {user} = renderWithClient(
      <PullRequestEditTitleFormTestComponent
        initialTitle={pullRequest.title}
        pullRequestNumber={pullRequest.number}
        onCloseForm={onCloseForm}
      />,
    )

    const editTitleTextbox = screen.getByRole<HTMLInputElement>('textbox')
    await user.clear(editTitleTextbox)

    expect(screen.getByText(BlankPRTitleError)).toBeInTheDocument()
  })
})
