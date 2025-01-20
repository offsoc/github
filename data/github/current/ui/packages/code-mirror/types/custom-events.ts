import type {LintMarkSeverity} from '../decorations/lint-mark'

// loosely group up custom events for some generic type safety for emitToCodeMirror
export type CustomEventName = UploadEvents | SecretDetectedEvents
export type CustomEventDetail = UploadChangeDetail | UploadCursorChangeDetail | SecretDetectedLintEventDetail

export type UploadEvents = 'upload:editor:change' | 'upload:editor:cursor'

export interface UploadChangeDetail {
  state: 'uploading' | 'uploaded' | 'failed'
  placeholder: string
  replacementText: string
}

export interface UploadCursorChangeDetail {
  left: number
  top: number
}

export type SecretDetectedEvents = 'secret-detected:lint'

interface Position {
  lineNumber: number
  character: number
}

export interface SecretDetectedLintEventDetail {
  from: Position
  to: Position
  severity: LintMarkSeverity
}
