import {
  type Command,
  Decoration,
  type DecorationSet,
  EditorView,
  type KeyBinding,
  ViewPlugin,
  type ViewUpdate,
  keymap,
} from '@codemirror/view'
import {
  find,
  getCursor,
  getSelection,
  insertAtCursor,
  insertAtStartOfLine,
  removeFromStartOfLine,
  replaceSelection,
  setCursor,
  setSelection,
  somethingSelected,
} from '../utils'
import {type Extension, RangeSetBuilder} from '@codemirror/state'

const ITALIC_TOKEN = '_'
const BOLD_TOKEN = '**'
const CODE_TOKEN = '`'
const BLOCKQUOTE_TOKEN = '>'
const ORDERED_LIST_TOKEN = 'ol'
const UNORDERED_LIST_TOKEN = '-'

const DISALLOW_LINKYFY_ON_PASTE = new WeakMap<EditorView, boolean>()

function insertToken(view: EditorView, token: string) {
  if (somethingSelected(view)) {
    const currentSelection = getSelection(view.state)
    replaceSelection(view, `${token}${currentSelection}${token}`)
  } else {
    const cursor = getCursor(view)
    insertAtCursor(view, token.repeat(2))
    setCursor(view, cursor.anchor + token.length)
  }

  return true // indicates that the key was handled
}

function toggleList(view: EditorView, token: string) {
  const cursor = getCursor(view)
  const currentLine = view.state.doc.lineAt(cursor.from)

  const selection = getSelection(view.state)
  const prefixRegex = new RegExp(`^${token === 'ol' ? '\\d+\\.' : token}\\s`)

  if (selection) {
    // if we end with a newline character, we need to trim it off to keep the right number of selected lines
    const trimmedSelection = selection.endsWith('\n') ? selection.slice(0, -2) : selection
    const rawLines = trimmedSelection.split('\n')

    // re-select the lines, to make sure we are looking at the full line and not just the selection
    const lines = rawLines.map((_line, index) => {
      const lineNumber = currentLine.number + index
      return {text: view.state.doc.line(lineNumber).text, lineNumber}
    })

    const everyLineStartsWithPrefix = lines.every(line => prefixRegex.test(line.text))

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!

      if (everyLineStartsWithPrefix) {
        // unformat every line
        const match = line.text.match(prefixRegex)
        if (match) {
          removeFromStartOfLine(view, line?.lineNumber, match[0])
        }
      } else {
        // format every line
        const marker = `${token === 'ol' ? `${i + 1}.` : token} `
        insertAtStartOfLine(view, line?.lineNumber, marker)
      }
    }
  } else {
    const match = currentLine.text.match(prefixRegex)
    if (match) {
      removeFromStartOfLine(view, currentLine.number, match[0])
    } else {
      const marker = `${token === 'ol' ? `1.` : token} `
      insertAtStartOfLine(view, currentLine.number, marker)

      if (!currentLine.text) {
        // if we are on an empty line, we need to move the cursor to the right of the inserted marker
        setCursor(view, cursor.anchor + marker.length)
      }
    }
  }

  return true // indicates that the key was handled
}

export const insertLink: Command = (view: EditorView) => {
  const selection = getSelection(view.state)
  if (selection) {
    const newSelection = `[${selection}](url)`
    replaceSelection(view, newSelection)

    const match = find(view, newSelection)
    const matchStart = match.value.from

    // 3 => Add 3 for `[,],(` - characters added to the
    // 6 => Add 3 for `[,],(` - The 3 above, plus `url`
    setSelection(view, matchStart + selection.length + 3, matchStart + selection.length + 6)
  } else {
    const cursor = getCursor(view)
    insertAtCursor(view, '[](url)')
    setCursor(view, cursor.anchor + 1) // Then place the cursor between the square brackets
  }

  return true // indicates that the key was handled
}

function insertSelectedTextLink(view: EditorView, event: ClipboardEvent) {
  const selection = getSelection(view.state)
  const dataTransfer = event.clipboardData

  if (selection && dataTransfer) {
    const pasteLink = dataTransfer.getData('text/plain')

    // check if the clipboard item was an actual link
    if (!/^https?:\/\//i.test(pasteLink)) return

    if (pasteLink) {
      event.preventDefault() // prevent default paste insertion and let us handle the paste and replace
      replaceSelection(view, `[${selection}](${pasteLink})`)
    }
  }
}

function setDisallowLinkifyOnPaste(view: EditorView, disallow: boolean) {
  DISALLOW_LINKYFY_ON_PASTE.set(view, disallow)

  return false // indicates should be allowed to bubble up
}

export const insertItalicToken: Command = (view: EditorView) => insertToken(view, ITALIC_TOKEN)
export const insertBoldToken: Command = (view: EditorView) => insertToken(view, BOLD_TOKEN)
export const insertCodeToken: Command = (view: EditorView) => insertToken(view, CODE_TOKEN)

export const toggleBlockQuoteList: Command = (view: EditorView) => toggleList(view, BLOCKQUOTE_TOKEN)
export const toggleOrderedList: Command = (view: EditorView) => toggleList(view, ORDERED_LIST_TOKEN)
export const toggleUnorderedList: Command = (view: EditorView) => toggleList(view, UNORDERED_LIST_TOKEN)

const pasteFormatted: Command = (view: EditorView) => setDisallowLinkifyOnPaste(view, false)
const pasteUnformatted: Command = (view: EditorView) => setDisallowLinkifyOnPaste(view, true)

const MarkdownKeymaps: KeyBinding[] = [
  {key: 'Mod-i', run: insertItalicToken, preventDefault: true},
  {key: 'Mod-b', run: insertBoldToken, preventDefault: true},
  {key: 'Mod-e', run: insertCodeToken, preventDefault: true},
  {key: 'Mod-k', run: insertLink, preventDefault: true},
  {key: 'Shift-Mod-.', run: toggleBlockQuoteList, preventDefault: true},
  {key: 'Shift-Mod-7', run: toggleOrderedList, preventDefault: true},
  {key: 'Shift-Mod-8', run: toggleUnorderedList, preventDefault: true},
  {key: 'Mod-v', run: pasteFormatted},
  {key: 'Shift-Mod-v', run: pasteUnformatted},
]

function autoDirectionBuilder(view: EditorView) {
  const autoDirectionDecoration = Decoration.line({
    attributes: {dir: 'auto'},
  })

  const builder = new RangeSetBuilder<Decoration>()
  for (const {from, to} of view.visibleRanges) {
    for (let pos = from; pos <= to; ) {
      const line = view.state.doc.lineAt(pos)

      builder.add(line.from, line.from, autoDirectionDecoration)
      pos = line.to + 1
    }
  }
  return builder.finish()
}

// right-align pargraphs in right-to-left languages when editing Markdown
const autoDirectionPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = autoDirectionBuilder(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) this.decorations = autoDirectionBuilder(update.view)
    }
  },
  {
    decorations: v => v.decorations,
  },
)

export const markdownExtension: Extension[] = (() => [
  // order of the keymaps matters for stopping propagation
  EditorView.domEventHandlers({
    keydown(event) {
      // if we don't stop the propagation, this will open the Command Prompt
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.stopPropagation()
      }
    },
    paste(event, view) {
      // we need to do this funny business here instead of a key binding because we need access to the clipboard event
      if (!DISALLOW_LINKYFY_ON_PASTE.get(view)) {
        insertSelectedTextLink(view, event)
      }
      DISALLOW_LINKYFY_ON_PASTE.set(view, false)
    },
  }),
  keymap.of(MarkdownKeymaps),
  autoDirectionPlugin,
])()
