import {format, formatDistanceToNow} from 'date-fns'

import {MemexColumnDataType} from './api/columns/contracts/memex-column'
import {ItemType} from './api/memex-items/item-type'
import type {RoadmapZoomLevel} from './api/view/contracts'
import {ToastType} from './components/toasts/types'
import {joinOxford} from './helpers/join-oxford'
import type {META_QUALIFIERS} from './helpers/meta-qualifiers'
import type {ConfirmationSource} from './helpers/workflow-utilities'
import type {ConfirmOptions} from './hooks/use-alert'
import {formatDateUtc} from './pages/roadmap/date-utils'

const singularOrPlural = (count: number, singular: string, plural: string) => (count === 1 ? singular : plural)
export const Resources = {
  accessProhibited: 'Access prohibited',
  betaSignupSuccessMessage: 'This project has been added to the waitlist. Thank you for your interest!',
  betaOptoutInformation:
    'If the project exceeds 1200 items and is opted out, only the initial 1200 items will be visible. To restore usability, archive items to stay below the 1200 limit.',
  betaOptoutConfirmation: {
    title: 'Opt out of increased project items?',
    content: 'Are you sure you want to opt out of increased project items? This cannot be undone.',
    cancelButtonContent: 'Cancel',
    confirmButtonContent: 'Opt out',
  },
  betaOptoutSuccessMessage:
    'You have successfully opted out of the beta program. Note that it may take up to 1 minute for the changes to take effect.',
  betaOptoutFailureMessage:
    'Failed to opt out of the beta program. Please try again or contact support if you continue to have problems.',
  addColumnNameValue: (columnName: string) => `Add ${columnName.toLowerCase()}…`,
  addItem: 'Add item',
  updateTitleLabel: 'Update project title',
  archiveGroupItemsConfirmationMessage: (itemsCount: number) =>
    `Are you sure you want to archive ${singularOrPlural(itemsCount, 'this item', `${itemsCount} items`)}?`,
  deleteGroupItemsConfirmationMessage: (itemsCount: number) =>
    `Are you sure you want to delete ${singularOrPlural(
      itemsCount,
      'this item',
      `${itemsCount} items`,
    )} from the project?`,
  archiveGroupItemsConfirmationTitle: `Archive all items?`,
  deleteGroupItemsConfirmationTitle: `Delete all items?`,
  cannotAddItemsWhenGroupByMilestone: 'Cannot add items when grouped by milestone',
  cannotAddItemsWhenGroupByRepository: 'Cannot add items when grouped by repository',
  cannotAddItemsWhenGroupByIssueType: 'Cannot add items when grouped by type',
  cannotAddType: 'Cannot add type',
  cannotEditTitle: 'Update permissions',
  cannotEditItemContent:
    "You can't edit this item because it belongs to a repository that you don't have write-access to.",
  cannotAddAssigneesToDraftContent: 'Convert this draft to an issue to add an assignee',
  confirmDialog: 'Got it!',
  iterationLabel: {
    current: 'Current',
    planned: 'Planned',
    completed: 'Completed',
    break: 'Break',
  },
  cannotReorderForSortMessage: 'Cannot reorder items between sorted values',
  cannotReorderForSortAction: 'Remove sorting',
  changesSaved: 'Changes saved',
  columnLimitExceeded: 'Column limit is too large, must be less than 1,000,000.',
  createNewItemOrAddExistingIssueAriaLabel: 'Create new item or add existing item',
  dateEditor: 'Date editor',
  defaultArchiveConfirmationMessage: (pluralize: boolean, itemCount: number) =>
    `Are you sure you want to archive ${pluralize ? `these ${itemCount} items` : 'this item'}?`,
  defaultArchiveConfirmationTitle: (pluralize: boolean) => `Archive item${pluralize ? 's' : ''}?`,
  deleteFieldDialogTitle: 'Delete field?',
  deleteField: (field: string) => `This will delete the field “${field}”`,
  draftConvertPromptDescription: 'Convert to issue to edit this cell',
  draftConvertPromptTitle: 'Convert to issue',
  duplicateView: ({isDirty}: {isDirty: boolean}) => (isDirty ? 'Save changes to new view' : 'Duplicate view'),
  edit: 'Edit',
  editTitle: 'Edit title',
  emptyColumnNameValue: {
    number: 'Enter a number…',
    text: 'Enter text…',
    date: 'Enter a date…',
    iteration: 'Choose an iteration…',
    singleSelect: 'Choose an option…',
    linkedPullRequest: 'No linked pull requests',
  },
  excludeSuggestion: 'Exclude',
  fieldMustBeAnInteger: 'This field must be an integer',
  fieldMustBePositiveOrZero: 'This field must be positive or 0.',
  filterByKeyboardOrByField: 'Filter by keyword or by field',
  genericErrorMessage: 'Sorry, something went wrong',
  genericFormErrorMessage: 'This form has errors',
  groupHeaderMenu: (groupName: string, isColumn: boolean) =>
    `Actions for ${isColumn ? 'column' : 'group'}: ${groupName}`,
  invalidFieldValues: ({name, value, fields}: {name: string; value: string; fields: string}) =>
    `Invalid \`${name}\`: ${value}. ${fields} are acceptable values for \`${name}\``,
  issue: 'issue',
  sidePanelRegionNameLabel: 'Side panel',
  sidePanelProjectInfoLabel: 'Project information',
  sidePanelBulkAddLabel: 'Add items to project',
  sidePanelItemNotSupported: 'Pull requests are not currently supported in the side panel.',
  sidePanelItemNotFound: "The item is not in the project, or you don't have access to view it.",
  sidePanelCloseConfirmation: {
    title: 'Discard changes?',
    content: 'You have unsaved changes. Are you sure you want to discard them?',
    cancelButtonContent: 'Keep editing',
    confirmButtonContent: 'Close and discard',
  },
  sidePanelPinLabel: 'Pin side panel',
  sidePanelUnpinLabel: 'Unpin side panel',
  sidePanelToolbarLabel: 'Side panel controls',
  sidePanelCopyPermalink: 'Copy project item permalink',
  issueButtonLabel: {
    closeIssue: 'Close issue',
    reopenIssue: 'Reopen',
    closeWithComment: 'Close with comment',
    reopenWithComment: 'Reopen and comment',
    reopenIssueLong: 'Reopen issue',
    closeAsCompleted: 'Close as completed',
    closeAsCompletedDescription: 'Done, closed, fixed, resolved',
    closeAsNotPlanned: 'Close as not planned',
    closeAsNotPlannedDescription: 'Won’t fix, can’t repro, duplicate, stale',
  },
  issueSideButtonMoreOptionsLabel: 'More options',
  iterationCustomModelError: 'Iteration editor requires a custom model',
  iterationDurationQtyLow: (minAllowedValue: number) => `Iteration length must be ${minAllowedValue} or more`,
  iterationDurationQtyHigh: (maxAllowedValue: number) => `Iteration length must be ${maxAllowedValue} or less`,
  iterationDurationLabel: 'Duration',
  iterationNotFound: 'Iteration not found',
  iterationStartDateLabel: 'Starts on',
  jumpToBottom: 'Jump to bottom',
  joinBeta: 'Join beta',
  joinWaitlist: 'Join waitlist',
  killSwitchEnabledToastMessage:
    'Increased items beta temporarily disabled for server maintenance. Please refresh the page.',
  killSwitchEnabledBanner:
    'Note: The increased project items beta is temporarily disabled for server maintenance. Rest assured, no data will be lost during this time. Please refresh your browser after a few minutes to regain full functionality.',
  mwlReEnabledBanner: 'The increased project items beta has been re-enabled. Please refresh the page.',
  killSwitchDisabledToastMessage: 'Increased items beta has been re-enabled. Please refresh the page.',
  newField: 'New Field',
  newItemAddedToBottomOfColumn: 'The new item has been added to the bottom of the column.',
  newItemAddedToBottomOfRoadmap: 'The new item has been added to the bottom of the roadmap.',
  newItemAddedToBottomOfTable: 'The new item has been added to the bottom of the table.',
  newItemFilterWarning: "The new item is hidden by this view's filters.",
  viewItem: 'Open item',
  newItemFindIssuePlaceholder: (canCreateIssue: boolean) =>
    canCreateIssue
      ? 'Search issues and pull requests, create a new issue, or add multiple items'
      : 'Search issues and pull requests, or add multiple items',
  newItemPlaceholder: 'Start typing to create a draft, or type # to select a repository',
  newItemPlaceholderAriaLabel: 'Start typing to create a draft, or type hashtag to select a repository',
  newIterationField: (number: string) => `Iteration${number}`,
  newOptionsCount: 'New options count',
  noPermissionEmptyColumnValue: (columnName: string) => `No ${columnName}`,
  noDescriptionProvided: 'No description provided',
  noProjectLimitBanner:
    'This project is enrolled in the Projects without Limits beta, and some functionality is under development. Please share feedback in this',
  noProjectLimitWaitlistBanner:
    'This project is nearing the 1,200 item limit. Join the waitlist for the beta to unlock unlimited items for this project.',
  noProjectLimitWaitlistStaffshipBanner: 'Would you like to join the beta for unlimited items for this project?',
  noneYet: 'None yet',
  hasSuggestion: 'Has',
  noSuggestion: 'No',
  numberEditor: 'Number editor',
  projectNameRequired: 'Project name is required.',
  projectSettingsSaved: 'Project settings saved successfully',
  pullRequest: 'pull request',
  repoArchivedErrorMessage: "You can't edit this field because this repository is archived",
  repoIsEmpty: 'This repository is either empty or all items were already added to this project.',
  repoListInstructions: 'Pick a repository to add issues and pull requests from',
  repoListTitle: 'Select a repository',
  repoPickerFilterPlaceholder: 'Search repositories',
  requiredFieldErrorMessage: 'Field name is required.',
  requiresCustomColumn: 'requires a custom column',
  reviewersCount: (count: number) => `${count} reviewer${count > 1 ? 's' : ''}`,
  progressCount: ({percent, total}: {percent: number; total: number}) => `${percent}% of ${total}`,
  progressScalarCount: ({completed, total}: {completed: number; total: number}) => `${completed} of ${total} completed`,
  progressPercentCount: (percentage: number) => `${percentage}% completed`,
  noItemsInSearchResult: "We couldn't find any items matching that search query.",
  singleSelectCustomModelError: 'Single select editor requires a custom model',
  singleSelectOptionLimitWarning: (count: number) => `Maximum of ${count} options reached`,
  clearFilter: 'Clear filter',
  discardChanges: 'Discard',
  saveChanges: 'Save',
  cancelChanges: 'Cancel',
  saveToNewChart: 'Save to new chart',
  saveFilter: 'Save filter',
  selectRepo: 'Select repository',
  set: 'Set',
  reset: 'Reset',
  selectionMaximumExceeded: (maximum: number) =>
    `More than ${maximum} cells are selected. Deselect some cells to perform bulk edits.`,
  sortBy: 'Sort by',
  statusFieldEmptyError: 'Error: At least one valid option is required for the status field',
  sortDatesAscending: 'Ascending order: oldest...newest',
  sortDatesDescending: 'Descending order: newest...oldest',
  sortNumbersAscending: 'Ascending order: 123...',
  sortNumbersDescending: 'Descending order: ...321',
  sortSingleSelectAscending: 'Ascending order: first...last',
  sortSingleSelectDescending: 'Descending order: last...first',
  sortStringsAscending: 'Ascending order: A...Z',
  sortStringsDescending: 'Descending order: Z...A',
  tableHeaderContextMenu: {
    selectColumn: 'Select column',
    sortAscending: 'Sort ascending',
    sortAscendingActive: 'Sorted ascending',
    sortDescending: 'Sort descending',
    sortDescendingActive: 'Sorted descending',
    filterValues: 'Filter by values…',
    filterByType: 'Filter by type or state…',
    groupByValues: 'Group by values',
    groupByActive: 'Grouped by field',
    sliceByValues: 'Slice by values',
    hideField: 'Hide field',
    fieldSettings: 'Field settings…',
  },
  textEditor: 'Text editor',
  titleCannotBeBlank: 'Title cannot be blank',
  titleContainsReservedColonCharacter: "Field name can't contain colons",
  titleHasAlreadyBeenTaken: 'This field name has already been taken',
  titleIsReserved: 'This field name is a reserved word',
  unableToAssignUsersToConvertedIssue: (logins: Array<string>) =>
    `Unable to assign the following users to the converted issue: ${logins.join(', ')}`,
  unableToPasteLabelsBetweensRepos: 'Labels can only be copied within the same repository',
  unableToPasteAssigneesBetweensRepos: 'Assignees can only be copied within the same repository',
  unableToPasteMilestonesBetweensRepos: 'Milestones can only be copied within the same repository',
  unableToPasteIssueTypesBetweensRepos: 'Issue types can only be copied within the same repository',
  unableToPasteLabelsOnDraftIssue: 'Labels cannot be applied to draft issues',
  unableToPasteMilestonesOnDraftIssue: 'Milestones cannot be applied to draft issues',
  unableToPasteIssueTypesOnDraftIssue: 'Issue types cannot be applied to draft issues',
  unableToPasteIssueTypesOnPullRequest: 'Issue types cannot be applied to pull requests',
  unableToPasteParentIssueOnDraftIssue: 'Parent issues cannot be applied to draft issues',
  unableToPasteParentIssueOnPullRequest: 'Parent issues cannot be applied to pull requests',
  unableToPasteMismatchedDataTypes: 'Cannot paste data of different types',
  updateColumnOptionsFailed: 'Column options failed to update.',
  forbiddenErrorMessage: "You don't have permission to edit this field.",
  undefined: 'undefined' as const,
  unsortBy: 'Unsort by',
  untitledProject: 'Untitled project',
  untitledUserProject: (user: string) => `@${user}'s untitled project`,
  viewNameRequired: 'View name cannot be empty',
  removeTitle: 'Remove',
  resultCount: (num: number) => `${num} result${num === 1 ? '' : 's'}.`,
  itemType: (itemType: ItemType) => {
    switch (itemType) {
      case ItemType.Issue:
        return 'Issue'
      case ItemType.PullRequest:
        return 'Pull request'
      case ItemType.DraftIssue:
        return 'Draft issue'
      case ItemType.RedactedItem:
        return 'Unknown item'
    }
  },
  dismissNoticeError: 'Could not dismiss notice. Please try again.',
}

