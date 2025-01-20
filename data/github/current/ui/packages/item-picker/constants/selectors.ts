export const SELECTORS = {
  // This matches the attribute assigned to the active item within primers `SelectPanel`
  activePickerOption: (rootId: string) => `[data-id="${rootId}"] [data-is-active-descendant="activated-directly"]`,
}
