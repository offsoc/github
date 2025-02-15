import _MarkdownEditor from './MarkdownEditor'
import {DefaultToolbarButtons, Toolbar} from './Toolbar'
import {ToolbarButton} from './ToolbarButton'
import {ActionButton, Actions} from './Actions'
import {Footer, FooterButton} from './Footer'
import {Label} from './Label'

export type {MarkdownEditorHandle} from './MarkdownEditor'

export const MarkdownEditor = Object.assign(_MarkdownEditor, {
  /** REQUIRED: An accessible label for the editor. */
  Label,
  /**
   * An optional custom toolbar. The toolbar should contain `ToolbarButton`s before
   * and/or after a `DefaultToolbarButtons` instance. To create groups of buttons, wrap
   * them in an unstyled `Box`.
   */
  Toolbar,
  /**
   * A custom toolbar button. This takes `IconButton` props. Every toolbar button should
   * have an `aria-label` defined.
   */
  ToolbarButton,
  /**
   * The full set of default toolbar buttons. This is all the basic formatting tools in a
   * standardized order.
   */
  DefaultToolbarButtons,
  /** An optional custom footer to show below the editor. */
  Footer,
  /** A button to show in the editor footer before the `DefaultFooterButtons`, i.e.
   * the "Markdown is supported" button and file upload button in a standardized order. */
  FooterButton,
  /**
   * Optionally define a set of custom buttons to show in the footer. Often if you
   * are defining custom buttons you should also wrap the editor in a `<form>`. This
   * component should only contain `ActionButton`s.
   */
  Actions,
  /** A button to show in the editor footer after the `DefaultFooterButtons`, i.e.
   * the "Markdown is supported" button and file upload button in a standardized order. */
  ActionButton,
})

export type {MarkdownEditorProps} from './MarkdownEditor'
export type {Emoji} from './suggestions/use-emoji-suggestions'
export type {Mentionable} from './suggestions/use-mention-suggestions'
export type {Reference} from './suggestions/use-reference-suggestions'
export type {FileUploadResult, FileType} from './use-file-handling'
export type {SavedReply} from './SavedReplies'
