import safeStorage from '@github-ui/safe-storage'
import {expect} from '@playwright/test'

import {Resources} from '../../../client/strings'
import {test} from '../../fixtures/test-extended'
import {mustFind, mustNotFind, waitForSelectorCount} from '../../helpers/dom/assertions'
import {click, dragTo, mustGetCenter, submitConfirmDialog, waitForTitle} from '../../helpers/dom/interactions'
import {_} from '../../helpers/dom/selectors'
import {createNewColumn, getColumnHeaderMenuOption, getColumnMenuTrigger} from '../../helpers/table/interactions'
import {getTableColumnHeaderNames} from '../../helpers/table/selectors'
import {eventually} from '../../helpers/utils'

const safeLocalStorage = safeStorage('localStorage')

test.describe('Settings view Tests', () => {
  test('the settings page is shown after clicking on the project settings button', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the settings side nav is visible
    await expect(page.getByTestId('settings-side-nav')).toBeVisible()

    // Ensure the general settings is visible
    await expect(page.getByTestId('general-settings')).toBeVisible()

    await page.waitForURL(url => url.pathname.includes('/settings'))
  })

  test('the settings page is accessible through the "Field settings" button', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    const menuTrigger = await getColumnMenuTrigger(page, 'Status')

    // Open the menu.
    await menuTrigger.click()

    const editColumnOption = getColumnHeaderMenuOption(page, 'Status', Resources.tableHeaderContextMenu.fieldSettings)
    await editColumnOption.click()

    // Ensure the the settings page is visible
    await expect(page.getByTestId('column-settings-Status')).toBeVisible()

    await page.waitForURL(url => url.pathname.includes('/settings/field'))
  })

  test('the settings page is accessible through the "Field settings" button for user-defined fields', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems')

    const menuTrigger = await getColumnMenuTrigger(page, 'Stage')

    // Open the menu.
    await menuTrigger.click()

    const fieldSettingsOption = getColumnHeaderMenuOption(page, 'Stage', Resources.tableHeaderContextMenu.fieldSettings)
    await fieldSettingsOption.click()

    // Ensure the the settings page is visible
    await expect(page.getByTestId('column-settings-Stage')).toBeVisible()

    await page.waitForURL(url => url.pathname.includes('/settings/field'))

    const settingsSideNavLocator = page.getByTestId('settings-side-nav')
    const customFieldsGroupLocator = settingsSideNavLocator.locator('ul > li', {hasText: 'Custom fields'})
    const customFieldListItemsLocator = customFieldsGroupLocator.locator('li')

    await expect(customFieldListItemsLocator).toContainText(['Stage'])

    await page.getByRole('button', {name: 'Delete field'}).click()

    await submitConfirmDialog(page, 'Delete field and data')

    // Ensure the user is redirected to the Status settings page
    await expect(page.getByTestId('column-settings-Status')).toBeVisible()

    await expect(customFieldListItemsLocator).not.toContainText(['Stage'])
  })

  // https://github.com/github/memex/issues/9304
  test('the settings page can be navigated away from and back to using the back button', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    await expect(page.getByTestId('general-settings')).toBeVisible()

    await page.goBack()

    await page.waitForSelector(_('general-settings'), {
      state: 'detached',
    })

    await page.goForward()

    await expect(page.getByTestId('general-settings')).toBeVisible()
  })
})

