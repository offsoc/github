import {EditorView} from '@codemirror/view'

export const autocompleteTheme = EditorView.baseTheme({
  '.cm-tooltip.cm-tooltip-autocomplete': {
    border: 0,
    backgroundColor: 'transparent',
  },

  '.cm-tooltip.cm-tooltip-autocomplete > ul': {
    fontFamily: "SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace",
    fontSize: '12px',
    backgroundColor: 'var(--bgColor-default, var(--color-canvas-default))',
    border: '1px solid var(--borderColor-default, var(--color-border-default))',
    borderRadius: 'var(--borderRadius-medium)',
    boxShadow: 'var(--shadow-resting-medium, var(--color-shadow-medium))',
    minWidth: 'auto',
  },
  '.cm-tooltip.cm-tooltip-autocomplete li[role="option"]': {
    padding: '2px 8px',
    margin: 0,
    color: 'var(--fgColor-default, var(--color-fg-default))',
    whiteSpace: 'pre',
  },
  '.cm-tooltip.cm-tooltip-autocomplete li[role="option"]:first-child': {
    borderTopLeftRadius: 'var(--borderRadius-medium)',
    borderTopRightRadius: 'var(--borderRadius-medium)',
  },
  '.cm-tooltip.cm-tooltip-autocomplete li[role="option"]:last-child': {
    borderBottomLeftRadius: 'var(--borderRadius-medium)',
    borderBottomRightRadius: 'var(--borderRadius-medium)',
  },
  '.cm-tooltip.cm-tooltip-autocomplete ul li[aria-selected], .cm-tooltip.cm-tooltip-autocomplete ul li[aria-selected] .cm-completionDetail':
    {
      color: 'var(--fgColor-onEmphasis, var(--color-fg-on-emphasis))',
      background: 'var(--bgColor-accent-emphasis, var(--color-accent-emphasis))',
    },
  '.cm-completionDetail': {
    paddingLeft: '8px',
    color: 'var(--fgColor-muted, var(--color-fg-muted))',
    fontSize: 'var(--fontSize-small)',
    fontStyle: 'normal',
  },
})
