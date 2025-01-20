export {DiffLines} from './components/DiffLines'
export {DiffFindPopover} from './components/DiffFindPopover'
export type {DiffFindRequest, FocusedSearchResult} from './hooks/use-diff-search-results'
export type {DiffLinesProps} from './components/DiffLines'
export {getBackgroundColor, HunkKebabIcon} from './components/DiffLineTableCellParts'

export {RichDiff} from './components/RichDiff'

export type {
  Comment,
  Comments,
  DiffEntryData,
  DiffLine,
  Thread,
  Threads,
  LineRange,
  CopilotChatFileDiffReferenceData,
} from './types'

export {SelectedDiffRowRangeContextProvider} from './contexts/SelectedDiffRowRangeContext'
export {useDiffFindOpen, DiffFindOpenProvider} from './contexts/DiffFindOpenContext'
export {parseAnnotationHash, parseCommentHash} from './helpers/document-hash-helpers'
export {useDiffSearchResults} from './hooks/use-diff-search-results'
export type {DiffMatchContent} from './helpers/find-in-diff'
export {findInDiffWorkerJob} from './helpers/find-in-diff'
