import {EditorView} from '@codemirror/view'
import {HighlightStyle, type TagStyle, syntaxHighlighting} from '@codemirror/language'
import {tags as t} from '@lezer/highlight'

const ghTheme = {
  '&': {
    background: 'var(--codeMirror-bgColor, var(--color-codemirror-bg))',
    color: 'var(--codeMirror-fgColor, var(--color-codemirror-text))',
    cursor: 'text',
  },

  '.cm-gutters': {
    background: 'var(--codeMirror-gutters-bgColor, var(--color-codemirror-gutters-bg))',
    borderRightWidth: 0,
  },
  '.cm-lineNumbers .cm-gutterElement': {
    color: 'var(--codeMirror-lineNumber-fgColor, var(--color-codemirror-linenumber-text))',
    fontFamily: 'var(--fontStack-monospace)',
    fontSize: '12px',
    lineHeight: '20px',
    padding: '0 16px 0 16px',
  },

  '.cm-content': {
    caretColor: 'var(--codeMirror-cursor-fgColor, var(--color-codemirror-cursor))',
    fontFamily: 'var(--fontStack-monospace)',
    fontSize: '12px',
    background: 'var(--codeMirror-lines-bgColor, var(--color-codemirror-lines-bg))',
    lineHeight: '20px',
    paddingTop: '8px',
  },

  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'var(--codeMirror-selection-bgColor, var(--color-codemirror-selection-bg, #d7d4f0))',
  },

  '&.cm-focused': {
    outline: 'none',
  },

  '&.hide-help-until-focus': {
    '&.cm-focused .cm-panels-bottom': {
      display: 'block',
    },

    '& .cm-panels-bottom': {
      display: 'none',
    },
  },

  '.cm-content ::-moz-selection': {
    backgroundColor: 'var(--codeMirror-selection-bgColor, var(--color-codemirror-selection-bg, #d7d4f0))',
  },

  '.cm-activeLine': {
    backgroundColor: 'var(--codeMirror-activeline-bgColor, var(--color-codemirror-activeline-bg))',
  },

  '.cm-line': {
    paddingLeft: '16px',
  },

  '.cm-help-panel': {
    background: 'var(--bgColor-muted, var(--color-canvas-subtle))',
    padding: '7px 10px',
    margin: 0,
    fontSize: '13px',
    lineHeight: '16px',
    color: 'var(--fgColor-muted, var(--color-fg-muted))',
    cursor: 'default',
  },

  '.cm-panels-bottom': {
    borderTop: 'var(--borderWidth-thin, 1px) solid var(--borderColor-default, var(--color-border-default))',
    background: 'none',
  },

  // this adjusts the position of the help panel to account for the sticky markdown footer
  // the & isnt standard css, it's a placeholder for CM6 to insert the generated editor class name
  '.js-upload-markdown-image & .cm-panels-bottom': {
    bottom: '30px !important',
  },

  '.cm-panel.cm-search': {
    background: 'var(--bgColor-muted, var(--color-canvas-subtle))',
    padding: '8px',
    fontSize: '16px',
  },

  '.cm-panel.cm-search > button': {
    borderRadius: '6px',
    padding: '4px 8px',
    background: 'var(--codeMirror-bgColor, var(--color-codemirror-bg))',
    color: 'var(--button-default-fgColor-rest, var(--color-btn-text))',
    border: '1px solid var(--button-default-borderColor-rest, var(--color-btn-border))',
    textTransform: 'capitalize',
  },

  '.cm-panel.cm-search > label': {
    color: 'var(--fgColor-default, var(--color-fg-default))',
    textTransform: 'capitalize',
    fontSize: '12px',
  },

  '.cm-panel.cm-search > input': {
    borderRadius: '6px',
    padding: '4px 8px',
    background: 'var(--bgColor-default, var(--color-canvas-default))',
    color: 'var(--fgColor-default, var(--color-fg-default))',
    border: '1px solid var(--borderColor-default, var(--color-border-default))',
    fontSize: '12px',
  },

  '.cm-panel.cm-search > button[name="close"]': {
    padding: '4px',
  },

  '.cm-panels-top': {
    borderBottom: 'var(--borderWidth-thin, 1px) solid var(--color-border-default)',
    background: 'none',
  },

  '.cm-panel.cm-search input, .cm-panel.cm-search button, .cm-panel.cm-search label': {
    marginRight: '8px',
    marginBottom: '4px',
    marginTop: '4px',
    marginLeft: 0,
  },

  '.cm-lintRange': {
    cursor: 'help',
    // prefer using lint-mark styles in /workspaces/github/app/assets/stylesheets/bundles/github/blob-editor.scss
    backgroundImage: 'none !important',
  },

  // Resolves an issue where multiline placeholder values cause the
  // fake CodeMirror cursor to expand to the height of that content
  '.cm-placeholder': {
    height: '1em',
  },

  '&.custom-tooltips .cm-tooltip': {
    border: 'none !important',
    backgroundColor: 'transparent !important',
  },

  '&.custom-tooltips .cm-diagnostic': {
    padding: 0,
    marginLeft: '0 !important',
    borderLeft: 'none !important',
    whiteSpace: 'unset',
  },
}

