import {MAX_NESTED_GROUPS} from './filter-constants'

export const Strings = {
  filterInvalid: (number: number) => `Filter contains ${number} issue${number === 1 ? '' : 's'}:`,
  filterBlockInvalid: (block: string) => `${block} is invalid`,
  filterProviderNotSupported: (filterName: string) => `Filter '${filterName}' not supported`,
  filterProviderDeprecated: (filterName: string) =>
    `Filter '${filterName}' is deprecated and will be removed in the future`,
  filterValueEmpty: (provider: string) => `Empty value for <pre>${provider}</pre>`,
  filterMultiValueFalse: (provider: string) => `Only one value allowed for <pre>${provider}</pre>`,
  filterInvalidValue: (provider: string, value: string) =>
    `Invalid value <pre>${value}</pre> for <pre>${provider}</pre>`,
  unbalancedQuotations: 'Unbalanced quotation marks',
  unbalancedParentheses: 'Unbalanced parentheses',
  maxNestedGroups: `Maximum nested groups of ${MAX_NESTED_GROUPS} exceeded`,
  advancedFilterDialogCloseConfirmation: {
    title: 'Discard changes?',
    content: 'You have unsaved changes. Are you sure you want to discard them?',
    cancelButtonContent: 'Keep editing',
    confirmButtonContent: 'Close and discard',
  },
  exclude: 'Exclude',
  dividerValue: '%%DIVIDER%%',
}