test.describe('Settings Sidebar Nav Tests', () => {
  // https://github.com/github/memex/issues/9305
  test('the settings side nav contains an item for general settings', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the settings side nav is visible
    const sideNav = page.getByTestId('settings-side-nav')
    await expect(sideNav).toBeVisible()

    // Ensure the general settings item is visible
    await expect(page.getByTestId('general-settings-item')).toBeVisible()

    // don't autofocus the project name input
    await expect(memex.projectSettingsPage.PROJECT_NAME_INPUT).not.toBeFocused()
  })

  test('clicking on "General" should open the general project settings.', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // click away from the default general settings view
    await memex.projectSettingsPage.getFieldLink('Status').click()

    // Ensure the general settings is hidden
    await page.waitForSelector(_('general-settings'), {
      state: 'hidden',
    })

    await click(page, _('general-settings-item'))

    // Ensure the general settings is visible
    await expect(page.getByTestId('general-settings')).toBeVisible()
  })

  test('there should be items for custom columns.', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestSettingsFieldPage', {
      testIdToAwait: 'settings-page',
    })

    const settingsSideNavLocator = page.getByTestId('settings-side-nav')
    const customFieldsGroupLocator = settingsSideNavLocator.locator('ul > li', {hasText: 'Custom fields'})
    const customFieldListItemsLocator = customFieldsGroupLocator.locator('li')

    await expect(customFieldListItemsLocator).toContainText([
      'Status',
      'Stage',
      'Team',
      'Theme',
      'Impact',
      'Confidence',
      'Effort',
      'Custom Text',
      'Estimate',
      'Due Date',
      'Aardvarks',
    ])

    await expect(page.locator('text=new field')).toBeVisible()
    await expect(page.locator('button', {hasText: 'Delete field'})).toBeHidden()
    await customFieldListItemsLocator.nth(2).click()
    await expect(page.locator('button', {hasText: 'Delete field'})).toBeVisible()
  })

  test('clicking on an item for a single-select column should open the column settings for it.', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()
    await memex.projectSettingsPage.getFieldLink('Status').click()

    await expect(page.getByTestId('column-settings-Status')).toBeVisible()
  })

  test('a newly added single-select column should show in the settings side nav', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    await createNewColumn(page, 'Animals', 'single-select', false)

    // Create an option
    await memex.projectSettingsPage.singleSelectForm.NEW_OPTION_INPUT.fill('Cat')
    await page.keyboard.press('Enter')

    //Create the new column
    const saveButton = await mustFind(page, _('add-column-modal-save'))
    await saveButton.click()
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()
    // The entry for the new column should exist
    await expect(memex.projectSettingsPage.getFieldLink('Animals')).toBeVisible()
  })

  test('user can reorder the custom fields in the side nav', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithCustomItems')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()
    await memex.projectSettingsPage.getFieldLink('Status').click()

    // Ensure the settings side nav is visible
    await expect(page.getByTestId('settings-side-nav')).toBeVisible()

    // arrange
    const customFieldToReorder = 'Status'

    const originalOrder = ['Status', 'Due Date', 'Aardvarks']
    const finalOrder = ['Due Date', 'Status', 'Aardvarks']

    expect(await memex.projectSettingsPage.getCustomFieldNames()).toEqual(originalOrder)

    // act
    const statusFieldGrabber = memex.projectSettingsPage.getCustomFieldLeadingVisual(customFieldToReorder)
    await statusFieldGrabber.hover()
    // drag Status and place it after Due Date
    await dragTo(page, statusFieldGrabber, {y: (await mustGetCenter(statusFieldGrabber)).y + 40})

    // assert
    expect(await memex.projectSettingsPage.getCustomFieldNames()).toEqual(finalOrder)
  })
})

