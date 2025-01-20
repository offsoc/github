import {BasePageViewWithMemexApp} from './base-page-view'

export class ManageAccessPage extends BasePageViewWithMemexApp {
  /**
   * Section for editing the org access level.
   */
  PRIVACY_SETTINGS_ORG_ACCESS = this.page.getByTestId('privacy-settings-organization-access')
  /**
   * Navigation menu item for the manage access page.
   */
  MANAGE_ACCESS_LINK = this.page.getByTestId('manage-access-item')
  /**
   * Success message element, shown briefly after adding a new collaborator.
   */
  ADDED_COLLABORATOR_SUCCESS_MESSAGE = this.page.locator('text=/user(s)? successfully added/')
  /**
   * Success message shown after updating the org access level.
   */
  ORG_ACCESS_SUCCESS_MESSAGE = this.PRIVACY_SETTINGS_ORG_ACCESS.locator('text=Changes saved')
  /**
   * Failure message shown after an error occurred while updating the org access level.
   */
  ORG_ACCESS_FAILURE_MESSAGE = this.PRIVACY_SETTINGS_ORG_ACCESS.locator('text=Something went wrong.')
  /**
   * The table of collaborators / people who have access to the project.
   */
  COLLABORATORS_TABLE = this.page.getByTestId('collaborators-table')
  /**
   * Role select for the base organization access level.
   */
  ORG_ACCESS_ROLE_SELECT = this.PRIVACY_SETTINGS_ORG_ACCESS.getByTestId('collaborators-role-dropdown-button')
  /**
   * Link that takes you to the project settings page to change visibility status.
   */
  MANAGE_VISIBILITY_LINK = this.page.getByTestId('privacy-settings-manage-access-link')

  // Link that takes you to the org's People page with a filter for role:owner
  ORG_OWNERS_LINK = this.page.getByTestId('privacy-settings-org-owners-link')

  COLLABORATOR_LINK = this.page.getByTestId('collaborator-link')

  COLLABORATOR_LOGIN = this.page.getByTestId('collaborator-login')

  getCollaboratorRow(login: string) {
    return this.page.getByTestId(`collaborators-row-${login}`)
  }
}