export const HistoryResources = {
  updateItem: 'update item',
  updateItems: 'update items',
  delete: 'delete',
  paste: 'paste',
  fillCells: 'fill cells',
  archive: (count: number) => singularOrPlural(count, 'archive item', 'archive items'),
  moveItem: 'move item',
}

export const RouteTitleResources = {
  item: (title: string, itemTitle: string) => `${itemTitle} · ${title}`,
  view: (title: string, name?: string) => (name ? `${name} · ${title}` : title),
  archive: (title: string) => `Archive · ${title}`,
  settings: (title: string, name?: string) => (name ? `${name} · Settings · ${title}` : `Settings · ${title}`),
  workflows: (title: string) => `Workflows · ${title}`,
  insights: (title: string) => `Insights · ${title}`,
}

export const TopBarResources = {
  insightsButton: 'Insights',
  projectDetailsButton: 'Project details',
  viewMoreOptions: 'View more options',
}

export const MilestoneResources = {
  closed: 'Closed',
  noDueDate: 'No due date',
  addedUnsupportedItemToast: 'Drafts can’t be added with a milestone. Item was added to No milestone group',
  pastDueBy: (milestoneDueDate: Date) => `Past due by ${formatDistanceToNow(milestoneDueDate)}`,
  dueOn: (milestoneDueDate: Date) => `Due by ${format(milestoneDueDate, 'MMMM d, yyyy')}`,
}

