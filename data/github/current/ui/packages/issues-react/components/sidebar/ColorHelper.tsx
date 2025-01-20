export const SUPPORTED_VIEW_COLORS = ['GRAY', 'BLUE', 'GREEN', 'ORANGE', 'RED', 'PINK', 'PURPLE']

export const VIEW_COLOR_BACKGROUND_MAP: Record<string, string> = {
  GRAY: 'var(--bgColor-neutral-muted, var(--color-neutral-subtle))',
  BLUE: 'var(--bgColor-accent-muted, var(--color-accent-subtle))',
  GREEN: 'var(--bgColor-success-muted, var(--color-success-subtle))',
  ORANGE: 'var(--bgColor-severe-muted, var(--color-severe-subtle))',
  RED: 'var(--bgColor-danger-muted, var(--color-danger-subtle))',
  PINK: 'var(--bgColor-sponsors-muted, var(--color-sponsors-subtle))',
  PURPLE: 'var(--bgColor-done-muted, var(--color-done-subtle))',
}

export const VIEW_COLOR_FOREGROUND_MAP: Record<string, string> = {
  GRAY: 'var(-fgColor-muted, var(--color-neutral-emphasis))',
  BLUE: 'var(--fgColor-accent, var(--color-accent-fg))',
  GREEN: 'var(--fgColor-success, var(--color-success-fg))',
  ORANGE: 'var(--fgColor-severe, var(--color-severe-fg))',
  RED: 'var(--fgColor-danger, var(--color-danger-fg))',
  PINK: 'var(--fgColor-sponsors, var(--color-sponsors-fg))',
  PURPLE: 'var(--fgColor-done, var(--color-done-fg))',
}
