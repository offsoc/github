import type {SxProp} from '@primer/react'

export const filesChangedHeaderHeightNumber = 64 //split page layout padding normal
export const mobileFilesChangedHeaderHeightNumber = 56 //split page layout padding condensed (when < 768px)
export const stickyHeaderHeight = 60 // height to be used when scrolling to a PR, the 4px difference looks nicer

export const fileStickyHeaderMargin = (filesChangedHeaderHeight: number, offset = 0) =>
  `calc(${filesChangedHeaderHeight}px + ${offset}px)`

export const stickyDiffHeaderSx: SxProp['sx'] = {
  position: 'sticky',
  zIndex: 1,
  // backgroundColor, pl, pr, ml, mr values are being used here to hide the actionbar element behind right side of the DiffFileHeaderListView
  // when it intersects with the DiffFileHeaderListView on the right side of the DiffEntry
  backgroundColor: 'canvas.default',
  // :before is used to cover up scrolling content behind the sticky header rounded corners
  // it also needs to go beyond the parent border to cover box shadow from the parent
  '&::before': {
    bg: 'canvas.default',
    content: '""',
    position: 'absolute',
    display: 'block',
    height: '100%',
    width: 'calc(100% + 30px)', // Would be set to 32px but we need to offset the left border to address resizable sidebar
    ml: '-14px', // Need to use a magic variable to make sure negative margin does not overlap with resizable sidebar from the navigation
    mr: -3,
  },
}