export const FilterQueryResources = {
  invalidFilterQuotes: `Invalid filter: Unmatched quotation mark`,
  updatedValueErrorMessage:
    'Supported format is <@today-X, where X is a number and unit. Unit can be one of d,w or m ex: 7d',
  lastUpdatedValueErrorMessage: 'Supported format is XXdays (except 0days)',
  unknownFieldFilter: (field: string) => `Invalid filter: Unknown field name "${field}"`,
  noIterationMatch: (iterationValue: string, fieldName: string) =>
    `Invalid value: "${iterationValue}" doesn't match any iterations in the "${fieldName}" field`,
  noOptionsMatch: (optionsValue: string, fieldName: string) =>
    `Invalid value: "${optionsValue}" doesn't match options for the "${fieldName}" field`,
  invalidNumberValue: (value: string) => `Invalid value: "${value}" is not a number`,
  invalidDateValue: (value: string) => `Invalid value: "${value}" is not a valid date (must be formatted YYYY-MM-DD)'`,
  invalidQualifier: (value: Array<string>, expectedValues: ObjectValues<typeof META_QUALIFIERS>) =>
    `Invalid value: "${value.join(', ')}" does not match the supported values "${joinOxford(
      Object.values(expectedValues),
      'or',
    )}"`,
}

const valueNoun = (fieldType: MemexColumnDataType): [string, string] =>
  fieldType === MemexColumnDataType.SingleSelect
    ? ['option', 'options']
    : fieldType === MemexColumnDataType.Iteration
      ? ['iteration', 'iterations']
      : ['value', 'values']

