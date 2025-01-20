import {BasePageViewWithMemexApp} from './base-page-view'

export class TopBarNavigation extends BasePageViewWithMemexApp {
  RETURN_TO_PROJECT_VIEW = this.page.getByRole('link', {name: 'Return to project view'})
  OPEN_PROJECT_MENU_BUTTON = this.page.getByTestId('project-menu-button')
  AUTOMATION_SETTINGS_NAV_BUTTON = this.page.getByTestId('automation-settings-button')
  SETTINGS_NAV_BUTTON = this.page.getByTestId('project-settings-button')
  INSIGHTS_NAV_BUTTON = this.page.getByTestId('project-insights-button')
  ARCHIVE_PAGE_BUTTON = this.page.getByTestId('archive-navigation-button')
  EDIT_PROJECT_NAME_BUTTON = this.page.getByRole('button', {name: 'Edit project name'})

  async navigateToAutomationPage() {
    await this.OPEN_PROJECT_MENU_BUTTON.click()
    await this.AUTOMATION_SETTINGS_NAV_BUTTON.click()
    return this.memex.automationPage.expectAutomationPageVisible()
  }

  async returnToProjectView() {
    await this.RETURN_TO_PROJECT_VIEW.click()
  }
}
