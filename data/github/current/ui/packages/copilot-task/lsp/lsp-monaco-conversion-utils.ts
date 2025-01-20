// eslint-disable-next-line import/no-namespace
import * as monaco from 'monaco-editor'
// eslint-disable-next-line import/no-namespace
import * as lsp from 'vscode-languageserver-types'

/**
 * Convert a Monaco editor range to an LSP range
 *
 * @param range
 *   The Monaco editor range convert.
 * @returns
 *   The range as LSP range.
 */
export function monacoToLspRange(range: monaco.IRange): lsp.Range {
  return {
    start: {
      line: range.startLineNumber - 1,
      character: range.startColumn - 1,
    },
    end: {line: range.endLineNumber - 1, character: range.endColumn - 1},
  }
}
/**
 * Convert an LSP range to a Monaco editor range.
 *
 * @param range
 *   The LSP range to convert.
 * @returns
 *   The range as Monaco editor range.
 */
export function lspToMonacoRange(range: lsp.Range): monaco.IRange {
  return {
    startLineNumber: range.start.line + 1,
    startColumn: range.start.character + 1,
    endLineNumber: range.end.line + 1,
    endColumn: range.end.character + 1,
  }
}
/**
 * Convert a Monaco editor position to an LSP range.
 *
 * @param position
 *   The Monaco position to convert.
 * @returns
 *   The position as an LSP position.
 */

export function monacoToLspPosition(position: monaco.IPosition): lsp.Position {
  return {character: position.column - 1, line: position.lineNumber - 1}
}
/**
 * Convert an LSP position to a Monaco editor position.
 *
 * @param position
 *   The LSP position to convert.
 * @returns
 *   The position as Monaco editor position.
 */

export function lspToMonacoPosition(position: lsp.Position): monaco.IPosition {
  return {lineNumber: position.line + 1, column: position.character + 1}
}

/**
 * Convert an LSP severity to a Monaco severity.
 *
 * @param severity LSP severity to convert.
 * @returns Monaco severity.
 */
export function lspToMonacoSeverity(severity: number | undefined): number {
  if (severity === 1) {
    return 8
  }

  if (severity === 2) {
    return 4
  }

  if (severity === 3) {
    return 2
  }

  return 1
}

/**
 * Convert an LSP 'CompletionItemKind' to a Monaco 'languages.CompletionItemKind'
 * LSP:    https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#completionItemKind
 * Monaco: https://microsoft.github.io/monaco-editor/typedoc/enums/languages.CompletionItemKind.html
 */
export function lspToMonacoCompletionItemKind(
  kind: lsp.CompletionItemKind | undefined,
): monaco.languages.CompletionItemKind {
  switch (kind) {
    case lsp.CompletionItemKind.Text:
      return monaco.languages.CompletionItemKind.Text
    case lsp.CompletionItemKind.Method:
      return monaco.languages.CompletionItemKind.Method
    case lsp.CompletionItemKind.Function:
      return monaco.languages.CompletionItemKind.Function
    case lsp.CompletionItemKind.Constructor:
      return monaco.languages.CompletionItemKind.Constructor
    case lsp.CompletionItemKind.Field:
      return monaco.languages.CompletionItemKind.Field
    case lsp.CompletionItemKind.Variable:
      return monaco.languages.CompletionItemKind.Variable
    case lsp.CompletionItemKind.Class:
      return monaco.languages.CompletionItemKind.Class
    case lsp.CompletionItemKind.Interface:
      return monaco.languages.CompletionItemKind.Interface
    case lsp.CompletionItemKind.Module:
      return monaco.languages.CompletionItemKind.Module
    case lsp.CompletionItemKind.Property:
      return monaco.languages.CompletionItemKind.Property
    case lsp.CompletionItemKind.Unit:
      return monaco.languages.CompletionItemKind.Unit
    case lsp.CompletionItemKind.Value:
      return monaco.languages.CompletionItemKind.Value
    case lsp.CompletionItemKind.Enum:
      return monaco.languages.CompletionItemKind.Enum
    case lsp.CompletionItemKind.Keyword:
      return monaco.languages.CompletionItemKind.Keyword
    case lsp.CompletionItemKind.Snippet:
      return monaco.languages.CompletionItemKind.Snippet
    case lsp.CompletionItemKind.Color:
      return monaco.languages.CompletionItemKind.Color
    case lsp.CompletionItemKind.File:
      return monaco.languages.CompletionItemKind.File
    case lsp.CompletionItemKind.Reference:
      return monaco.languages.CompletionItemKind.Reference
    case lsp.CompletionItemKind.Folder:
      return monaco.languages.CompletionItemKind.Folder
    case lsp.CompletionItemKind.EnumMember:
      return monaco.languages.CompletionItemKind.EnumMember
    case lsp.CompletionItemKind.Constant:
      return monaco.languages.CompletionItemKind.Constant
    case lsp.CompletionItemKind.Struct:
      return monaco.languages.CompletionItemKind.Struct
    case lsp.CompletionItemKind.Event:
      return monaco.languages.CompletionItemKind.Event
    case lsp.CompletionItemKind.Operator:
      return monaco.languages.CompletionItemKind.Operator
    case lsp.CompletionItemKind.TypeParameter:
      return monaco.languages.CompletionItemKind.TypeParameter
    default:
      return monaco.languages.CompletionItemKind.Text
  }
}