export const SettingsResources = {
  deleteProjectWarning: 'Unexpected bad things will happen if you don’t read this!',
  deleteProjectTitle: 'Are you absolutely sure?',
  deleteProjectConfirmation: 'I understand the consequences, delete this project',
  deleteProjectInputLabel: 'Type in the name of the project to confirm that you want to delete this project.',
  noIterationsTitle: "You're out of iterations.",
  noIterationsDescription: 'Create an iteration using the "+ Add iteration" button above.',
  noCompletedIterationsTitle: 'No completed iterations.',
  noCompletedIterationsDescription: 'Iterations will automatically move here over time.',
  organizationOwnedProjectVisibilityRestriction: 'Only organization owners can change project visibility.',
  projectIsPublic: 'This project is currently public.',
  projectIsPrivate: 'This project is currently private.',
  projectIsInternal: 'This project is currently internal to your enterprise.',
  unselectCollaborator: (name: string) => `Unselect ${name}`,
  selectCollaborator: (name: string) => `Select ${name}`,
  userOwnedProjectVisibilityRestriction: 'Only admins can change project visibility.',
  willPushActiveIterations: (n: number) =>
    `${n} active ${n === 1 ? 'iteration' : 'iterations'} will also be pushed forward.`,
  /** Examples: Delete option?, Delete 12 options?, Delete iteration? */
  deleteValuesTitle: (fieldType: MemexColumnDataType, valuesCount: number) =>
    `Delete ${singularOrPlural(valuesCount, valueNoun(fieldType)[0], `${valuesCount} ${valueNoun(fieldType)[1]}`)}?`,
  /** Example: This will permanently delete these iterations from the "Iteration" field. */
  deleteValuesIntro: (fieldType: MemexColumnDataType, fieldName: string, valuesCount: number) =>
    `This will permanently delete ${singularOrPlural(
      valuesCount,
      `this ${valueNoun(fieldType)[0]}`,
      `these ${valueNoun(fieldType)[1]}`,
    )} from the "${fieldName}" field.`,
  /** Example: The option will be cleared from 12 items in this project. */
  deleteValuesAffectedItemsWarning: (fieldType: MemexColumnDataType, valuesCount: number, affectedItemsCount: number) =>
    `The ${singularOrPlural(
      valuesCount,
      ...valueNoun(fieldType),
    )} will be permanently deleted from ${affectedItemsCount} ${singularOrPlural(
      affectedItemsCount,
      'item',
      'items',
    )} in this project.`,
  deleteIterationValuesIntro: (fieldName: string, valuesCount: number) =>
    `This will permanently delete ${singularOrPlural(
      valuesCount,
      `this iteration value`,
      `these iteration values`,
    )} from the "${fieldName}" field.`,
  deleteIterationValuesAffectedItemsWarning: (valuesCount: number, affectedItemsCount: number) =>
    `${singularOrPlural(
      valuesCount,
      `This iteration value`,
      `These iteration values`,
    )} will be removed from ${affectedItemsCount} ${singularOrPlural(
      affectedItemsCount,
      'item',
      'items',
    )} in this project.`,
  cannotBeUndone: 'This cannot be undone.',
}

