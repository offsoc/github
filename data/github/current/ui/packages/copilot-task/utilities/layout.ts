/**
 * Additional padding to add to the bottom of the page to account for the header.
 */
export const FOOTER_PADDING = 8

/**
 * Total height of Header.tsx in pixels. Needs to be manually kept in sync with the header's actual height.
 */
export const HEADER_HEIGHT = 48

/**
 * Total height of EditorHeader.tsx in pixels. Needs to be manually kept in sync with the editor header's actual height.
 */
export const EDITOR_HEADER_HEIGHT = 48

/**
 * Height of the content area.
 */
export const contentHeight = (offset: number) => `calc(100vh - ${HEADER_HEIGHT + FOOTER_PADDING + offset}px)`

export const treeHeightSx = (offset: number) => ({
  '@media screen and (min-width: 1012px)': {
    maxHeight: contentHeight(offset),
    height: contentHeight(offset),
  },
})

export const monacoEditorHeight = `calc(100% - ${EDITOR_HEADER_HEIGHT}px)`
