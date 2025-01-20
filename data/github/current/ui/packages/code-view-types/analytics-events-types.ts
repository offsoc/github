export type RepositoryUIEventTarget = RepositoryClickTarget | RepositoryStats

export type RepositoryStats = 'repository.find-file'

export type RepositoryClickTarget =
  | 'BRANCHES_BUTTON'
  | 'TAGS_BUTTON'
  | 'CONTRIBUTE_BUTTON'
  | 'AHEAD_BEHIND_LINK'
  | 'HISTORY_BUTTON'
  | 'NEW_FILE_BUTTON'
  | 'UPLOAD_FILES_BUTTON'
  | 'LATEST_COMMIT_SHA'
  | 'GO_TO_FILE'
  | 'FIND_SYMBOL'
  | SyncForkEvents
  | BlobEvents
  | BlobRawDropdownEvents
  | BlobEditDropdownEvents
  | MoreOptionsDropdownEvents
  | BlobSymbolsMenuEvents
  | BlobFindInFileMenuEvents
  | FilesTreeEvents
  | RefSelectorEvents
  | ContributorsEvents
  | OverviewBannerEvents

type SyncForkEvents =
  | 'SYNC_FORK_BUTTON'
  | 'SYNC_FORK.DISCARD'
  | 'SYNC_FORK.UPDATE'
  | 'SYNC_FORK.COMPARE'
  | 'SYNC_FORK.OPEN_PR'

type RefSelectorEvents = 'REF_SELECTOR_MENU' | 'REF_SELECTOR_MENU.CREATE_BRANCH'

type BlobEvents = 'BLOB.CODE_VIEW_MODE' | 'BLOB.BLAME_VIEW_MODE' | 'BLOB.LINE' | 'BLOB.MULTILINE'

type BlobRawDropdownEvents = 'BLOB_RAW_DROPDOWN' | 'BLOB_RAW_DROPDOWN.COPY' | 'BLOB_RAW_DROPDOWN.VIEW'

type BlobEditDropdownEvents =
  | 'BLOB_EDIT_DROPDOWN'
  | 'BLOB_EDIT_DROPDOWN.DEV_LINK'
  | 'BLOB_EDIT_DROPDOWN.IN_PLACE'
  | 'BLOB_EDIT_DROPDOWN.DESKTOP'

type MoreOptionsDropdownEvents =
  | 'MORE_OPTIONS_DROPDOWN'
  | 'MORE_OPTIONS_DROPDOWN.GO_TO_LINE'
  | 'MORE_OPTIONS_DROPDOWN.COPY_PATH'
  | 'MORE_OPTIONS_DROPDOWN.COPY_PERMALINK'

type BlobSymbolsMenuEvents =
  | 'BLOB_SYMBOLS_MENU.OPEN'
  | 'BLOB_SYMBOLS_MENU.OPEN_WITH_SYMBOL'
  | 'BLOB_SYMBOLS_MENU.FILTER_SYMBOLS'
  | 'BLOB_SYMBOLS_MENU.SYMBOL_DEFINITION_CLICK'
type BlobFindInFileMenuEvents =
  | 'BLOB_FIND_IN_FILE_MENU.OPEN'
  | 'BLOB_FIND_IN_FILE_MENU.FIND_IN_FILE'
  | 'BLOB_FIND_IN_FILE_MENU.FIND_IN_FILE_CLICK'
  | 'BLOB_FIND_IN_FILE_MENU.FIND_IN_FILE_FROM_SELECTION'
  | 'BLOB_FIND_IN_FILE_MENU.FALLBACK_TO_BROWSER_SEARCH'

type FilesTreeEvents =
  | 'FILES_TREE.SHOW'
  | 'FILES_TREE.HIDE'
  | 'FILES_TREE.ITEM'
  | 'FILE_TREE.SEARCH_BOX'
  | 'FILE_TREE.CANCEL_SEARCH'
  | 'FILE_TREE.SEARCH_RESULT_CLICK'

type ContributorsEvents =
  | 'CONTRIBUTORS.RECENT'
  | 'CONTRIBUTORS.LIST.OPEN'
  | 'CONTRIBUTORS.LIST.USER'
  | 'CONTRIBUTORS.LIST.COMMITS'

type OverviewBannerEvents = 'MARKETPLACE.ACTION.CLICK'