export const ItemUpdateValidationResources = {
  Repository: {
    Alerts: {
      NeedsConversion: {
        title: Resources.draftConvertPromptTitle,
        content: 'Convert this draft to an issue to add it to this repository',
        confirmButtonContent: Resources.confirmDialog,
      },
      CannotTransferPulls: {
        title: 'Unable to transfer pull request',
        content: 'Pull requests cannot be moved between repositories.',
        confirmButtonContent: Resources.confirmDialog,
      },
      IssueNeedsTransfer: {
        title: 'Transfer issue',
        confirmButtonContent: Resources.confirmDialog,
      },
    },
  },
  Milestone: {
    Alerts: {
      NeedsConversion: {
        title: Resources.draftConvertPromptTitle,
        content: 'Drafts can’t be added to milestones. Convert this draft to an issue to add it to a milestone.',
        confirmButtonContent: Resources.confirmDialog,
      },
      NeedsTransfer: {
        title: 'New milestone required',
        confirmButtonContent: Resources.confirmDialog,
      },
    },
  },
  IssueType: {
    Alerts: {
      NeedsConversion: {
        title: Resources.cannotAddType,
        content: 'Convert this draft to an issue to add an issue type.',
        confirmButtonContent: Resources.confirmDialog,
      },
      CannotAssignPulls: {
        title: Resources.cannotAddType,
        content: 'Pull requests cannot have an issue type.',
        confirmButtonContent: Resources.confirmDialog,
      },
      NoTypesForRepo: {
        title: Resources.cannotAddType,
        content: 'Issue types are excluded from this repository.',
        confirmButtonContent: Resources.confirmDialog,
      },
      NeedsTransfer: {
        title: Resources.cannotAddType,
        confirmButtonContent: Resources.confirmDialog,
      },
    },
  },
}

export const WorkflowResources = {
  editWorkflow: 'Edit',
  saveWorkflow: 'Save and turn on workflow',
  discardWorkflow: 'Discard',
  deleteWorkflow: 'Delete',
  readOnlyLabel: 'Viewing mode. Click edit to make changes to this workflow.',
  duplicateWorkflowName: 'A workflow with this name already exists',
  emptyFilterDefault: 'Filter cannot be empty',
  emptyFilterAutoAdd: 'An empty filter will match all newly created and updated Issues and Pull Requests',
  emptyWorkflowName: 'Workflow name cannot be empty',
  invalidActionField: 'A valid field is required',
  invalidActionFieldValue: 'A valid value is required',
  invalidNoAction: 'An action is required',
  invalidNoContentType: 'A type is required',
  invalidNoQuery: 'A query is required',
  invalidNoQueryOrFieldId: 'A query or a field id is required',
  invalidNoRepository: 'A repository is required',
  invalidNoValue: 'A value is required',
  workflowNameTooLong: 'Workflow name cannot be longer than 250 characters',
  invalidQuery: 'Filter contains invalid syntax',
  isClosed: 'is:closed',
  isMerged: 'is:merged',
  isNewlyAdded: 'is added',
  isReopened: 'is:reopened',
  addItemBlockLabel: 'Add the item to the project',
  addSubIssuesBlockLabel: 'Add sub-issues to the project',
  closeItemBlockLabel: 'Close the issue',
  getItemsBlockLabel: 'When the filter matches a new or updated item',
  getSubIssuesBlockLabel: 'When an item in the project has sub-issues',
  itemAddedToProjectLabel: 'When an item is added to the project',
  itemReopenedLabel: 'When an item is reopened',
  itemClosedLabel: 'When an item is closed',
  codeChangesRequestedLabel: 'When a pull request has a review requesting changes',
  codeReviewApprovedLabel: 'When a pull request is approved',
  pullRequestMergedLabel: 'When a pull request is merged',
  autoArchiveItemsLabel: 'Filter items',
  projectItemColumnUpdateLabel: 'When the status is updated',
  setValueLabel: 'Set value',
  selectContentType: 'Select a content type',
  archiveItemLabel: 'Archive item',
  autoAddManualTip:
    'Going forward, all new or updated items that match your filter will be auto added. You can also manually add items that currently match your filter',
  manualRunConfirmationButton: (confirmationSource: ConfirmationSource) =>
    confirmationSource === 'update'
      ? 'Update workflow'
      : confirmationSource === 'disable'
        ? 'Disable workflow?'
        : 'Save and enable',
  manualRunConfirmationMessage: (confirmationSource: ConfirmationSource, itemCount?: number) =>
    confirmationSource === 'disable'
      ? 'You have to disable this workflow to be able to edit this field.'
      : `${
          confirmationSource === 'update' ? 'Updating' : 'Enabling'
        } this workflow will archive <strong>${itemCount}</strong> item${
          itemCount && itemCount > 1 ? 's' : ''
        } that currently meet the filter conditions.
      <br><br>As future items match filter conditions, they will be automatically archived.`,
  manualRunConfirmationTitle: (confirmationSource: ConfirmationSource) =>
    confirmationSource === 'update'
      ? 'Update workflow?'
      : confirmationSource === 'disable'
        ? 'Disable workflow?'
        : 'Enable workflow?',
  reviewApproved: 'review:approved',
  /** Example: This option is used in 3 workflows. Deleted it will disable the workflows and invalidate any actions referencing them. */
  deleteValuesAffectedWorkflowsWarning: (
    fieldType: MemexColumnDataType,
    valuesCount: number,
    affectedWorkflowsCount: number,
  ) =>
    `${singularOrPlural(
      valuesCount,
      `This ${valueNoun(fieldType)[0]} is`,
      `These ${valueNoun(fieldType)[1]} are`,
    )} used in ${affectedWorkflowsCount} ${
      affectedWorkflowsCount === 1 ? 'workflow' : 'workflows'
    }. Deleting ${singularOrPlural(valuesCount, 'it', 'them')} will disable the ${singularOrPlural(
      affectedWorkflowsCount,
      'workflow',
      'workflows',
    )} and invalidate any actions referencing ${singularOrPlural(valuesCount, 'it', 'them')}.`,
  reviewChangesRequested: 'review:changes_requested',
  deleteWorkflowError: 'Could not delete workflow, please try again',
  deleteWorkflowSuccess: 'Workflow deleted',
  deleteWorkflowCallToAction: 'Delete workflow',
  deleteWorkflowConfirmationTitle: 'Delete workflow',
  deleteWorkflowConfirmationContent: 'Are you sure you want to delete this workflow? This action cannot be undone.',
  deleteWorkflowConfirmationButton: 'Delete',
}