test.describe('Tests for General Settings', () => {
  test('the user should be able to close and reopen the project', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the general settings is visible
    await expect(page.getByTestId('general-settings')).toBeVisible()

    // Ensure the reopen project button is not visible
    await expect(memex.projectSettingsPage.REOPEN_PROJECT_BUTTON).toBeHidden()

    // Ensure the close project button is visible and not disabled
    const closeButton = page.getByTestId('close-project-button')
    await expect(closeButton).toBeVisible()
    expect(await closeButton.getAttribute('disabled')).toBeFalsy()

    // Close the project
    await closeButton.click()

    // The close project button should not be visible now
    await waitForSelectorCount(page, _('close-project-button'), 0)

    // Ensure the reopen project button is visible and not disabled
    const reopenButton = page.getByTestId('reopen-project-button')
    await expect(reopenButton).toBeVisible()
    expect(await reopenButton.getAttribute('disabled')).toBeFalsy()

    // Reopen the project
    await reopenButton.click()

    // Ensure the reopen project button is not visible
    await waitForSelectorCount(page, _('reopen-project-button'), 0)

    // Ensure the close project button is visible
    await waitForSelectorCount(page, _('close-project-button'), 1)
  })

  test('there should be a input field to rename the project', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the general settings is visible
    const generalSettings = page.getByTestId('general-settings')
    await expect(generalSettings).toBeVisible()

    // Ensure the input element exists, is visible & not disabled.
    const inputElem = memex.projectSettingsPage.PROJECT_NAME_INPUT
    await expect(inputElem).toBeVisible()
    const isDisabled = await inputElem.getAttribute('disabled')
    expect(isDisabled).toBeFalsy()
  })

  test('user should be able to rename the project', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the general settings is visible
    const generalSettings = page.getByTestId('general-settings')
    await expect(generalSettings).toBeVisible()

    // Ensure the input element is visible
    const inputElem = memex.projectSettingsPage.PROJECT_NAME_INPUT
    await expect(inputElem).toBeVisible()

    // Focus the input element
    await inputElem.focus()

    const previousTitle = await inputElem.getAttribute('value')

    // Append " 123" to the existing value.
    await page.keyboard.type(' 123')
    const newTitle = await inputElem.getAttribute('value')

    // Assert what was typed above.
    expect(`${previousTitle} 123`).toBe(newTitle)

    await memex.projectSettingsPage.SAVE_PROJECT_SETTINGS_BUTTON.click()
    await expect(page.getByTestId('save-project-settings-success')).toBeVisible()
    await memex.topBarNavigation.returnToProjectView()

    // Assert that the memex-title is updated.
    await waitForTitle(page, newTitle)
  })

  test('user should be able to save the short description', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the general settings is visible
    const generalSettings = page.getByTestId('general-settings')
    await expect(generalSettings).toBeVisible()

    // Enter a short description
    await expect(memex.projectSettingsPage.DESCRIPTION_EDITOR).toBeVisible()
    await memex.projectSettingsPage.DESCRIPTION_EDITOR.focus()
    await page.keyboard.type('Hello World!')

    // Save the project settings
    await memex.projectSettingsPage.SAVE_PROJECT_SETTINGS_BUTTON.click()
    await expect(page.getByTestId('save-project-settings-success')).toBeVisible()
    await memex.topBarNavigation.returnToProjectView()
    await page.getByTestId('project-memex-info-button').click()
    // Check that the short description is saved
    await expect(page.getByTestId('side-panel-info-content')).toContainText('Hello World!')
  })

  test('user should be able to save the README', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the general settings is visible
    const generalSettings = page.getByTestId('general-settings')
    await expect(generalSettings).toBeVisible()

    // Enter a description/README
    await expect(page.getByRole('textbox', {name: 'Markdown value'})).toBeVisible()
    await page.getByRole('textbox', {name: 'Markdown value'}).focus()
    await page.keyboard.type('This is my markdown README!')

    // Save the project settings
    await memex.projectSettingsPage.SAVE_PROJECT_SETTINGS_BUTTON.click()
    await expect(page.getByTestId('save-project-settings-success')).toBeVisible()
    await memex.topBarNavigation.returnToProjectView()
    await page.getByTestId('project-memex-info-button').click()
    // Check that the README is saved
    await expect(page.getByTestId('side-panel-info-content')).toContainText('This is my markdown README!')
  })

  test('user should be prompted to save changes while navigating away with changes', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the general settings is visible
    const generalSettings = page.getByTestId('general-settings')
    await expect(generalSettings).toBeVisible()

    // Ensure the input element is visible
    const inputElem = memex.projectSettingsPage.PROJECT_NAME_INPUT
    await expect(inputElem).toBeVisible()

    // Focus the input element
    await inputElem.focus()

    const previousTitle = await inputElem.getAttribute('value')

    // Append " 123" to the existing value.
    await page.keyboard.type(' 123')
    const newTitle = await inputElem.getAttribute('value')

    // Assert what was typed above.
    expect(`${previousTitle} 123`).toBe(newTitle)

    // Enter a short description
    await expect(memex.projectSettingsPage.DESCRIPTION_EDITOR).toBeVisible()
    await memex.projectSettingsPage.DESCRIPTION_EDITOR.focus()
    await page.keyboard.type('Hello World!')

    // Enter a description/README
    await expect(page.getByRole('textbox', {name: 'Markdown value'})).toBeVisible()
    await page.getByRole('textbox', {name: 'Markdown value'}).focus()
    await page.keyboard.type('This is my markdown README!')

    // Trigger the unsaved changes alert
    await memex.topBarNavigation.returnToProjectView()
    await expect(page.getByRole('alertdialog')).toBeVisible()

    // Cancel the navigation
    await page.getByRole('button', {name: 'Cancel'}).click()
    await expect(page.getByRole('alertdialog')).toBeHidden()

    // Trigger the modal again
    await memex.topBarNavigation.returnToProjectView()
    await expect(page.getByRole('alertdialog')).toBeVisible()

    // Discard the changes
    await page.getByRole('button', {name: 'Discard'}).click()
    await expect(page.getByRole('alertdialog')).toBeHidden()
    await expect(generalSettings).toBeHidden()
  })

  test('user should not be able to enter a blank project name', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestSettingsPage', {
      testIdToAwait: 'settings-page',
    })

    // Set the project name to an empty string
    await memex.projectSettingsPage.PROJECT_NAME_INPUT.fill('')

    // Submit the project name and assert that the error message is visible
    await memex.projectSettingsPage.SAVE_PROJECT_SETTINGS_BUTTON.click()
    await expect(page.getByTestId('save-project-settings-success')).toBeVisible()
  })

  test('user should be able to revert changes in the project name by Escape', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the general settings is visible
    await expect(page.getByTestId('general-settings')).toBeVisible()
    const inputElem = memex.projectSettingsPage.PROJECT_NAME_INPUT
    await inputElem.focus()
    const previousTitle = await inputElem.getAttribute('value')

    // Append " 123" to the existing value.
    await page.keyboard.type(' 123')
    const newTitle = await inputElem.getAttribute('value')

    // Assert what was typed above.
    expect(`${previousTitle} 123`).toBe(newTitle)

    await page.keyboard.press('Escape')

    await memex.topBarNavigation.returnToProjectView()

    // Assert that the memex-title is updated.
    await waitForTitle(page, previousTitle)
  })

  test('there should not be project visibility setting if user is admin', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsInAdminMode')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the general settings is visible
    await expect(page.getByTestId('general-settings')).toBeVisible()

    // Ensure the project visibility setting does not exist.
    await mustNotFind(page, 'project-visibility-button')
  })

  test('there should not be project visibility setting if user is not admin', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the general settings is visible
    await expect(page.getByTestId('general-settings')).toBeVisible()

    // Ensure the project visibility setting does not exist.
    await mustNotFind(page, 'project-visibility-button')
  })

  test('there should be project visibility setting if user is admin', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsInAdminMode', {
      viewerPrivileges: {viewerCanChangeProjectVisibility: true},
    })
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the project visibility setting exists, is visible and not disabled.
    const visibilityOption = page.getByTestId('project-visibility-button')
    await expect(visibilityOption).toBeVisible()
    const isDisabled = await visibilityOption.isDisabled()
    expect(isDisabled).toBeFalsy()
    await visibilityOption.click()
  })

  test('the Manage access tab is displayed if user is admin', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsInAdminMode')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()
    await memex.manageAccessPage.MANAGE_ACCESS_LINK.click()

    // Ensure the access settings is visible
    await expect(page.getByTestId('access-settings')).toBeVisible()
  })

  test('the Manage access tab is not displayed if user is not admin', async ({memex}) => {
    await memex.navigateToStory('integrationTestSettingsPage', {testIdToAwait: 'settings-page'})

    // Ensure the access settings item in sidebar is not visible
    await expect(memex.manageAccessPage.MANAGE_ACCESS_LINK).toHaveCount(0)
  })

  test('admin should be able to change visibility of a project', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsInAdminMode', {
      viewerPrivileges: {viewerCanChangeProjectVisibility: true},
    })
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the general settings is visible
    await expect(page.getByTestId('general-settings')).toBeVisible()

    // Ensure the input element is visible
    const visibilityOption = page.getByTestId('project-visibility-button')
    await expect(visibilityOption).toBeVisible()

    // Focus the visibility selectMenu element
    await visibilityOption.focus()

    let currentVisibilityValue = await visibilityOption.innerText()
    expect(currentVisibilityValue).toMatch('Private')

    let textElem = await mustFind(page, _('project-visibility-text'))
    let textElemValue = await textElem.textContent()
    expect(textElemValue).toMatch('This project is currently private.')

    const ariaLiveElem = page.getByTestId('project-visibility-update-status')
    const ariaLiveElemValue = await ariaLiveElem.textContent()
    expect(ariaLiveElemValue).toMatch('')

    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    await eventually(async () => {
      // Assert that the heading on the top of the Settings page is updated
      currentVisibilityValue = await visibilityOption.innerText()
      textElem = await mustFind(page, _('project-visibility-text'))
      textElemValue = await textElem.textContent()
      await expect(ariaLiveElem).toHaveText('Changes saved')
      expect(textElemValue).toMatch('This project is currently public.')
      expect(currentVisibilityValue).toMatch('Public')
    })
  })
})

