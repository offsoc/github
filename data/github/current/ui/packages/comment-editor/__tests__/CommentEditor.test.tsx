import {render, screen} from '@testing-library/react'
import {CommentEditor} from '../CommentEditor'
import type {Subject as CommentEditorSubject} from '../subject'
import {noop} from '@github-ui/noop'

describe('rendering the custom toolbar', () => {
  test('render slash command button when slash commands are enabled', () => {
    const subject: CommentEditorSubject = {
      type: 'issue',
      repository: {
        databaseId: 1,
        nwo: 'nwo',
        slashCommandsEnabled: true,
      },
    }

    render(<CommentEditor subject={subject} value="" onChange={noop} />)

    const slashCommandButton = screen.getByLabelText('Insert slash-command')
    expect(slashCommandButton).toBeInTheDocument()
  })

  test('do not render slash command button when slash commands are disabled', () => {
    const subject: CommentEditorSubject = {
      type: 'issue',
      repository: {
        databaseId: 1,
        nwo: 'nwo',
        slashCommandsEnabled: false,
      },
    }

    render(<CommentEditor subject={subject} value="" onChange={noop} />)

    const slashCommandButton = screen.queryByLabelText('Insert slash-command')
    expect(slashCommandButton).not.toBeInTheDocument()
  })

  test('do not render add suggestion button when add suggestion is disabled', () => {
    const subject: CommentEditorSubject = {
      type: 'pull_request',
      repository: {
        databaseId: 1,
        nwo: 'nwo',
        slashCommandsEnabled: true,
      },
    }

    render(
      <CommentEditor
        subject={subject}
        value=""
        onChange={noop}
        suggestedChangesConfig={{
          showSuggestChangesButton: false,
          suggestedChangeLines: undefined,
          onInsertSuggestedChange: noop,
        }}
      />,
    )

    const addSuggestionButton = screen.queryByLabelText('Add a suggestion')
    expect(addSuggestionButton).not.toBeInTheDocument()
  })

  test('do not render add suggestion button when suggestedChanges prop is undefined', () => {
    const subject: CommentEditorSubject = {
      type: 'pull_request',
      repository: {
        databaseId: 1,
        nwo: 'nwo',
        slashCommandsEnabled: true,
      },
    }

    render(<CommentEditor subject={subject} value="" onChange={noop} suggestedChangesConfig={undefined} />)

    const addSuggestionButton = screen.queryByLabelText('Add a suggestion')
    expect(addSuggestionButton).not.toBeInTheDocument()
  })

  test('render add suggestion button when add suggestion is enabled', () => {
    const subject: CommentEditorSubject = {
      type: 'pull_request',
      repository: {
        databaseId: 1,
        nwo: 'nwo',
        slashCommandsEnabled: true,
      },
    }

    render(
      <CommentEditor
        subject={subject}
        value=""
        onChange={noop}
        suggestedChangesConfig={{
          showSuggestChangesButton: true,
          suggestedChangeLines: 'change this line, please!',
          onInsertSuggestedChange: noop,
        }}
      />,
    )

    const addSuggestionButton = screen.getByLabelText('Add a suggestion')
    expect(addSuggestionButton).toBeInTheDocument()
  })
})
