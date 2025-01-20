// Fonts
export const Fonts = {
  PageHeadingFontSize: 4, // 24px
  SectionHeadingFontSize: 3, // 20px
  CardHeadingFontSize: 2, // 16px
  FontSizeNormal: '14px',
  FontSizeSmall: '12px',
}

// Spacing
export const Spacing = {
  // The standard spacing between cards in our UI
  CardMargin: 4, // 24px
  // The standard padding for elements in our UI. Typically used for cards
  StandardPadding: 3, // 16px
  // Smaller padding used for separating elements in a list
  SmallPadding: '12px',
}

// Borders
export const borderWidth = '1px'
export const borderStyle = 'solid'
export const borderColor = 'border.default'
export const borderRadius = 2

export const defaultBorderTop = {
  borderTopWidth: borderWidth,
  borderTopStyle: borderStyle,
  borderTopColor: borderColor,
}
export const defaultBorderBottom = {
  borderBottomWidth: borderWidth,
  borderBottomStyle: borderStyle,
  borderBottomColor: borderColor,
}
export const defaultBorderRight = {
  borderRightWidth: borderWidth,
  borderRightStyle: borderStyle,
  borderRightColor: borderColor,
}
export const defaultBorderLeft = {
  borderLeftWidth: borderWidth,
  borderLeftStyle: borderStyle,
  borderLeftColor: borderColor,
}
export const defaultBorder = {
  ...defaultBorderTop,
  ...defaultBorderBottom,
  ...defaultBorderRight,
  ...defaultBorderLeft,
}

// General Styles
export const boxStyle = {
  p: Spacing.StandardPadding,
  borderRadius,
  ...defaultBorder,
}

export const listStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  pt: Spacing.SmallPadding,
  mt: Spacing.SmallPadding,
  ...defaultBorderTop,
}

interface TableCellStyle {
  p: number
  '@media (min-width: 600px)': {
    width: string
  }
  '@media (max-width: 599px)': {
    width: string
  }
}

export const flexFill = {
  flex: 1,
}

export const cardHeadingStyle = {
  mb: 2,
  fontSize: Fonts.FontSizeNormal,
  fontWeight: 'normal',
  color: 'fg.default',
}

export const tableHeaderStyle = {
  bg: 'canvas.subtle',
  p: Spacing.StandardPadding,
  borderRadius,
}

export const tableRowStyle = {
  ...defaultBorderTop,
  p: Spacing.StandardPadding,
  '@media (max-width: 599px)': {
    display: 'flex',
    flexWrap: 'wrap',
  },
}

export const tableCellStyle = {
  p: 3,
  '@media (min-width: 600px)': {
    width: '100%',
  },
  '@media (max-width: 599px)': {
    width: '50%',
  },
}

export const getTableCellStyle = (defaultWidth: string): TableCellStyle => {
  return {
    p: 3,
    '@media (min-width: 600px)': {
      width: defaultWidth,
    },
    '@media (max-width: 599px)': {
      width: '50%',
    },
  }
}

export const pageHeadingStyle = {
  display: 'flex',
  font: 'var(--text-subtitle-shorthand)',
  fontSize: Fonts.PageHeadingFontSize,
}

export const tableContainerStyle = {
  textAlign: 'left',
  borderRadius,
  '@media (min-width: 600px)': {
    width: '100%',
  },
  '@media (max-width: 599px)': {
    display: 'flex',
    flexDirection: 'column',
  },
}
