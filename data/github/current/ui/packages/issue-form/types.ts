import type {CommentBoxConfig} from '@github-ui/comment-box/CommentBox'
import type {Subject} from '@github-ui/comment-box/subject'
import type {CheckboxesElementInternalProps} from './elements/CheckboxesElement'
import type {DropdownElementInternalProps} from './elements/DropdownElement'
import type {MarkdownElementInternalProps} from './elements/MarkdownElement'
import type {TextAreaElementInternalProps} from './elements/TextAreaElement'
import type {TextInputElementInternalProps} from './elements/TextInputElement'

export type IssueFormRef = {
  markdown: () => string
  getInvalidInputs: () => IssueFormElementRef[]
  resetInputs: () => void
  hasChanges: () => boolean
  clearSessionStorage: () => void
}
export type IssueFormElementRef = {
  focus: () => void
  markdown: () => string
  validate: () => boolean
  reset: () => void
  hasChanges: () => boolean
  getSessionStorageKey: () => string
}

export type IssueFormElement =
  | TextInputElementInternalProps
  | TextAreaElementInternalProps
  | MarkdownElementInternalProps
  | DropdownElementInternalProps
  | CheckboxesElementInternalProps

export type CommentBoxProps = {
  subject: Subject
  commentBoxConfig?: CommentBoxConfig
}

export type DefaultValuesById = {
  defaultValuesById?: Record<string, string>
}

export type SessionStorageProps = {
  sessionStorageKey: string
}

export type SharedElementProps = DefaultValuesById & SessionStorageProps

export type GraphqlFragment<T> = OptionalAndNullable<Omit<T, ' $fragmentType' | '__id'>>

// We want to convert graphQL nullable types to being optional values in TypeScript
type OptionalAndNullable<T> = {
  [P in keyof PickNullable<T>]?: T[P]
} & {[P in keyof PickNotNullable<T>]: T[P]}

type PickNullable<T> = {
  [P in keyof T as null extends T[P] ? P : never]: T[P]
}

type PickNotNullable<T> = {
  [P in keyof T as null extends T[P] ? never : P]: T[P]
}
