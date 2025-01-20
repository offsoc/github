export enum DisplayMode {
  TemplatePicker,
  IssueCreation,
}

type getDefaultDisplayModeParams = {
  repositoryHasIssuesEnabled: boolean
  hasSelectedTemplate: boolean
  hasAvailableTemplates: boolean
  onChoosePage?: boolean
  onNewPage?: boolean
}

export function getDefaultDisplayMode({
  repositoryHasIssuesEnabled,
  hasSelectedTemplate,
  hasAvailableTemplates,
  onChoosePage = false,
  onNewPage = false,
}: getDefaultDisplayModeParams) {
  if ((!repositoryHasIssuesEnabled && !onNewPage) || onChoosePage) {
    // Template picker will show an error message for repositories without issues, therefore show this.
    // Otherwise, if we're on the /choose page, we should show the template picker always.
    return DisplayMode.TemplatePicker
  }

  // If we have a selected template or no available templates, or if we are on the new page, we should go straight to issue creation.
  if (hasSelectedTemplate || !hasAvailableTemplates || onNewPage) {
    return DisplayMode.IssueCreation
  }

  return DisplayMode.TemplatePicker
}
