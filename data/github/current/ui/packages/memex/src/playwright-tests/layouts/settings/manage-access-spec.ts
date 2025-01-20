import {expect, type Page} from '@playwright/test'

import {defaultTeamMemberCount} from '../../../mocks/data/teams'
import {test} from '../../fixtures/test-extended'
import {mustFind, mustNotFind, waitForSelectorCount} from '../../helpers/dom/assertions'
import {click} from '../../helpers/dom/interactions'
import {_} from '../../helpers/dom/selectors'
import {eventually} from '../../helpers/utils'

test.describe('Manage Access View Redirect', () => {
  test('If user is not an admin, redirect to 404', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestAccessSettingsPage', {
      viewerPrivileges: {viewerRole: 'write'},
      testIdToAwait: '404-page',
    })

    await mustFind(page, _('404-page'))
  })

  test('If user is admin, it does not redirect to project view', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestAccessSettingsPage', {
      viewerPrivileges: {viewerRole: 'admin'},
      testIdToAwait: 'access-settings',
    })
    await mustFind(page, _('access-settings'))
  })
})

const add_two_collabs = async (page: Page) => {
  await page.getByTestId('add-collaborators-input').click()
  await page.keyboard.type('o')
  await page.getByTestId('collaborator-suggestion-item-olivia').click()
  await expect(page.getByTestId('collaborator-pill-olivia')).toBeVisible()

  await page.keyboard.type('m')
  await page.getByTestId('collaborator-suggestion-item-dmarcey').click()
  await expect(page.getByTestId('collaborator-pill-dmarcey')).toBeVisible()
}

const add_team = async (page: Page) => {
  await page.getByTestId('add-collaborators-input').click()
  await page.keyboard.type('memex')
  await page.getByTestId('collaborator-suggestion-item-github/memex-team-2').click()
  await expect(page.getByTestId('collaborator-pill-github/memex-team-2')).toBeVisible()
}

test.describe('Adding collaborators', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsInAdminMode')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()
    await memex.manageAccessPage.MANAGE_ACCESS_LINK.click()
  })

  test('When all invitations succeed, the actors are added to the collaborators table, and counter is updated', async ({
    page,
    memex,
  }) => {
    await add_two_collabs(page)
    await add_team(page)
    await click(page, _('add-collaborators-invite-button'))

    await expect(memex.manageAccessPage.ADDED_COLLABORATOR_SUCCESS_MESSAGE).toBeVisible()
    await mustFind(memex.manageAccessPage.COLLABORATORS_TABLE, _('collaborators-row-olivia'))
    await mustFind(memex.manageAccessPage.COLLABORATORS_TABLE, _('collaborators-row-dmarcey'))
    const row = await mustFind(
      memex.manageAccessPage.COLLABORATORS_TABLE,
      `div[data-testid^="collaborators-row-@memex-team-2"]`,
    )
    expect(await row.innerText()).toContain(`@memex-team-2 • ${defaultTeamMemberCount} members`)

    const counter = await mustFind(memex.manageAccessPage.COLLABORATORS_TABLE, _('collaborators-table-counter'))
    expect(await counter.innerText()).toBe('3 members, 2 teams')
  })
})

test.describe('Removing collaborators', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsInAdminMode')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()
    await memex.manageAccessPage.MANAGE_ACCESS_LINK.click()
  })

  test('When removing a collaborator, the actor is removed from the table', async ({page, memex}) => {
    await expect(memex.manageAccessPage.getCollaboratorRow('deborah-digges')).toBeVisible()
    await click(page, _('remove-collaborator-deborah-digges'))
    const counter = await mustFind(memex.manageAccessPage.COLLABORATORS_TABLE, _('collaborators-table-counter'))

    await eventually(async () => {
      await mustNotFind(memex.manageAccessPage.COLLABORATORS_TABLE, _('collaborators-row-deborah-digges'))
      await mustFind(
        memex.manageAccessPage.COLLABORATORS_TABLE,
        `button[data-testid^="remove-collaborator-@memex-team-1"]`,
      )
    })

    await waitForSelectorCount(page, 'div[data-testid^=collaborators-row]', 1)
    expect(await counter.innerText()).toBe('1 team')
  })
})

test.describe('Updating collaborators', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsInAdminMode')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()
    await memex.manageAccessPage.MANAGE_ACCESS_LINK.click()
  })

  test("When update a collaborator's role, the role is updated in the table", async ({page, memex}) => {
    const collaboratorItem = memex.manageAccessPage.getCollaboratorRow('deborah-digges')
    const button = collaboratorItem.getByTestId('collaborators-role-dropdown-button')
    let summaryText = await button.textContent()
    // Permission for Default Collaborator is Write
    summaryText.includes('Write')

    await click(collaboratorItem, _('collaborators-role-dropdown-button'))
    await page.waitForSelector(_('collaborators-role-dropdown-item-read'))
    await click(page, `${_('collaborators-role-dropdown-item-read')}`)

    summaryText = await button.textContent()
    // Read should be selected
    expect(summaryText).toContain('Read')
  })
})

