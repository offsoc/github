export type PullRequestsTargetType =
  | FILE_TREE_ELEMENTS
  | CONVERSATIONS_ELEMENTS
  | COMMITS_MENU_ELEMENTS
  | HEADER_ELEMENTS
  | SUBMIT_REVIEW_ELEMENTS
  | FILE_ENTRY_ELEMENTS
  | BLOB_ACTIONS_MENU_ELEMENTS
  | KEYBOARD_SHORTCUT
  | COMMENTS_ELEMENTS
  | COMMENT_ACTION_ELEMENTS
  | DIFF_VIEW_ELEMENTS
  | PULL_REQUEST_COMMENT_ELEMENTS
  | PAGE_VIEW

type FILE_TREE_ELEMENTS = 'FILE_TREE_TOGGLE' | 'FILE_TREE_ENTRY' | 'FILE_TREE_FILTER'
type CONVERSATIONS_ELEMENTS = 'CONVERSATIONS_MENU' | 'CONVERSATIONS_MENU_ITEM'
type COMMITS_MENU_ELEMENTS = 'COMMITS_MENU' | 'COMMITS_MENU_ITEM'
type HEADER_ELEMENTS =
  | 'HEADER_EDIT_BUTTON'
  | 'HEADER_EDIT_SAVE_BUTTON'
  | 'HEADER_EDIT_CANCEL_BUTTON'
  | 'HEADER_BASE_BRANCH_BUTTON'
  | 'HIDE_WHITESPACE_CHECKBOX'
  | 'COPY_HEAD_BRANCH_NAME_BUTTON'
type SUBMIT_REVIEW_ELEMENTS = 'REVIEW_CHANGES_BUTTON' | 'SUBMIT_REVIEW_BUTTON' | 'CANCEL_REVIEW_BUTTON'
type FILE_ENTRY_ELEMENTS =
  | 'FILE_EXPANDER_BUTTON'
  | 'FILE_COLLAPSE_BUTTON'
  | 'FILE_CHEVRON'
  | 'COPY_TO_CLIPBOARD_BUTTON'
  | 'MARK_FILE_VIEWED_BUTTON'
type BLOB_ACTIONS_MENU_ELEMENTS = 'BLOB_ACTIONS_MENU_ITEM'
type KEYBOARD_SHORTCUT = 'KEYBOARD_SHORTCUT'
type COMMENTS_ELEMENTS =
  | 'DIFF_LINE_PLUS_ICON'
  | 'REVIEW_THREAD_INPUT'
  | 'CANCEL_REVIEW_THREAD_BUTTON'
  | 'RESOLVE_CONVERSATION_BUTTON'
  | 'ADD_COMMENT_BUTTON'
  | 'REPLY_TO_THREAD_INPUT_BUTTON'
type COMMENT_ACTION_ELEMENTS = 'COMMENT_ACTION_MENU_ITEM'
type DIFF_VIEW_ELEMENTS = 'HIDE_WHITESPACE_CHECKBOX'
type PULL_REQUEST_COMMENT_ELEMENTS = 'PULL_REQUEST_COMMENT_SUBMIT_BUTTON' | 'PULL_REQUEST_COMMENT_CANCEL_BUTTON'
type PAGE_VIEW = 'PAGE_VIEW'

export type PullRequestsEventType =
  | FILE_TREE_EVENTS
  | CONVERSATIONS_MENU_EVENTS
  | COMMITS_MENU_EVENTS
  | HEADER_EDIT_EVENTS
  | HEADER_EVENTS
  | SUBMIT_REVIEW_EVENTS
  | FILE_ENTRY_EVENTS
  | BLOB_ACTIONS_MENU_EVENTS
  | KEYBOARD_SHORTCUT_EVENTS
  | FILE_TREE_FILTER_EVENTS
  | COMMENTS_EVENTS
  | COMMENT_ACTION_EVENTS
  | DIFF_VIEW_ACTIONS
  | PULL_REQUEST_COMMENT_EVENTS
  | PULL_REQUEST_EVENTS

type FILE_TREE_EVENTS = 'file_tree.open' | 'file_tree.close' | 'file_tree.file_selected'
type CONVERSATIONS_MENU_EVENTS = 'conversations_menu.open' | 'conversations_menu.select_conversation'
type COMMITS_MENU_EVENTS = 'commits_menu.open' | 'commits_menu.select_commit'
type HEADER_EDIT_EVENTS =
  | 'edit_pull_request.open'
  | 'edit_pull_request.save'
  | 'edit_pull_request.cancel'
  | 'edit_pull_request.select_base_branch'
type HEADER_EVENTS = 'header.copy_head_branch_name'
type SUBMIT_REVIEW_EVENTS = 'submit_review_dialog.open' | 'submit_review_dialog.submit' | 'submit_review_dialog.cancel'
type FILE_ENTRY_EVENTS =
  | 'file_entry.expand_all'
  | 'file_entry.collapse_all'
  | 'file_entry.collapse_file'
  | 'file_entry.copy_path'
  | 'file_entry.viewed'
  | 'file_entry.unviewed'
  | 'file_entry.expand_hunk'
type BLOB_ACTIONS_MENU_EVENTS = 'file_entry.view_file' | 'file_entry.edit_file' | 'file_entry.delete_file'
type KEYBOARD_SHORTCUT_EVENTS = 'comments.toggle_hide_all'
type FILE_TREE_FILTER_EVENTS = 'file_tree_filter.click_qualifier_value' | 'file_tree_filter.select_suggestion'
type COMMENTS_EVENTS =
  | 'comments.open_comment_form'
  | 'comments.start_thread_reply'
  | 'comments.cancel_thread_reply'
  | 'comments.resolve_thread'
  | 'comments.unresolve_thread'
  | 'comments.add'
type COMMENT_ACTION_EVENTS = 'comment_action.copy_link' | 'comment_action.edit' | 'comment_action.delete'
type DIFF_VIEW_ACTIONS = 'diff_view.toggle_whitespace'
type PULL_REQUEST_COMMENT_EVENTS = 'pull_request_comment.submit' | 'pull_request_comment.cancel'
type PULL_REQUEST_EVENTS = 'pull_request.viewed'
