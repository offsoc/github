const CLIPBOARD_ONLY_URL_COLUMN_ID = Symbol('clipboard-only_url_id')
const CLIPBOARD_ONLY_URL_COLUMN_DATA_TYPE = Symbol('clipboard-only_url_data-type')

/**
 * A 'fake' synthetic column that we inject in plain-text exports. Only exists in the clipboard world.
 */
export const ClipboardOnly_UrlColumnModel = {
  dataType: CLIPBOARD_ONLY_URL_COLUMN_DATA_TYPE,
  id: CLIPBOARD_ONLY_URL_COLUMN_ID,
  name: 'URL',
} as const

export const ClipboardActionTypes = {
  UPDATE_CLIPBOARD: 'UPDATE_CLIPBOARD',
  CLEAR_CLIPBOARD: 'CLEAR_CLIPBOARD',
} as const
