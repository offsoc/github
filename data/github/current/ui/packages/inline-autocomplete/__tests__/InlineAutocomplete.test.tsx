import {render} from '@github-ui/react-core/test-utils'
import {ActionList, FormControl, Textarea, ThemeProvider} from '@primer/react'
import useIsomorphicLayoutEffect from '@primer/react/lib-esm/utils/useIsomorphicLayoutEffect'
import {fireEvent, screen, within} from '@testing-library/react'
import {useState} from 'react'

import {InlineAutocomplete} from '../InlineAutocomplete'
import type {FirstOptionSelectionMode, ShowSuggestionsEvent, Suggestions, Trigger} from '../types'

const label = 'Inline Autocomplete'

const users = ['monalisa', 'github', 'primer']

const emojis = ['heart', 'smile', '+1']

const issues = [
  ['1', 'add emoji feature'],
  ['2', 'fails to save'],
  ['3', 'updates too slowly'],
] as const

const triggers: Trigger[] = [
  {triggerChar: '@'},
  {triggerChar: ':', keepTriggerCharOnCommit: false},
  {triggerChar: '#', multiWord: true},
]

const UncontrolledInlineAutocomplete = ({
  loading = false,
  tabInsertsSuggestions,
  firstOptionSelectionMode,
}: {
  loading?: boolean
  tabInsertsSuggestions?: boolean
  firstOptionSelectionMode?: FirstOptionSelectionMode
}) => {
  const [suggestions, setSuggestions] = useState<Suggestions>([])

  const showUserSuggestions = (query: string) => {
    const matchingUsers = users.filter(user => user.includes(query))
    setSuggestions(matchingUsers)
  }

  const showEmojiSuggestions = (query: string) => {
    setSuggestions(
      emojis
        .filter(emoji => emoji.includes(query))
        .map(emoji => ({
          key: emoji,
          value: `:${emoji}:`,
          render: props => <ActionList.Item {...props}>{emoji}</ActionList.Item>,
        })),
    )
  }

  const showIssueSuggestions = (query: string) => {
    if (loading) {
      setSuggestions('loading')
      return
    }

    setSuggestions(
      issues
        .filter(([, title]) => title.includes(query))
        .map(([id, title]) => ({
          key: id,
          value: id,
          render: props => <ActionList.Item {...props}>{title}</ActionList.Item>,
        })),
    )
  }

  const onShowSuggestions = (event: ShowSuggestionsEvent) => {
    switch (event.trigger.triggerChar) {
      case ':':
        showEmojiSuggestions(event.query)
        break
      case '@':
        showUserSuggestions(event.query)
        break
      case '#':
        showIssueSuggestions(event.query)
        break
    }
  }

  useIsomorphicLayoutEffect(() => {
    // combobox-nav attempts to filter out 'hidden' options by checking if the option has an
    // offsetHeight or width > 0. In JSDom, all elements have offsetHeight = offsetWidth = 0,
    // so we need to override at least one to make the class recognize that any options exist.
    // eslint-disable-next-line testing-library/no-node-access
    for (const option of document.querySelectorAll('[role=option]'))
      Object.defineProperty(option, 'offsetHeight', {
        value: 1,
        writable: true,
      })
  })

  return (
    <ThemeProvider>
      <FormControl>
        <FormControl.Label>{label}</FormControl.Label>
        <InlineAutocomplete
          suggestions={suggestions}
          onShowSuggestions={onShowSuggestions}
          onHideSuggestions={() => setSuggestions([])}
          triggers={triggers}
          tabInsertsSuggestions={tabInsertsSuggestions}
          firstOptionSelectionMode={firstOptionSelectionMode}
        >
          <Textarea />
        </InlineAutocomplete>
      </FormControl>
      <button>Button</button> {/* gives us another focuseable element to tab to */}
      <div id="__primerPortalRoot__" />
    </ThemeProvider>
  )
}

