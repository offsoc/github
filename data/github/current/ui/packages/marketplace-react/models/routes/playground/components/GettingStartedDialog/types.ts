import type {MarkdownHeadingsTocItem, ShowModelPayload} from '../../../../../types'

export type LanguageTocItem = {
  name: string
  key: string
  active: boolean
}

export type ModelToc = {
  [language: string]: Language
}

export interface GettingStartedPayload extends ShowModelPayload {
  gettingStarted: Record<string, ShowModelGettingStartedPayloadLanguageEntry>
}

export type ShowModelGettingStartedPayloadLanguageEntry = {
  name: string
  sdks: Record<string, ShowModelGettingStartedPayloadSDKEntry>
}

export type ShowModelGettingStartedPayloadSDKEntry = {
  name: string
  content: string
  tocHeadings: MarkdownHeadingsTocItem[]
  codeSamples: string
}

export enum Feedback {
  UNKNOWN = 0,
  POSITIVE = 1,
  NEGATIVE = 2,
}

export type NegativeFeedbackReason = 'harmful' | 'untrue' | 'unhelpful' | 'other'

export type FeedbackState = {
  satisfaction: Feedback
  reasons: NegativeFeedbackReason[]
  feedbackText: string
  contactConsent: boolean
}