export const CreateWorkflowResources = {
  defaultWorkflowName: 'New auto-add workflow',
  duplicateWorkflowLabel: 'Duplicate workflow',
  newWorkflowLabel: 'New workflow',
  workflowNameInputLabel: 'Workflow name',
  duplicateButton: 'Duplicate',
  autoAddWorkflowLimitReached:
    'Maximum number of auto-add workflows reached. Delete a workflow or upgrade your plan to continue.',
  newWorkflowName: (workflowTemplateName: string) => `Duplicate of ${workflowTemplateName}`,
}

export const ManageAccessResources = {
  privacySettingsAdmin: 'Everyone in the organization is an admin of this project.',

  collaboratorDropDownAdmin: 'Can see, make changes to, and add new collaborators to this project.',
  collaboratorDropDownWrite: 'Can see and make changes to this project.',
  collaboratorDropDownRead: 'Can see this project.',
  collaboratorDropDownNone:
    'Organization members will only be able to see this project if it’s public. To give an organization member additional access, they can be added as part of a team or as a collaborator.',
  addCollaboratorPlaceholderUserProject: 'Search by username',
  addCollaboratorPlaceholderOrgProject: 'Search by username or team',

  collaboratorFilterPlaceholderUserProject: 'Find a collaborator',
  collaboratorFilterPlaceholderOrgProject: 'Find a collaborator or a team',
}

export const DescriptionEditorResources = {
  saveButton: 'Save',
  cancelButton: 'Cancel',
  shortDescriptionTitle: 'Short description',
  shortDescriptionPlaceholder: 'A short description about this project.',
  readmeTitle: 'README',
  readmePlaceholder: 'Let everyone know what this project is about, how to use it and link to important resources.',
  errorMessage: 'An error occurred while saving.',
}

export const DragAndDropResources = {
  instructions: (title: string | number) => `Moving ${title}`,
  firstItemInList: 'First item in list.',
  lastItemInList: 'Last item in list.',
  moveUp: 'Move item up in one increment',
  moveDown: 'Move item down in one increment',
  cancelDrag: 'Cancel drag mode',
  endDrag: 'Place item',
  movedBetween: (itemA: string, itemB: string) => `Moved between ${itemA} and ${itemB}.`,
  successfulMove: (title: string, itemA: string, itemB: string) =>
    `Successfully moved ${title} between ${itemA} and ${itemB}.`,
  successfulMoveTop: (title: string) => `Successfully moved ${title} to the first position in list`,
  successfulMoveBottom: (title: string) => `Successfully moved ${title} to the last position in list`,
  cancelMove: (title: string) => `${title} not moved.`,
  defaultMoveDialogValidationMessage: 'Please enter a valid position',
}

export const InsightsResources = {
  addInsightsChartNamePlaceholder: 'Add a name for this chart',
  defaultLeanBurnupChartName: 'Burn up',
  defaultLeanBurnupChartDescription:
    'The Burn up chart shows the progress of your project items over time, showing how much work has been completed and how much is left to do. Use this chart to view progress, spot trends, and identify bottlenecks to help move the project forward.',
  defaultStatusChartName: 'Status chart',
  defaultStatusChartDescription: 'This chart shows the current status for the total number of items in your project.',
  invalidFieldLabel: 'Missing field',
  invalidFieldErrorMessage: 'The selected field no longer exists',
  operationLabel: {
    count: 'Count of',
    sum: 'Sum of',
    avg: 'Average of',
    min: 'Minimum of',
    max: 'Maximum of',
  },
  sideNavNewChartButton: 'New chart',
  sideNavDefaultCharts: 'Default charts',
  sideNavCustomCharts: 'Custom charts',
  sideNavPreviewFeatureText: 'Historical charts are currently in limited feature preview.',
  upsellDialogTitle: 'Get unlimited charts',
  upsellDialogSubtitle: 'Upgrade your plan to get:',
  upsellDialogBullet1: 'Unlimited custom charts for private projects',
  upsellDialogBullet2: 'Historical insights (Team or Enterprise plans only)',
  upsellDialogBullet3: 'All the additional perks of a premium GitHub plan',
  upsellDialogCancelButton: 'Cancel',
  upsellDialogUpgradePlanButton: 'Upgrade plan',
  planUpgradeText: (chartLimit: number) =>
    `Private projects are limited to ${chartLimit} custom charts.  Make your project public or upgrade your plan to add more charts.`,
  periodNavigationLinkAnnouncement: (period: string) => `Displaying results for ${period}`,
}