describe('InlineAutocomplete', () => {
  it('forwards label ID to input', () => {
    render(<UncontrolledInlineAutocomplete />)

    expect(screen.getByLabelText(label)).toBeInTheDocument()
  })

  it('does not show suggestions initially', () => {
    render(<UncontrolledInlineAutocomplete />)

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.getByLabelText(label)).not.toHaveAttribute('aria-expanded', 'true')
  })

  it('does not show suggestions when typing and not triggered', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    await user.type(screen.getByLabelText(label), 'hello world')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows suggestions when triggered', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'hello @')

    expect(screen.getByRole('listbox')).toBeVisible()
    expect(input).toHaveAttribute('aria-expanded', 'true')
  })

  // escaping the square bracket: https://testing-library.com/docs/user-event/keyboard/#:~:text=Characters%20with%20special,//%20translates%20to%3A%20%7D
  it.each(['(', '[['])('shows suggestions when triggered after an opening %s', async bracket => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, `members of the team should look at it ${bracket}@`)

    expect(screen.getByRole('listbox')).toBeVisible()
    expect(input).toHaveAttribute('aria-expanded', 'true')
  })

  it('does not apply ARIA attributes when no suggestions are available', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'hello')

    expect(input).not.toHaveAttribute('role')
    expect(input).not.toHaveAttribute('aria-expanded')
    expect(input).not.toHaveAttribute('aria-controls')
    expect(input).not.toHaveAttribute('aria-autocomplete')
    expect(input).not.toHaveAttribute('aria-haspopup')
    expect(input).not.toHaveAttribute('aria-activedescendant')
  })

  it('updates ARIA attributes when list is opened', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'hello @')

    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(input).toHaveAttribute('role', 'combobox')
    expect(input).toHaveAttribute('aria-controls')
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(input).toHaveAttribute('aria-haspopup', 'listbox')

    // initially no activedescendant to avoid interrupting typing
    expect(input).not.toHaveAttribute('aria-activedescendant')
  })

  it('updates suggestions upon typing more characters', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input1 = screen.getByLabelText(label)
    await user.type(input1, 'hello @pr')
    const list = screen.getByRole('listbox')
    expect(within(list).queryAllByRole('option')).toHaveLength(1)
  })

  it('hides suggestions on Escape', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'hello @')
    expect(screen.queryByRole('listbox')).toBeVisible()
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('hides suggestions when no results match', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'hello @')
    expect(screen.queryByRole('listbox')).toBeVisible()
    await user.keyboard('xyz')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('hides suggestions when there is a space immediately after the trigger', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'see #')
    expect(screen.queryByRole('listbox')).toBeVisible()
    await user.keyboard(' ')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('hides suggestions when the input is clicked', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'hello @')
    expect(screen.queryByRole('listbox')).toBeVisible()
    await user.click(input)

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('hides suggestions when the page is clicked', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'hello @')
    expect(screen.queryByRole('listbox')).toBeVisible()
    await user.click(document.body)

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('hides suggestions when input is blurred', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'hello @')
    // eslint-disable-next-line github/no-blur
    fireEvent.blur(input)

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('hides suggestions when trigger character is deleted', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'hello @')
    expect(screen.queryByRole('listbox')).toBeVisible()
    await user.keyboard('{Backspace}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it.each(['{Enter}', ' '])('for single-word triggers: hides suggestions when "%s" pressed', async key => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'hello @')

    expect(screen.queryByRole('listbox')).toBeVisible()
    await user.keyboard(key)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it.each(['.', '{Enter}'])('for multi-word triggers: hides suggestions when "%s" pressed', async key => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'see #')

    expect(screen.queryByRole('listbox')).toBeVisible()
    await user.keyboard(key)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('allows space in query for multi-word triggers', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'see #fails to')

    expect(within(screen.getByRole('listbox')).queryAllByRole('option')).toHaveLength(1)
  })

  it('applies the first suggestion on Enter key press', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, `hello @`)

    const list = screen.getByRole('listbox')
    expect(input).not.toHaveAttribute('aria-activedescendant')
    expect(within(list).queryAllByRole('option')[0]).toHaveAttribute('data-combobox-option-default')

    await user.keyboard('{Enter}')

    expect(input).toHaveValue('hello @monalisa ')
    expect(input).toHaveFocus()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('does not apply using Tab when not enabled', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, `hello @`)

    await user.keyboard('{Tab}')

    expect(input).toHaveValue('hello @')

    expect(input).not.toHaveFocus()
  })

  it('applies using Tab when enabled', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete tabInsertsSuggestions />)

    const input = screen.getByLabelText(label)
    await user.type(input, `hello @`)

    await user.keyboard('{Tab}')

    expect(input).toHaveValue('hello @monalisa ')
  })

  it('selects a suggestion with arrow keys', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'hello @')

    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')

    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('aria-activedescendant', 'github')
    expect(within(screen.getByRole('listbox')).queryAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Enter}')

    expect(input).toHaveValue('hello @github ')
    expect(input).toHaveFocus()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('applies a suggestion when clicked', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, `hello @`)

    const option = within(screen.getByRole('listbox')).queryAllByRole('option')[2]
    if (option) await user.click(option)

    expect(input).toHaveValue('hello @primer ')
    expect(input).toHaveFocus()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('applies the value of the suggestion when different from the display text', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'please see #updates')
    await user.keyboard('{Enter}')

    expect(input).toHaveValue('please see #3 ')
  })

  it('deletes the trigger character when `keepTriggerCharOnCommit` is false', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'Hello! :sm')
    await user.keyboard('{Enter}')

    // if the trigger character was not deleted, the value would be "Hello! ::smile:"
    expect(input).toHaveValue('Hello! :smile: ')
  })

  it('shows a loading indicator and allows tabbing away when loading', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete loading />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'please see #')

    const list = screen.getByRole('listbox')
    expect(within(list).queryAllByRole('option')).toHaveLength(0)
    expect(screen.getByText('Loading autocomplete suggestions…')).toBeInTheDocument()

    await user.tab()

    expect(input).not.toHaveFocus()
  })

  it('queries based on the last trigger character found', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'Hello! #test :')
    await user.keyboard('{Enter}')

    expect(input).toHaveValue('Hello! #test :heart: ')
  })

  it('reads out an accessible message when the suggestions become available and change', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'hello @')

    const statusMessage = screen.queryByText(
      '3 autocomplete suggestions available; "monalisa" is highlighted. Press Enter to insert.',
    )
    expect(statusMessage).toBeInTheDocument()
    expect(statusMessage).toHaveAttribute('aria-live', 'assertive')

    await user.keyboard('gith')
    expect(statusMessage).toHaveTextContent(
      '1 autocomplete suggestion available; "github" is highlighted. Press Enter to insert.',
    )
  })

  it('accessible message includes "Tab" when tab insertion is enabled', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete tabInsertsSuggestions />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'hello @')

    const statusMessage = screen.queryByText(
      '3 autocomplete suggestions available; "monalisa" is highlighted. Press Enter or Tab to insert.',
    )
    expect(statusMessage).toBeInTheDocument()
  })

  it('selects the first option when firstOptionSelectionMode="selected"', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete firstOptionSelectionMode="selected" />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'hello @')

    expect(input).toHaveAttribute('aria-activedescendant', 'monalisa')

    await user.keyboard('{Enter}')

    expect(input).toHaveValue('hello @monalisa ')
  })

  it('does not select the first option when firstOptionSelectionMode="none"', async () => {
    const {user} = render(<UncontrolledInlineAutocomplete firstOptionSelectionMode="none" />)

    const input = screen.getByLabelText(label)
    await user.type(input, 'hello @')

    expect(input).not.toHaveAttribute('aria-activedescendant')

    await user.keyboard('{ArrowDown}{Enter}')

    expect(input).toHaveValue('hello @monalisa ')
  })
})
