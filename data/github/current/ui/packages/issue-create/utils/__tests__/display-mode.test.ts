import {DisplayMode, getDefaultDisplayMode} from '../display-mode'

test('correctly returns default modes', () => {
  expect(
    getDefaultDisplayMode({
      repositoryHasIssuesEnabled: false,
      hasSelectedTemplate: false,
      hasAvailableTemplates: false,
    }),
  ).toBe(DisplayMode.TemplatePicker)

  expect(
    getDefaultDisplayMode({
      repositoryHasIssuesEnabled: true,
      hasSelectedTemplate: false,
      hasAvailableTemplates: false,
      onChoosePage: false,
    }),
  ).toBe(DisplayMode.IssueCreation)

  expect(
    getDefaultDisplayMode({repositoryHasIssuesEnabled: true, hasSelectedTemplate: true, hasAvailableTemplates: false}),
  ).toBe(DisplayMode.IssueCreation)

  expect(
    getDefaultDisplayMode({repositoryHasIssuesEnabled: false, hasSelectedTemplate: true, hasAvailableTemplates: true}),
  ).toBe(DisplayMode.TemplatePicker)

  expect(
    getDefaultDisplayMode({repositoryHasIssuesEnabled: true, hasSelectedTemplate: false, hasAvailableTemplates: true}),
  ).toBe(DisplayMode.TemplatePicker)

  expect(
    getDefaultDisplayMode({
      repositoryHasIssuesEnabled: true,
      hasSelectedTemplate: true,
      hasAvailableTemplates: true,
      onNewPage: true,
    }),
  ).toBe(DisplayMode.IssueCreation)

  expect(
    getDefaultDisplayMode({
      repositoryHasIssuesEnabled: false,
      hasSelectedTemplate: false,
      hasAvailableTemplates: true,
      onNewPage: false,
    }),
  ).toBe(DisplayMode.TemplatePicker)
})
