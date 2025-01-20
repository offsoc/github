// Fonts
export const Fonts = {
  PageHeadingFontSize: 4,
}

// Spacing
export const Spacing = {
  StandardPadding: 3,
}

export const pageHeadingStyle = {
  display: 'flex',
  font: 'var(--text-subtitle-shorthand)',
  fontSize: Fonts.PageHeadingFontSize,
}

export const dialogBoxStyle = {
  p: Spacing.StandardPadding,
}

export const blankslateStyle = {
  border: '1px solid var(--borderColor-default, var(--color-border-default))',
  borderRadius: '6px',
}

export const tableGapStyle = {
  mt: Spacing.StandardPadding,
  display: 'flex',
  flexDirection: 'column',
  gap: Spacing.StandardPadding,
}

export const breadcrumbLink = {
  cursor: 'pointer',
}