export const RoadmapResources = {
  addItemToToday: 'Add item to today',
  dragSashAriaLabel: 'Drag to resize the table column',
  noDateFieldsConfiguredTooltip: 'Create a date or iteration field to specify dates',
  noIterationConfiguredTooltip: (dateString: string) =>
    `Create an iteration containing ${dateString} to add items here`,
  iterationSuffix: (variant: 'start' | 'end') => (variant === 'start' ? 'start' : 'end'),
  startDate: 'Start date',
  endDate: 'Target date',
  noStartDate: 'No start date',
  noEndDate: 'No target date',
  noDateSet: 'No date set',
  gettingStarted: {
    popoverTitle: 'Welcome to Roadmap!',
    popoverDismissButton: 'Got it!',
    projectNeedsField: 'Your project needs at least one date or iteration field to get started.',
    fieldsSelectedByDefault: (fieldType: 'date' | 'iteration') =>
      `We've selected an existing ${fieldType} field in your project to get started. You can change the fields used here.`,
  },
  toolbarDateFields: 'Date fields',
  toolbarDateFieldsAriaLabel: 'Select date fields',
  toolbarToday: 'Today',
  toolbarZoomAriaLabel: (zoomLevel: RoadmapZoomLevel) => `Zoom level: ${zoomLevel}.`,
  zoomMenuDialogAriaLabel: (zoomLevel: RoadmapZoomLevel) =>
    `Select zoom level. The current zoom level is ${zoomLevel}.`,
  zoomLevel: 'Zoom level',
  zoomLevelOptions: {
    month: 'Month',
    quarter: 'Quarter',
    year: 'Year',
  },
  scrollToDateText: (date: Date) => `Scroll to: ${formatDateUtc(date)}`,
  scrollToPreviousPage: 'Scroll to previous date range',
  scrollToNextPage: 'Scroll to next date range',
}

export const ProjectMigrationResources = {
  statuses: {
    pending: 'Starting migration…',
    in_progress_project_details: 'Setting up the project…',
    in_progress_status_fields: 'Creating project columns…',
    in_progress_default_view: 'Creating an initial view…',
    in_progress_permissions: 'Migrating permissions…',
    in_progress_items: 'Migrating issues, pull requests, and drafts…',
    in_progress_workflows: 'Migrating workflows…',
    error: 'Your project could not be migrated.',
  },
  yourClassicProject: 'Your classic project',
  completedAndClosed1: 'has been closed and is read-only.',
  completedAndClosed2: 'Users visiting the classic project will be linked to this one.',
  completedAndStillOpen: "is still open, but future changes won't be synchronized.",
  automatedMigrationCompleteMessage: 'This project has been migrated as part of the sunset for Projects (classic).',
  automatedMigrationInProgressMessage: 'This project is being migrated as part of the sunset for Projects (classic).',
  sunsetNoticeLink: 'https://github.blog/changelog/2024-05-23-sunset-notice-projects-classic/',
  learnMore: 'Learn more',
  migrationCompleteMessage: 'Migration complete',
  somethingWentWrongMessage: 'Something went wrong',
}

export const TracksResources = {
  tasks: (completed: number, total: number) => {
    const plural = total > 1
    const taskPluralization = `task${plural ? 's' : ''}`

    if (!completed) return `${total} ${taskPluralization}`
    if (total === completed) return `${completed} ${taskPluralization} done`
    return `${completed} of ${total} ${taskPluralization}`
  },
}

export const TrackedByResources = {
  trackedBy: 'Tracked by',
  noTrackedBy: 'No Tracked by',
  trackingIssues: 'tracking issues',
  addedUnsupportedItemToast: 'PRs and Drafts can’t be added to a tracking issue. Item was added to No Tracked by group',
  addAllItemsText: (count: number) => `Add all ${count} items`,
  itemsNotInProjectText: (count: number) => `${count} ${count > 1 ? 'items' : 'item'} not in this project`,
  moveMultipleTrackedByNoTrackedWarning: {
    title: 'Are you sure?',
    content: 'Moving this issue to No tracked by will remove it from multiple task lists. This cannot be undone.',
    confirmButtonContent: 'Move',
    confirmButtonType: 'danger',
  } as ConfirmOptions,
  Toasts: {
    DraftAndPullsNotSupported: {
      type: ToastType.error,
      message: 'PRs and draft issues are not supported by tracked-by',
    },
  },
}

export const ParentIssueResources = {
  addedUnsupportedItemToast: 'PRs and Drafts can’t be added as sub-issues. Item was added to No Parent issue group',
  toasts: {
    draftAndPullsNotSupported: {
      type: ToastType.error,
      message: 'PRs and draft issues are not supported by sub-issues',
    },
  },
}

export const MigrationResources = {
  migratingTitle: (title: string) => `Migrating ${title}`,
}

