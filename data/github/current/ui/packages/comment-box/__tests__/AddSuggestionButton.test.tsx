import {useState} from 'react'
import type {Subject as CommentBoxSubject} from '../subject'
import {render, screen, fireEvent, getDefaultNormalizer} from '@testing-library/react'
import {CommentBox} from '../CommentBox'
import {noop} from '@github-ui/noop'

/**
 * Wrap CommentBox in a component that has state so that we can test the interaction of the add a suggestion button
 */
function CommentBoxWithStateComponent({
  sourceContentFromDiffLines,
  initialInputValue = '',
  shouldInsertSuggestionOnRender = false,
}: {
  sourceContentFromDiffLines: string | undefined
  initialInputValue?: string
  onInsertSuggestedChange?: () => void
  shouldInsertSuggestionOnRender?: boolean | undefined
}) {
  const subject: CommentBoxSubject = {
    type: 'pull_request',
    repository: {
      databaseId: 1,
      nwo: 'nwo',
      slashCommandsEnabled: true,
    },
  }
  const [inputValue, setInputValue] = useState(initialInputValue)
  return (
    <CommentBox
      subject={subject}
      value={inputValue}
      onChange={setInputValue}
      suggestedChangesConfig={{
        showSuggestChangesButton: true,
        sourceContentFromDiffLines,
        onInsertSuggestedChange: noop,
        shouldInsertSuggestedChange: shouldInsertSuggestionOnRender,
      }}
    />
  )
}

describe('add a suggestion interaction', () => {
  test('inserts the changed line suggestion on the first line if the input is empty', () => {
    const sourceContentFromDiffLines = 'change this line, please!'

    render(<CommentBoxWithStateComponent sourceContentFromDiffLines={sourceContentFromDiffLines} />)

    const addSuggestionButton = screen.getByLabelText('Add a suggestion')
    expect(addSuggestionButton).toBeInTheDocument()

    fireEvent.click(addSuggestionButton)

    const markdownSuggestion = `\`\`\`suggestion\n${sourceContentFromDiffLines}\n\`\`\``

    const suggestionInsertedIntoTextarea = screen.getByDisplayValue(markdownSuggestion, {
      normalizer: getDefaultNormalizer({collapseWhitespace: false}),
    })
    expect(suggestionInsertedIntoTextarea).toBeInTheDocument()
  })

  test('inserts the changed line suggestion on the next line if the input is not empty', () => {
    const sourceContentFromDiffLines = 'change this line, please!'
    const initialInputValue = 'Perhaps you should change this...'

    render(
      <CommentBoxWithStateComponent
        sourceContentFromDiffLines={sourceContentFromDiffLines}
        initialInputValue={initialInputValue}
      />,
    )

    const addSuggestionButton = screen.getByLabelText('Add a suggestion')
    expect(addSuggestionButton).toBeInTheDocument()

    fireEvent.click(addSuggestionButton)

    const markdownSuggestion = `\`\`\`suggestion\n${sourceContentFromDiffLines}\n\`\`\``
    const appendedMarkdownSuggestion = `${initialInputValue}\n${markdownSuggestion}`

    const suggestionInsertedIntoTextarea = screen.getByDisplayValue(appendedMarkdownSuggestion, {
      normalizer: getDefaultNormalizer({collapseWhitespace: false}),
    })
    expect(suggestionInsertedIntoTextarea).toBeInTheDocument()
  })

  test('inserts the suggestion markdown backticks with a blank line if the suggestion is undefined', () => {
    render(<CommentBoxWithStateComponent sourceContentFromDiffLines={undefined} />)

    const addSuggestionButton = screen.getByLabelText('Add a suggestion')
    expect(addSuggestionButton).toBeInTheDocument()

    fireEvent.click(addSuggestionButton)

    const markdownSuggestion = `\`\`\`suggestion\n\n\`\`\``

    const suggestionInsertedIntoTextarea = screen.getByDisplayValue(markdownSuggestion, {
      normalizer: getDefaultNormalizer({collapseWhitespace: false}),
    })
    expect(suggestionInsertedIntoTextarea).toBeInTheDocument()
  })
})

describe('automatically inserting the suggestion on render, typically via context menu item', () => {
  test('auto inserts the suggestion markdown backticks if the corresponding prop is set', async () => {
    const suggestion = 'hello'
    render(
      <CommentBoxWithStateComponent sourceContentFromDiffLines={suggestion} shouldInsertSuggestionOnRender={true} />,
    )

    const markdownSuggestion = `\`\`\`suggestion\n${suggestion}\n\`\`\``

    const suggestionInsertedIntoTextarea = await screen.findByDisplayValue(markdownSuggestion, {
      normalizer: getDefaultNormalizer({collapseWhitespace: false}),
    })
    expect(suggestionInsertedIntoTextarea).toBeInTheDocument()
  })

  test('does not auto insert the suggestion markdown backticks if the corresponding prop is not set', async () => {
    const suggestion = 'hello'
    render(
      <CommentBoxWithStateComponent sourceContentFromDiffLines={suggestion} shouldInsertSuggestionOnRender={false} />,
    )

    const emptyMarkdownEditor = screen.getByPlaceholderText('Leave a comment')
    expect(emptyMarkdownEditor).toBeInTheDocument()
  })

  test('does not double insert suggestion after previewing the markdown (causes a total re-render)', async () => {
    const suggestion = 'hello'
    render(
      <CommentBoxWithStateComponent sourceContentFromDiffLines={suggestion} shouldInsertSuggestionOnRender={true} />,
    )

    const markdownSuggestion = `\`\`\`suggestion\n${suggestion}\n\`\`\``

    const suggestionInsertedIntoTextarea = await screen.findByDisplayValue(markdownSuggestion, {
      normalizer: getDefaultNormalizer({collapseWhitespace: false}),
    })
    expect(suggestionInsertedIntoTextarea).toBeInTheDocument()

    const previewButton = screen.getByText('Preview')
    fireEvent.click(previewButton)

    const writeButton = screen.getByText('Write')
    fireEvent.click(writeButton)

    // No duplicate suggestions
    expect(
      screen.queryByDisplayValue(`${markdownSuggestion}\n${markdownSuggestion}`, {
        normalizer: getDefaultNormalizer({collapseWhitespace: false}),
      }),
    ).toBeNull()

    expect(
      await screen.findByDisplayValue(markdownSuggestion, {
        normalizer: getDefaultNormalizer({collapseWhitespace: false}),
      }),
    ).toBeInTheDocument()
  })
})
