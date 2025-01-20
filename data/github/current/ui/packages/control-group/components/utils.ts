export const getPaddingInlineStart = (nestedLevel: number) =>
  nestedLevel ? `calc(var(--base-size-12) * ${nestedLevel + 1})` : 'var(--base-size-12)'
