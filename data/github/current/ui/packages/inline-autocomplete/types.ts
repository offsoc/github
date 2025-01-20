import type {ActionListItemProps} from '@primer/react'

export type Trigger = {
  /** A single character that can cause the suggestion list to open. */
  triggerChar: string
  /**
   * Control whether the suggestion query can contain spaces. This should *not* be `true` if
   * `triggerChar` is a space.
   * @default false
   */
  multiWord?: boolean
  /**
   * Control whether the trigger character is retained when inserting a suggestion.
   * @default true
   */
  keepTriggerCharOnCommit?: boolean
}

export type SelectSuggestionsEvent = ShowSuggestionsEvent & {
  /** The suggestion that was selected. */
  suggestion: Suggestion
}

export type ShowSuggestionsEvent = {
  /** The trigger that caused this query. */
  trigger: Trigger
  /** The query string. */
  query: string
}

export type Suggestion =
  | string
  | {
      /**
       * The plain text value of the suggestion. This is the text that will be inserted when
       * the user applies the suggestion. If no `key` is provided, this value **must** be unique
       * across all currently visible suggestions.
       */
      value: string
      /**
       * Optional key. If not provided, the `value` will be used. Setting a `key` allows
       * for non-unique `value`s.
       */
      key?: string
      /** This must return an `ActionList.Item` instance. */
      render: (props: ActionListItemProps) => React.ReactElement
    }

export type Suggestions = Suggestion[] | 'loading'

export type TextInputElement = HTMLInputElement | HTMLTextAreaElement

export type TextInputCompatibleChild = React.ReactElement<
  JSX.IntrinsicElements['textarea'] | JSX.IntrinsicElements['input']
> &
  React.RefAttributes<HTMLInputElement & HTMLTextAreaElement>

export type SuggestionsPlacement = 'above' | 'below'

export type FirstOptionSelectionMode = 'selected' | 'active' | 'none'

export type TriggerAndSuggestions = {
  trigger: Trigger
  suggestionsCalculator: (query: string) => Promise<Suggestions>
}
