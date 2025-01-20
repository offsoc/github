import {expectMockFetchCalledTimes, mockFetch} from '@github-ui/mock-fetch'
import {setupUserEvent} from '@github-ui/react-core/test-utils'
import {act, render, screen} from '@testing-library/react'
import {CommentBox} from '../CommentBox'
import type {Subject as CommentBoxSubject} from '../subject'
import {noop} from '@github-ui/noop'

const defaultSubject: CommentBoxSubject = {
  type: 'issue',
  repository: {
    databaseId: 1,
    nwo: 'nwo',
    slashCommandsEnabled: true,
  },
}

describe('rendering the custom toolbar', () => {
  test('render slash command button when slash commands are enabled', () => {
    const subject: CommentBoxSubject = {
      type: 'issue',
      repository: {
        databaseId: 1,
        nwo: 'nwo',
        slashCommandsEnabled: true,
      },
    }

    render(<CommentBox subject={subject} value="" onChange={noop} />)

    const slashCommandButton = screen.getByLabelText('Insert slash-command')
    expect(slashCommandButton).toBeInTheDocument()
  })

  test('do not render slash command button when slash commands are disabled', () => {
    const subject: CommentBoxSubject = {
      type: 'issue',
      repository: {
        databaseId: 1,
        nwo: 'nwo',
        slashCommandsEnabled: false,
      },
    }

    render(<CommentBox subject={subject} value="" onChange={noop} />)

    const slashCommandButton = screen.queryByLabelText('Insert slash-command')
    expect(slashCommandButton).not.toBeInTheDocument()
  })

  test('do not render add suggestion button when add suggestion is disabled', () => {
    const subject: CommentBoxSubject = {
      type: 'pull_request',
      repository: {
        databaseId: 1,
        nwo: 'nwo',
        slashCommandsEnabled: true,
      },
    }

    render(
      <CommentBox
        subject={subject}
        value=""
        onChange={noop}
        suggestedChangesConfig={{
          showSuggestChangesButton: false,
          sourceContentFromDiffLines: undefined,
          onInsertSuggestedChange: noop,
        }}
      />,
    )

    const addSuggestionButton = screen.queryByLabelText('Add a suggestion')
    expect(addSuggestionButton).not.toBeInTheDocument()
  })

  test('do not render add suggestion button when suggestedChanges prop is undefined', () => {
    const subject: CommentBoxSubject = {
      type: 'pull_request',
      repository: {
        databaseId: 1,
        nwo: 'nwo',
        slashCommandsEnabled: true,
      },
    }

    render(<CommentBox subject={subject} value="" onChange={noop} suggestedChangesConfig={undefined} />)

    const addSuggestionButton = screen.queryByLabelText('Add a suggestion')
    expect(addSuggestionButton).not.toBeInTheDocument()
  })

  test('render add suggestion button when add suggestion is enabled', () => {
    const subject: CommentBoxSubject = {
      type: 'pull_request',
      repository: {
        databaseId: 1,
        nwo: 'nwo',
        slashCommandsEnabled: true,
      },
    }

    render(
      <CommentBox
        subject={subject}
        value=""
        onChange={noop}
        suggestedChangesConfig={{
          showSuggestChangesButton: true,
          sourceContentFromDiffLines: 'change this line, please!',
          onInsertSuggestedChange: noop,
        }}
      />,
    )

    const addSuggestionButton = screen.getByLabelText('Add a suggestion')
    expect(addSuggestionButton).toBeInTheDocument()
  })
})

describe('markdown suggestions fetching', () => {
  const mentionSuggestionEndpoint = `/suggestions/${defaultSubject.type}?mention_suggester=1&user_avatar=1&repository_id=1`
  const issueSuggestionEndpoint = `/suggestions/${defaultSubject.type}?issue_suggester=1&repository_id=1`
  const repliesSuggestionEndpoint = `/settings/replies?context=${defaultSubject.type}`

  beforeEach(() => {
    mockFetch.mockRoute(mentionSuggestionEndpoint)
    mockFetch.mockRoute(issueSuggestionEndpoint)
    mockFetch.mockRoute(repliesSuggestionEndpoint)
  })

  test('fetches suggestions on mount when configured with "eager"', async () => {
    await render(
      <CommentBox subject={defaultSubject} value="" onChange={noop} markdownSuggestionsFetchMethod="eager" />,
    )

    expectMockFetchCalledTimes(mentionSuggestionEndpoint, 1)
    expectMockFetchCalledTimes(issueSuggestionEndpoint, 1)
    expectMockFetchCalledTimes(repliesSuggestionEndpoint, 1)
  })

  test('fetches suggestions on focus by default', async () => {
    const user = setupUserEvent()
    await render(<CommentBox subject={defaultSubject} value="" onChange={noop} />)

    expectMockFetchCalledTimes(mentionSuggestionEndpoint, 0)
    expectMockFetchCalledTimes(issueSuggestionEndpoint, 0)
    expectMockFetchCalledTimes(repliesSuggestionEndpoint, 0)

    const textarea = screen.getByRole<HTMLTextAreaElement>('textbox')

    act(() => {
      textarea.focus()
    })

    expectMockFetchCalledTimes(mentionSuggestionEndpoint, 1)
    expectMockFetchCalledTimes(issueSuggestionEndpoint, 1)
    expectMockFetchCalledTimes(repliesSuggestionEndpoint, 1)

    await user.tab() // blur the textarea

    expect(textarea).not.toHaveFocus()

    // refocus the textarea
    act(() => {
      textarea.focus()
    })

    expect(textarea).toHaveFocus()

    // verify that the suggestions are not fetched again
    expectMockFetchCalledTimes(mentionSuggestionEndpoint, 1)
    expectMockFetchCalledTimes(issueSuggestionEndpoint, 1)
    expectMockFetchCalledTimes(repliesSuggestionEndpoint, 1)
  })

  test('calls saved replies endpoint without context when subject type is not issue nor pull_request', async () => {
    const projectSubject: CommentBoxSubject = {
      type: 'project',
    }

    await render(
      <CommentBox subject={projectSubject} value="" onChange={noop} markdownSuggestionsFetchMethod="eager" />,
    )

    expectMockFetchCalledTimes('/settings/replies', 1)
  })
})
