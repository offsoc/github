export const stickyHeaderHeightNumber = 57
export const stickyHeaderHeight = `${stickyHeaderHeightNumber}px`
export const filesChangedHeaderHeightNumber = 48
export const filesChangedHeaderHeight = `${filesChangedHeaderHeightNumber}px`
export const totalStickyHeaderHeight = stickyHeaderHeightNumber + filesChangedHeaderHeightNumber

export const filesChangedHeaderMargin = stickyHeaderHeight

export const fileStickyHeaderMargin = (offset = 0) =>
  `calc(${stickyHeaderHeight} + ${filesChangedHeaderHeight} + ${offset}px)`