// Simple highlighting missing entity and support highlighting from the old codemirror
// The new codemirror gives a lot more control over how things are highlighted maybe we should look at constructing
// a new, more detailed syntax theme
const githubDefaultHighlights: TagStyle[] = [
  {tag: [t.keyword], color: 'var(--codeMirror-syntax-fgColor-keyword, var(--color-codemirror-syntax-keyword))'},
  {tag: [t.comment], color: 'var(--codeMirror-syntax-fgColor-comment, var(--color-codemirror-syntax-comment))'},
  // No way in the new one to tell if a bracket is matching to my knowledge
  {tag: [t.bracket], color: 'var(--codeMirror-matchingBracket-fgColor, var(--color-codemirror-matchingbracket-text))'},
  {
    tag: [t.string, t.url, t.regexp],
    color: 'var(--codeMirror-syntax-fgColor-string, var(--color-codemirror-syntax-string))',
  },
  {
    tag: [t.constant(t.name), t.propertyName, t.attributeName],
    color: 'var(--codeMirror-syntax-fgColor-constant, var(--color-codemirror-syntax-constant))',
  },
  {
    tag: [t.atom, t.number, t.bool],
    color: 'var(--codeMirror-syntax-fgColor-constant, var(--color-codemirror-syntax-constant))',
  },
  {
    tag: [t.function(t.variableName)],
    color: 'var(--codeMirror-syntax-fgColor-entity, var(--color-codemirror-syntax-entity))',
  },
  {
    tag: t.definition(t.variableName),
    color: 'var(--codeMirror-syntax-fgColor-variable, var(--color-codemirror-syntax-variable))',
  },
  {tag: t.meta, color: 'inherit'},
  {tag: t.heading, fontWeight: 'bold', color: 'inherit !important'},
  {tag: t.monospace, color: 'var(--codeMirror-syntax-fgColor-comment, var(--color-codemirror-syntax-comment))'}, // markdown code blocks
]

// empty for now but a dark mode placeholder
const darkModeHighlights: TagStyle[] = []

// default styles taken from @codemirror/language
export const codemirrorDefaultHighlightStyle = [
  // uncommented lines are used from the default theme without overrides
  {tag: t.link, textDecoration: 'underline'},
  {tag: t.emphasis, fontStyle: 'italic'},
  {tag: t.strong, fontWeight: 'bold'},
  {tag: t.strikethrough, textDecoration: 'line-through'},

  // remaining commented out for reference until needed for overrides
  // {tag: [t.contentSeparator, t.labelName], color: '#219'},
  // {tag: [t.literal, t.inserted], color: '#164'},
  // {tag: [t.deleted], color: '#a11'},
  // {tag: [t.regexp, t.escape, t.special(t.string)], color: '#e40'},
  // {tag: t.local(t.variableName), color: '#30a'},
  // {tag: [t.typeName, t.namespace], color: '#085'},
  // {tag: t.className, color: '#167'},
  // {tag: [t.special(t.variableName), t.macroName], color: '#256'},
  // {tag: t.definition(t.propertyName), color: '#00c'},
  // {tag: t.invalid, color: '#f00'},
]

const githubLightHighlightStyle = [...githubDefaultHighlights, ...codemirrorDefaultHighlightStyle]
const githubDarkHighlightStyle = [...githubDefaultHighlights, ...darkModeHighlights, ...codemirrorDefaultHighlightStyle]

export function getTheme(additionalStyles: TagStyle[] = []) {
  const isDarkMode = document.querySelector('[data-color-mode="dark"]') !== null

  const baseHighlightStyles = isDarkMode ? githubDarkHighlightStyle : githubLightHighlightStyle
  const extendedHighlightStyles = [...baseHighlightStyles, ...additionalStyles]

  return [
    EditorView.theme(ghTheme),
    syntaxHighlighting(HighlightStyle.define(extendedHighlightStyles), {fallback: true}),
  ]
}