test.describe('Column Settings Tests', () => {
  // https://github.com/github/memex/issues/9334
  test('user can edit the settings view for a single select field with correct shortcode to emoji mapping', async ({
    page,
    browserName,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems')

    const menuTrigger = await getColumnMenuTrigger(page, 'Stage')

    // Open the menu.
    await menuTrigger.click()

    const editColumnOption = getColumnHeaderMenuOption(page, 'Stage', Resources.tableHeaderContextMenu.fieldSettings)
    await editColumnOption.click()

    await memex.projectSettingsPage.singleSelectForm.NEW_OPTION_INPUT.fill(':no_entry_sign: Out of Scope')
    await page.keyboard.press('Enter')

    await memex.topBarNavigation.returnToProjectView()

    // Now, open the cell editor and ensure the new option is there
    const stageCell = memex.tableView.cells.getGenericCell(0, 'Stage').locator
    await expect(stageCell).toBeVisible()

    // Assert that a new option has been created
    await stageCell.dblclick()
    const options = page.locator('role=listbox >> role=option')
    await expect(options).toHaveCount(5)

    if (browserName !== 'webkit') {
      // Ensure the emoji is rendered successfully
      await expect(options.nth(4)).toHaveText('🚫 Out of Scope')
    }
  })

  test('user can reorder the options for a single select field', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    const menuTrigger = await getColumnMenuTrigger(page, 'Stage')

    // Open the menu.
    await menuTrigger.click()

    const editColumnOption = getColumnHeaderMenuOption(page, 'Stage', Resources.tableHeaderContextMenu.fieldSettings)
    await editColumnOption.click()

    const originalOrder = ['On Hold', 'Up Next', 'In Progress', 'Closed']
    const finalOrder = ['On Hold', 'In Progress', 'Closed', 'Up Next']

    expect(await memex.projectSettingsPage.singleSelectForm.getAllOptionTexts()).toEqual(originalOrder)

    // Drag "Up Next" option and drop it at the end.
    const dragHandle = memex.projectSettingsPage.singleSelectForm.OPTION_DRAG_HANDLE.nth(1)
    await dragTo(page, dragHandle, {y: (await mustGetCenter(dragHandle)).y + 150})

    expect(await memex.projectSettingsPage.singleSelectForm.getAllOptionTexts()).toEqual(finalOrder)
  })

  test('Will announce reorder failure', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsInErrorMode')

    const menuTrigger = await getColumnMenuTrigger(page, 'Stage')

    // Open the menu.
    await menuTrigger.click()

    const editColumnOption = getColumnHeaderMenuOption(page, 'Stage', Resources.tableHeaderContextMenu.fieldSettings)
    await editColumnOption.click()

    const originalOrder = ['On Hold', 'Up Next', 'In Progress', 'Closed']

    expect(await memex.projectSettingsPage.singleSelectForm.getAllOptionTexts()).toEqual(originalOrder)

    // Drag "Up Next" option and drop it at the end.
    const dragHandle = memex.projectSettingsPage.singleSelectForm.OPTION_DRAG_HANDLE.nth(1)
    await dragTo(page, dragHandle, {y: (await mustGetCenter(dragHandle)).y + 150})

    const announcement = page.getByTestId('js-global-screen-reader-notice-assertive')
    await expect(announcement).toHaveText('Column options failed to update.')
  })

  test('user view instructions and can reorder the options for a single select field using keyboard', async ({
    page,
    memex,
  }) => {
    safeLocalStorage.removeItem('hideReorderKeyboardInstructions')

    await memex.navigateToStory('integrationTestsWithItems')

    const menuTrigger = await getColumnMenuTrigger(page, 'Stage')

    // Open the menu.
    await menuTrigger.click()

    const editColumnOption = getColumnHeaderMenuOption(page, 'Stage', Resources.tableHeaderContextMenu.fieldSettings)
    await editColumnOption.click()

    const originalOrder = ['On Hold', 'Up Next', 'In Progress', 'Closed']
    const finalOrder = ['On Hold', 'In Progress', 'Closed', 'Up Next']

    expect(await memex.projectSettingsPage.singleSelectForm.getAllOptionTexts()).toEqual(originalOrder)

    const dragHandle = memex.projectSettingsPage.singleSelectForm.OPTION_DRAG_HANDLE.nth(1)
    await dragHandle.focus()

    await page.keyboard.press('Enter')
    await page.getByText("Don't show this again").click()
    await page.getByText("Don't show this again").click()
    await page.keyboard.press('Escape') // dismiss instructions modal
    await page.keyboard.press('Enter')

    await page.keyboard.press('Enter')
    await page.keyboard.press('Escape') // dismiss instructions modal
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    expect(await memex.projectSettingsPage.singleSelectForm.getAllOptionTexts()).toEqual(finalOrder)
  })

  test('keyboard reorder instructions do not reappear after click "Don\'t show this again"', async ({page, memex}) => {
    safeLocalStorage.removeItem('hideReorderKeyboardInstructions')

    await memex.navigateToStory('integrationTestsWithItems')

    const menuTrigger = await getColumnMenuTrigger(page, 'Stage')

    // Open the menu.
    await menuTrigger.click()

    const editColumnOption = getColumnHeaderMenuOption(page, 'Stage', Resources.tableHeaderContextMenu.fieldSettings)
    await editColumnOption.click()

    const originalOrder = ['On Hold', 'Up Next', 'In Progress', 'Closed']
    const finalOrder = ['On Hold', 'In Progress', 'Closed', 'Up Next']

    expect(await memex.projectSettingsPage.singleSelectForm.getAllOptionTexts()).toEqual(originalOrder)

    const dragHandle = memex.projectSettingsPage.singleSelectForm.OPTION_DRAG_HANDLE.nth(1)
    await dragHandle.focus()

    await page.keyboard.press('Enter')
    await page.getByText("Don't show this again").click()
    await page.keyboard.press('Escape') // dismiss instructions modal
    await page.keyboard.press('Enter')

    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    expect(await memex.projectSettingsPage.singleSelectForm.getAllOptionTexts()).toEqual(finalOrder)
  })

  test('user can reorder the options for a single select field using move dialog', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    const menuTrigger = await getColumnMenuTrigger(page, 'Stage')

    // Open the menu.
    await menuTrigger.click()

    const editColumnOption = getColumnHeaderMenuOption(page, 'Stage', Resources.tableHeaderContextMenu.fieldSettings)
    await editColumnOption.click()

    const originalOrder = ['On Hold', 'Up Next', 'In Progress', 'Closed']
    const finalOrder = ['Up Next', 'In Progress', 'On Hold', 'Closed']

    expect(await memex.projectSettingsPage.singleSelectForm.getAllOptionTexts()).toEqual(originalOrder)

    // Move "On Hold" option and drop it at the end.
    const dropdownMenu = memex.projectSettingsPage.singleSelectForm.DROPDOWN_MENU_BUTTON.nth(0)
    await dropdownMenu.click()
    const moveButton = memex.projectSettingsPage.singleSelectForm.MOVE_OPTION_BUTTON
    await moveButton.click()
    const positionInput = memex.projectSettingsPage.singleSelectForm.POSITION_INPUT
    await positionInput.type('Closed', {delay: 100})
    await page.getByRole('option', {name: 'Closed'}).click()
    await memex.projectSettingsPage.singleSelectForm.MOVE_DIALOG_SAVE_BUTTON.click()

    expect(await memex.projectSettingsPage.singleSelectForm.getAllOptionTexts()).toEqual(finalOrder)
  })

  test('user can delete the options for a single select field', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    const menuTrigger = await getColumnMenuTrigger(page, 'Stage')

    // Open the menu.
    await menuTrigger.click()

    const editColumnOption = getColumnHeaderMenuOption(page, 'Stage', Resources.tableHeaderContextMenu.fieldSettings)
    await editColumnOption.click()

    const originalOptions = ['On Hold', 'Up Next', 'In Progress', 'Closed']
    const finalOptions = ['On Hold', 'In Progress', 'Closed']

    expect(await memex.projectSettingsPage.singleSelectForm.getAllOptionTexts()).toEqual(originalOptions)

    // Delete "Up Next" option
    await memex.projectSettingsPage.singleSelectForm.clickRemoveOption(1)
    await memex.projectSettingsPage.singleSelectForm.CONFIRM_DELETE_DIALOG_CONFIRM_BUTTON.click()

    expect(await memex.projectSettingsPage.singleSelectForm.getAllOptionTexts()).toEqual(finalOptions)
  })

  test('user can edit name of a single select field', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the settings side nav is visible
    await memex.projectSettingsPage.getFieldLink('Stage').click()

    // Ensure the input element is visible
    await expect(memex.projectSettingsPage.FIELD_NAME_INPUT).toBeVisible()
    await expect(memex.projectSettingsPage.FIELD_NAME_INPUT).toHaveValue('Stage')
    const newTitle = 'Stage 123'
    await memex.projectSettingsPage.FIELD_NAME_INPUT.fill(newTitle)
    await expect(memex.projectSettingsPage.FIELD_NAME_INPUT).toHaveValue(newTitle)

    await page.keyboard.press('Enter')

    await expect(memex.projectSettingsPage.getFieldLink(newTitle)).toBeVisible()

    await memex.topBarNavigation.returnToProjectView()

    // Assert that the column name is updated
    expect(await getTableColumnHeaderNames(page)).toContain(newTitle)

    // Assert that the column name is updated in menu
    const menuTrigger = await getColumnMenuTrigger(page, newTitle)
    await menuTrigger.click()
  })

  test('User cannot delete all single-select options', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()
    await memex.projectSettingsPage.getFieldLink('Status').click()

    await expect(page.getByTestId('column-settings-Status')).toBeVisible()

    await memex.projectSettingsPage.singleSelectForm.clickRemoveOption(0)
    await memex.projectSettingsPage.singleSelectForm.CONFIRM_DELETE_DIALOG_CONFIRM_BUTTON.click()
    await memex.projectSettingsPage.singleSelectForm.clickRemoveOption(0)
    await memex.projectSettingsPage.singleSelectForm.clickRemoveOption(0)

    await memex.projectSettingsPage.singleSelectForm.expectRemoveOptionNotFound(0)
  })

  test('there should be project readme editor - admin permissions', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsInAdminMode')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the general settings is visible
    await expect(page.getByTestId('general-settings')).toBeVisible()

    // Ensure the project description does not exist.
    await expect(page.locator(`${_('markdown-editor')} textarea`)).toBeVisible()
  })

  test('there should be project readme editor - write permissions', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsInAdminMode', {
      viewerPrivileges: {viewerRole: 'write'},
    })
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the general settings is visible
    await expect(page.getByTestId('general-settings')).toBeVisible()

    // Ensure the project description does not exist.
    await expect(page.locator(`${_('markdown-editor')} textarea`)).toBeVisible()
  })

  test('there should be project description editor - admin permissions', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsInAdminMode')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the general settings is visible
    await expect(page.getByTestId('general-settings')).toBeVisible()

    // Ensure the project description does not exist.
    await expect(page.getByTestId('description-editor')).toBeVisible()
  })

  test('there should be project description editor - write permissions', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsInAdminMode', {
      viewerPrivileges: {viewerRole: 'write'},
    })
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    // Ensure the general settings is visible
    await expect(page.getByTestId('general-settings')).toBeVisible()

    // Ensure the project description does not exist.
    await expect(page.getByTestId('description-editor')).toBeVisible()
  })

  test.describe('Type column', () => {
    test('does not show the banner on fields that are not type', async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithIssueTypeRenamePopover')
      await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
      await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

      const typeColumn = memex.projectSettingsPage.getFieldLink('Impact')
      await expect(typeColumn).not.toContainText('Action required')
      await typeColumn.click()

      await expect(memex.projectSettingsPage.COLUMN_SETTINGS_BANNER).toBeHidden()
    })

    test('shows a banner if user-defined type column is present', async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithIssueTypeRenamePopover')
      await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
      await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

      const typeColumn = memex.projectSettingsPage.getFieldLink('Type')
      await expect(typeColumn).toContainText('Action required')
      await typeColumn.click()

      await expect(memex.projectSettingsPage.COLUMN_SETTINGS_BANNER).toBeVisible()
    })

    test('allows renaming user-defined type field from the banner', async ({memex, page}) => {
      await memex.navigateToStory('integrationTestsWithIssueTypeRenamePopover')
      await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
      await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

      const typeColumn = memex.projectSettingsPage.getFieldLink('Type')
      await typeColumn.click()

      await memex.projectSettingsPage.COLUMN_SETTINGS_BANNER.getByRole('button', {name: 'Get started'}).click()

      const renameDialog = page.getByRole('dialog', {name: 'Set up issue types in your project'})
      await expect(renameDialog).toBeVisible()

      await renameDialog.getByRole('textbox').fill('Category')
      await renameDialog.getByRole('button', {name: 'Finish setup'}).click()

      await expect(renameDialog).toBeHidden()
      await expect(memex.projectSettingsPage.COLUMN_SETTINGS_BANNER).toBeHidden()

      const newTypeColumn = memex.projectSettingsPage.getFieldLink('Category')
      await expect(newTypeColumn).toBeVisible()
      await expect(newTypeColumn).not.toContainText('Action required')
      await expect(memex.projectSettingsPage.getFieldLink('Type')).toBeHidden()
    })
  })
})