test.describe('Manage collaborators', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsInAdminMode')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()
    await memex.manageAccessPage.MANAGE_ACCESS_LINK.click()
  })

  test('Choosing the role in header updates the role for selected collaborators, clicking remove button removes collaborators', async ({
    page,
    memex,
  }) => {
    await add_two_collabs(page)
    await page.getByTestId('add-collaborators-invite-button').click()
    await expect(page.getByTestId('success-message')).toBeVisible()
    await expect(page.getByTestId('collaborators-table-counter')).toContainText('3 members')
    await expect(page.getByTestId('collaborators-header-role-filter-button')).toBeVisible()

    const checkbox = page.getByTestId('collaborators-checkbox-bulk')
    await checkbox.click()

    const headerDropdown = page.getByTestId('collaborators-header-dropdown')
    const roleButton = headerDropdown.getByTestId('collaborators-role-dropdown-button')
    await expect(roleButton).toContainText('Mixed')

    await roleButton.click()
    const readItem = page.getByTestId('collaborators-role-dropdown-item-read')
    await readItem.click()

    await expect(roleButton).toContainText('Read')

    const removeButton = page.getByTestId('collaborators-remove-bulk')
    await removeButton.click()

    await expect(page.getByTestId('collaborators-table-blankslate-no-collaborators')).toBeVisible()

    await mustNotFind(memex.manageAccessPage.COLLABORATORS_TABLE, _('collaborators-row-deborah-digges'))
    await mustNotFind(memex.manageAccessPage.COLLABORATORS_TABLE, _('collaborators-row-olivia'))
    await mustNotFind(memex.manageAccessPage.COLLABORATORS_TABLE, _('collaborators-row-dmarcey'))

    await expect(page.getByTestId('collaborators-header-role-filter-button')).toBeVisible()
    await mustNotFind(page, _('collaborators-remove-bulk'))
  })

  test("A user's login is displayed when the user doesn't have a name defined", async ({page, memex}) => {
    await page.getByTestId('add-collaborators-input').click()
    await page.keyboard.type('anura')
    await page.getByTestId('collaborator-suggestion-item-anuradhayella').click()
    await expect(page.getByTestId('collaborator-pill-anuradhayella')).toBeVisible()
    await page.getByTestId('add-collaborators-invite-button').click()
    await expect(page.getByTestId('success-message')).toBeVisible()
    await expect(page.getByTestId('collaborators-header-role-filter-button')).toBeVisible()

    const collaboratorItem = memex.manageAccessPage.getCollaboratorRow('anuradhayella')

    await expect(collaboratorItem.locator(memex.manageAccessPage.COLLABORATOR_LINK)).toHaveText('anuradhayella')
    await expect(collaboratorItem.locator(memex.manageAccessPage.COLLABORATOR_LOGIN)).toBeHidden()
  })
})

test.describe('In error mode', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsInAdminErrorMode')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()
    await memex.manageAccessPage.MANAGE_ACCESS_LINK.click()
  })

  test('When changing the org access role fails, the role is not updated', async ({memex}) => {
    await expect(memex.manageAccessPage.ORG_ACCESS_ROLE_SELECT).toHaveText('No access')
    await expect(memex.manageAccessPage.ORG_ACCESS_FAILURE_MESSAGE).toBeVisible({timeout: 5000})
  })
})

test.describe('Privacy Settings', () => {
  test.describe('User owned project', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsInUserOwnedMode')
      await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
      await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()
      await memex.manageAccessPage.MANAGE_ACCESS_LINK.click()
    })

    test('Organization access panel is not present and manage button navigates to project settings page', async ({
      page,
      memex,
    }) => {
      await mustNotFind(page, _('privacy-settings-organization-access'))
      await memex.manageAccessPage.MANAGE_VISIBILITY_LINK.click()
      await mustFind(page, _('project-visibility-button'))
    })
  })

  test.describe('Organization owned project', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsInAdminMode')
      await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
      await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()
      await memex.manageAccessPage.MANAGE_ACCESS_LINK.click()
    })

    test('Organization access panel is present and manage button navigates to project settings page', async ({
      page,
      memex,
    }) => {
      await mustFind(page, _('privacy-settings-organization-access'))
      await memex.manageAccessPage.MANAGE_VISIBILITY_LINK.click()
      await mustFind(page, _('project-visibility-button'))
    })

    test('Changing the organization access permission updates the role', async ({page, memex}) => {
      await expect(page.locator('text=Everyone in the organization can see this project.')).toBeVisible()

      // Permission for Default Org is Read
      await expect(memex.manageAccessPage.ORG_ACCESS_ROLE_SELECT).toHaveText('Read')
      await memex.manageAccessPage.ORG_ACCESS_ROLE_SELECT.click()

      await page.locator('role=menuitemradio[name=Write]').click()

      await expect(memex.manageAccessPage.ORG_ACCESS_SUCCESS_MESSAGE).toBeVisible()
      await expect(memex.manageAccessPage.ORG_ACCESS_ROLE_SELECT).toHaveText('Write')
    })

    test('Renders a link to the owners within an org', async ({memex}) => {
      await expect(memex.manageAccessPage.ORG_OWNERS_LINK).toBeVisible()

      const linkRegex = /https:\/\/([\w.-]+)\/orgs\/github\/people\?query=role%3Aowner/
      await expect(memex.manageAccessPage.ORG_OWNERS_LINK).toHaveAttribute('href', linkRegex)
    })
  })
})