export const BulkUpdateResources = {
  refreshPageMessage: (amount: number) =>
    `The update did not complete. ${amount > 0 ? `${amount} items did not update. ` : ''}Please refresh the page.`,
  successMessage: 'The update you requested is complete.',
}

export const BulkCopyResources = {
  failureMessage: 'An error occurred while copying draft issues.',
  successMessage: 'Draft issues copied successfully.',
  copyingDraftsMessage: 'Copying draft issues to your new project. This may take a minute to complete.',
}

export const ArchiveResources = {
  allSelectedMatchingItems: (totalCount: {value: number; isApproximate: boolean}) =>
    `All ${totalCount.value.toLocaleString()}${totalCount.isApproximate ? `+` : ''} items matching query selected`,
  selectAllMatchingItems: (totalCount: {value: number; isApproximate: boolean}) =>
    `Select all ${totalCount.value.toLocaleString()}${totalCount.isApproximate ? `+` : ''} items matching this query`,
  selectedItems: (count: number) => `${count.toLocaleString()} ${singularOrPlural(count, 'item', 'items')} selected`,
  itemCount: (start: number, end: number, totalCount: {value: number; isApproximate: boolean}) =>
    `${start.toLocaleString()}-${end.toLocaleString()} of ${totalCount.value.toLocaleString()}${
      totalCount.isApproximate ? `+` : ''
    } ${singularOrPlural(totalCount.value, 'item', 'items')}`,
  noArchivedItems: 'No archived items',
  deleteAllMatchingItemsConfirmation: 'Are you sure you want to delete all items matching this query?',
  noLimitsBannerMessage:
    'This project is enrolled in the unlimited archive items beta with limited filtering at this time.',
  noLimitsBannerFeedback: ' For feedback, please visit',
  noLimitsBannerFeedbackLinkText: ' this discussion',
}

export const IssueViewerResources = {
  openInNewTab: 'Open in new tab',
  copyLinkInProject: 'Copy link in project',
  archiveInProject: 'Archive in project',
  deleteFromProject: 'Delete from project',
}

export const StatusUpdatesResources = {
  title: 'Status updates',
  nullStateTitle: 'Add a project status update',
  description:
    "Status updates are brief reports tracking your project's health and progress. Begin by adding an update.",
  learnMoreLinkText: 'Learn more',
  addUpdateButtonText: 'Add update',
  saveUpdateButtonText: 'Save update',
  cancelUpdateButtonText: 'Cancel',
  addUpdateTitle: 'Add status update',
  statusFieldLabel: 'Status',
  startDateFieldLabel: 'Start date',
  targetDateFieldLabel: 'Target date',
  statusPickerFilterPlaceholderText: 'Filter statuses',
  statusPickerResultsAriaLabel: 'Status results',
  statusPickerTitle: 'Select a status',
  statusPickerAriaLabel: 'Select status',
  startDatePickerAriaLabel: 'Select start date',
  targetDatePickerAriaLabel: 'Select target date',
  confirmDeleteTitle: 'Delete status update',
  confirmDeleteBody: "Are you sure you'd like to delete this status update?",
  subscribeToUpdates: 'Subscribe to status updates for this project',
  unsubscribeFromUpdates: 'Unsubscribe from status updates for this project',
}

export const CollaboratorsTableResources = {
  error: 'An error has occurred.',
  noCollaborators: "You don't have any collaborators yet.",
  filtering: 'No collaborators found.',
  collaboratorsFound: (count: number) => `${count} ${singularOrPlural(count, 'collaborator', 'collaborators')} found.`,
}

export const IssueTypeResources = {
  setup: 'Set up issue types in your project',
  renameCustomType: (name: string) =>
    `Rename your “${name}“ custom field and start using issue types defined by your organization.`,
  addedUnsupportedItemToast: 'Drafts can’t be added with an issue type. Item was added to No type group',
  learnMoreText: 'Learn more about issue types.',
  learnMoreLink: 'https://gh.io/issue-types-learn-more',
}

export const UserNoticeResources = {
  IssueTypeRenamePopover: {
    title: IssueTypeResources.setup,
    description: IssueTypeResources.renameCustomType,
    altText: 'Issues create dialog with issue type selection',
    actionPrimary: 'Get Started',
    actionSecondary: 'I’ll do it later',
  },
  IssueTypeRenameDialog: {
    title: IssueTypeResources.setup,
    description: (name: string) =>
      `To start using issue types in your project, please rename your “${name}“ custom field and update any filters that reference it.`,
    learnMoreLink: IssueTypeResources.learnMoreLink,
    learnMoreText: IssueTypeResources.learnMoreText,
    fieldLabel: 'Rename field',
    actionPrimary: 'Finish setup',
    actionSecondary: 'Cancel',
    defaultInputString: 'Custom Type',
    videoDescription: 'Selecting the type field on a project, and applying Epic, Feature, and Task to project items',
  },
}

export const ColumnBannerResources = {
  IssueTypeRename: {
    copy1: 'Action required',
    copy2: IssueTypeResources.renameCustomType,
    learnMoreLink: IssueTypeResources.learnMoreLink,
    learnMoreText: IssueTypeResources.learnMoreText,
    actionPrimary: 'Get Started',
  },
}