test.describe('Settings options deletion Tests', () => {
  test('a modal should prompt a user for confirmation when they try to delete options that are currently set in memex items', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsWithCustomItems')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    await page.waitForURL(url => url.pathname.includes('/settings'))

    await memex.projectSettingsPage.getCustomFieldLink('Aardvarks').click()
    await memex.projectSettingsPage.singleSelectForm.clickRemoveOption(0)
    await expect(memex.projectSettingsPage.singleSelectForm.CONFIRM_DELETE_DIALOG).toBeVisible()
    await expect(memex.projectSettingsPage.singleSelectForm.CONFIRM_DELETE_DIALOG).toContainText([
      'This will permanently delete this option from the "Aardvarks" field. This cannot be undone.Warning: The option will be permanently deleted from 1 item in this project.',
    ])

    await memex.projectSettingsPage.singleSelectForm.CONFIRM_DELETE_DIALOG_CONFIRM_BUTTON.click()
    await memex.projectSettingsPage.singleSelectForm.clickRemoveOption(1)

    await expect(memex.projectSettingsPage.singleSelectForm.CONFIRM_DELETE_DIALOG).toBeVisible()
    await expect(memex.projectSettingsPage.singleSelectForm.CONFIRM_DELETE_DIALOG).toContainText([
      'This will permanently delete this option from the "Aardvarks" field. This cannot be undone.Warning: The option will be permanently deleted from 1 item in this project.',
    ])

    await memex.projectSettingsPage.singleSelectForm.CONFIRM_DELETE_DIALOG_CONFIRM_BUTTON.click()
    await expect(memex.projectSettingsPage.COLUMN_SETTINGS_SAVED_MESSAGE).toBeVisible()
  })
})

test.describe('Settings iterations deletion Tests', () => {
  test('a modal should prompt a user for confirmation when they try to delete active iterations that are currently set in memex items', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('appWithIterationsField')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    await page.waitForURL(url => url.pathname.includes('/settings'))

    await memex.projectSettingsPage.getCustomFieldLink('Iteration').click()
    await memex.projectSettingsPage.DELETE_ITERATION_BUTTON.nth(0).click()
    await memex.projectSettingsPage.SAVE_CHANGES_BUTTON.click()

    await expect(memex.projectSettingsPage.CONFIRM_DELETE_ITERATION_DIALOG).toBeVisible()
    await expect(memex.projectSettingsPage.CONFIRM_DELETE_ITERATION_DIALOG).toContainText([
      'This will permanently delete this iteration value from the "Iteration" field. This cannot be undone.Warning: This iteration value will be removed from 3 items in this project.',
    ])

    await memex.projectSettingsPage.CONFIRM_DELETE_BUTTON.click()
    await expect(memex.projectSettingsPage.COLUMN_SETTINGS_SAVED_MESSAGE).toBeVisible()
  })

  test('a modal should prompt a user for confirmation when they try to delete completed iterations that are currently set in memex items', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('appWithIterationsField')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    await page.waitForURL(url => url.pathname.includes('/settings'))

    await memex.projectSettingsPage.getCustomFieldLink('Iteration').click()
    await memex.projectSettingsPage.COMPLETED_ITERATIONS.click()
    await memex.projectSettingsPage.DELETE_ITERATION_BUTTON.nth(0).click()
    await memex.projectSettingsPage.SAVE_CHANGES_BUTTON.click()

    await expect(memex.projectSettingsPage.CONFIRM_DELETE_ITERATION_DIALOG).toBeVisible()
    await expect(memex.projectSettingsPage.CONFIRM_DELETE_ITERATION_DIALOG).toContainText([
      'This will permanently delete this iteration value from the "Iteration" field. This cannot be undone.Warning: This iteration value will be removed from 1 item in this project.',
    ])

    await memex.projectSettingsPage.CONFIRM_DELETE_BUTTON.click()
    await expect(memex.projectSettingsPage.COLUMN_SETTINGS_SAVED_MESSAGE).toBeVisible()
  })

  test('a modal should not prompt a user for confirmation if updating iterations currently set in memex items', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('appWithIterationsField')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    await page.waitForURL(url => url.pathname.includes('/settings'))

    await memex.projectSettingsPage.getCustomFieldLink('Iteration').click()
    await page.getByTestId('iteration-title').nth(2).type('a modified title')
    await page.keyboard.press('Tab')
    await memex.projectSettingsPage.SAVE_CHANGES_BUTTON.click()

    await expect(memex.projectSettingsPage.CONFIRM_DELETE_ITERATION_DIALOG).toBeHidden()
    await expect(memex.projectSettingsPage.COLUMN_SETTINGS_SAVED_MESSAGE).toBeVisible()
  })

  test('a modal should not prompt a user for confirmation if the iterations to be deleted are not currently set in memex items', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('appWithIterationsField')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    await page.waitForURL(url => url.pathname.includes('/settings'))

    await memex.projectSettingsPage.getCustomFieldLink('Iteration').click()
    await memex.projectSettingsPage.DELETE_ITERATION_BUTTON.nth(2).click()
    await memex.projectSettingsPage.SAVE_CHANGES_BUTTON.click()

    await expect(memex.projectSettingsPage.CONFIRM_DELETE_ITERATION_DIALOG).toBeHidden()
    await expect(memex.projectSettingsPage.COLUMN_SETTINGS_SAVED_MESSAGE).toBeVisible()
  })
})

test.describe('Sub-issues progress Tests', () => {
  test('changing the variant setting should be reflected in the preview', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues', {
      serverFeatures: {
        sub_issues: true,
      },
    })
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    await page.waitForURL(url => url.pathname.includes('/settings'))

    await memex.projectSettingsPage.getCustomFieldLink('Sub-issues progress').click()

    const menu = page.getByLabel('Progress visualization variant')
    await menu.click()

    const menuItemRing = page
      .getByRole('menu', {name: 'Progress visualization variant'})
      .getByRole('menuitem', {name: 'Ring'})
    await menuItemRing.click()

    const progressBarPreview = page.getByTestId('progress-bar-ring')
    await expect(progressBarPreview).toBeAttached()
  })

  test('changing the hide numeral setting should be reflected in the preview', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues', {
      serverFeatures: {
        sub_issues: true,
      },
    })
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    await page.waitForURL(url => url.pathname.includes('/settings'))

    await memex.projectSettingsPage.getCustomFieldLink('Sub-issues progress').click()

    const progressBarPreview = page.getByTestId('progress-bar-solid')
    expect((await progressBarPreview.textContent()).length).toBeGreaterThan(0)

    const showNumeralsCheckbox = page.getByRole('checkbox', {name: 'Show numerical value'})
    await showNumeralsCheckbox.setChecked(false)
    await expect(showNumeralsCheckbox).not.toBeChecked()

    expect((await progressBarPreview.textContent()).length).toBe(0)
  })

  test('changing the color setting should be reflected in the preview', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues', {
      serverFeatures: {
        sub_issues: true,
      },
    })
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

    await page.waitForURL(url => url.pathname.includes('/settings'))

    await memex.projectSettingsPage.getCustomFieldLink('Sub-issues progress').click()

    const completeBar = page.getByTestId('progress-bar-solid').locator('span').nth(2)
    const barFilledColorOriginal = await completeBar.evaluate(el =>
      window.getComputedStyle(el).getPropertyValue('background-color'),
    )

    const colorPickerNewColor = page.getByRole('radio', {name: 'Yellow'})
    await expect(colorPickerNewColor).not.toBeChecked()
    await colorPickerNewColor.check({force: true})
    await expect(colorPickerNewColor).toBeChecked()

    const barFilledColorNew = await completeBar.evaluate(el =>
      window.getComputedStyle(el).getPropertyValue('background-color'),
    )

    expect(barFilledColorOriginal).not.toEqual(barFilledColorNew)
  })
})
