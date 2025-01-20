import {expect} from '@playwright/test'

import {test} from '../fixtures/test-extended'

test.describe('Status Updates', () => {
  test('Renders in side panel', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      paneState: {
        pane: 'info',
      },
    })

    await expect(page.getByTestId('status-updates-container')).toBeVisible()
    await expect(memex.statusUpdates.LATEST_STATUS_UPDATE).toBeVisible()
  })

  test('Does not render when project is a template', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestCustomTemplates', {
      paneState: {
        pane: 'info',
      },
    })

    await expect(page.getByTestId('status-updates-container')).toBeHidden()
    await expect(memex.statusUpdates.LATEST_STATUS_UPDATE).toBeHidden()
  })

  test('Does not render the "Add status update button" on the settings page', async ({memex}) => {
    await memex.projectSettingsPage.visit()

    await expect(memex.statusUpdates.LATEST_STATUS_UPDATE).toBeHidden()
    await expect(memex.statusUpdates.LATEST_STATUS_UPDATE_NULL_BUTTON).toBeHidden()
  })

  test('Shows expected latest update in top bar', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      viewerPrivileges: {
        viewerRole: 'write',
      },
    })

    await expect(memex.statusUpdates.LATEST_STATUS_UPDATE_TOKEN_BUTTON).toBeVisible()
    await expect(memex.statusUpdates.LATEST_STATUS_UPDATE_NULL_BUTTON).toBeHidden()
    await expect(memex.statusUpdates.LATEST_STATUS_UPDATE_TOKEN_BUTTON).toContainText('Complete')

    await expect(memex.statusUpdates.LATEST_STATUS_UPDATE_TOKEN_BUTTON_TEXT).toBeHidden()

    // Hovering over the token should show the full status update
    await memex.statusUpdates.LATEST_STATUS_UPDATE_TOKEN_BUTTON.hover()
    await expect(memex.statusUpdates.LATEST_STATUS_UPDATE_TOKEN_BUTTON_TEXT).toBeVisible()

    // Moving the mouse away from the token should hide the full status update
    await page.mouse.move(0, 0)
    await expect(memex.statusUpdates.LATEST_STATUS_UPDATE_TOKEN_BUTTON_TEXT).toBeHidden()
  })

  test('Shows expected latest update null state in top bar', async ({memex}) => {
    await memex.navigateToStory('integrationTestsEmpty', {
      paneState: {
        pane: 'info',
      },
      viewerPrivileges: {
        viewerRole: 'write',
      },
    })

    await expect(memex.statusUpdates.LATEST_STATUS_UPDATE_NULL_BUTTON).toBeVisible()
    await expect(memex.statusUpdates.LATEST_STATUS_UPDATE_TOKEN_BUTTON).toBeHidden()
    await expect(memex.statusUpdates.LATEST_STATUS_UPDATE_NULL_BUTTON).toContainText('Add status update')
  })

  test('Hides latest update null state in top bar', async ({memex}) => {
    await memex.navigateToStory('integrationTestsEmpty', {
      paneState: {
        pane: 'info',
      },
      viewerPrivileges: {
        viewerRole: 'read',
      },
    })

    await expect(memex.statusUpdates.LATEST_STATUS_UPDATE).toBeHidden()
    await expect(memex.statusUpdates.LATEST_STATUS_UPDATE_NULL_BUTTON).toBeHidden()
    await expect(memex.statusUpdates.LATEST_STATUS_UPDATE_TOKEN_BUTTON).toBeHidden()
  })

  test('Show create update button for viewer with write permissions', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      paneState: {
        pane: 'info',
      },
      viewerPrivileges: {
        viewerRole: 'write',
      },
    })

    await expect(page.getByTestId('status-updates-default-state-header')).toBeVisible()
    await expect(page.getByTestId('status-updates-create-button')).toBeVisible()
  })

  test('Do not show create update button for viewer without write permissions', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      paneState: {
        pane: 'info',
      },
      viewerPrivileges: {
        viewerRole: 'read',
      },
    })

    await expect(page.getByTestId('status-updates-default-state-header')).toBeVisible()
    await expect(page.getByTestId('status-updates-create-button')).toBeHidden()
  })

  test('Shows empty state header when no status updates are present', async ({memex, page}) => {
    // This memex does not have any status updates
    await memex.navigateToStory('integrationTestsWithItems', {
      paneState: {
        pane: 'info',
      },
      viewerPrivileges: {
        viewerRole: 'write',
      },
    })

    await expect(page.getByTestId('status-updates-container')).toBeVisible()
    await expect(page.getByTestId('status-updates-default-state-header')).toBeHidden()
    await expect(page.getByTestId('status-updates-empty-state-header')).toBeVisible()
  })

  test('Do not show empty state header if user does not have write permission, even if no status updates are present', async ({
    memex,
    page,
  }) => {
    // This memex does not have any status updates
    await memex.navigateToStory('integrationTestsWithItems', {
      paneState: {
        pane: 'info',
      },
      viewerPrivileges: {
        viewerRole: 'read',
      },
    })

    await expect(page.getByTestId('status-updates-container')).toBeVisible()
    await expect(page.getByTestId('status-updates-default-state-header')).toBeHidden()
    await expect(page.getByTestId('status-updates-empty-state-header')).toBeHidden()
  })

  test('Can create status updates from empty state header when no status updates are present', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      paneState: {
        pane: 'info',
      },
    })

    await memex.statusUpdates.openStatusUpdateEditor()

    await memex.statusUpdates.selectStatus('On track')
    await memex.statusUpdates.selectStartDate('12')
    await memex.statusUpdates.selectTargetDate('25')
    await memex.statusUpdates.setStatusBody('Test status update body')
    await memex.statusUpdates.saveStatusUpdate()

    await expect(memex.statusUpdates.getStatusUpdateItems()).toHaveCount(11)
    await memex.statusUpdates.expectStatusUpdateToHaveValues(0, 'On track', /12/, /25/, 'Test status update body')
  })

  test('Status update item updated at is linkified', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      paneState: {
        pane: 'info',
      },
    })

    await memex.statusUpdates.openStatusUpdateEditor()

    await memex.statusUpdates.selectStatus('On track')
    await memex.statusUpdates.selectStartDate('12')
    await memex.statusUpdates.selectTargetDate('25')
    await memex.statusUpdates.setStatusBody('Test status update body')
    await memex.statusUpdates.saveStatusUpdate()

    await expect(
      memex.statusUpdates.getStatusUpdateByIndex(0).getByRole('heading').getByRole('link', {name: 'now'}),
    ).toHaveAttribute('href', '?pane=info&statusUpdateId=100')
  })

  test('New status update draft state is persisted when toggling side-panel pin state', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      paneState: {
        pane: 'info',
      },
    })

    await memex.statusUpdates.openStatusUpdateEditor()

    await memex.statusUpdates.selectStatus('On track')
    await memex.statusUpdates.selectStartDate('12')
    await memex.statusUpdates.selectTargetDate('25')
    await memex.statusUpdates.setStatusBody('Test status update body')

    await memex.statusUpdates.expectAddStatusUpdateEditorToHaveValues('On track', /12/, /25/, 'Test status update body')

    await memex.sidePanel.PIN_BUTTON.click()
    await memex.statusUpdates.expectAddStatusUpdateEditorToHaveValues('On track', /12/, /25/, 'Test status update body')

    await memex.sidePanel.UNPIN_BUTTON.click()
    await memex.statusUpdates.expectAddStatusUpdateEditorToHaveValues('On track', /12/, /25/, 'Test status update body')
  })

  test('Close create update form when cancel button is clicked', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      paneState: {
        pane: 'info',
      },
    })

    await memex.statusUpdates.openStatusUpdateEditor()
    await memex.statusUpdates.CANCEL_UPDATE_BUTTON.click()

    await expect(memex.statusUpdates.CREATE_UPDATE_CONTAINER).toBeHidden()
  })

  test('Renders mocked updates in list', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      paneState: {
        pane: 'info',
      },
    })
    await expect(memex.statusUpdates.getStatusUpdateItems()).toHaveCount(10)
    await memex.statusUpdates.expectStatusUpdateToHaveValues(
      0,
      'Complete',
      '2023-10-31',
      '2023-11-14',
      /Mission accomplished!/,
    )
    await memex.statusUpdates.expectStatusUpdateToHaveValues(
      1,
      'On track',
      '2023-10-31',
      '2023-11-14',
      /Making steady progress/,
    )
    await memex.statusUpdates.expectStatusUpdateToHaveValues(
      2,
      'Off track',
      '2023-10-31',
      '2023-11-14',
      /Taking a detour/,
    )
    await memex.statusUpdates.expectStatusUpdateToHaveValues(
      3,
      'At risk',
      '2023-10-31',
      '2023-11-14',
      /Facing uncertainty/,
    )
    await memex.statusUpdates.expectStatusUpdateToHaveValues(4, 'On track', '2023-10-31', '2023-11-14', /Hello World!/)
  })

  test('Utilizes fields from previous status update as default fields', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      paneState: {
        pane: 'info',
      },
    })

    await memex.statusUpdates.openStatusUpdateEditor()
    await memex.statusUpdates.setStatusBody('Mission accomplished, but even more!')
    await memex.statusUpdates.saveStatusUpdate()

    await expect(memex.statusUpdates.getStatusUpdateItems()).toHaveCount(11)
    await memex.statusUpdates.expectStatusUpdateToHaveValues(
      0,
      'Complete',
      '2023-10-31',
      '2023-11-14',
      'Mission accomplished, but even more!',
    )
  })

  test('Can delete status update with write access', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      paneState: {
        pane: 'info',
      },
    })

    await expect(memex.statusUpdates.STATUS_UPDATE_ITEM_LIST.getByRole('listitem')).toHaveCount(10)

    const menuOption = await memex.statusUpdates.getStatusUpdateItemMenuOption(2, 'delete')
    await menuOption.click()

    await page.getByRole('alertdialog').getByText('Delete', {exact: true}).click()

    await expect(memex.statusUpdates.STATUS_UPDATE_ITEM_LIST.getByRole('listitem')).toHaveCount(9)
  })

  test('Can cancel delete status update', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      paneState: {
        pane: 'info',
      },
    })

    await expect(memex.statusUpdates.STATUS_UPDATE_ITEM_LIST.getByRole('listitem')).toHaveCount(10)

    const menuOption = await memex.statusUpdates.getStatusUpdateItemMenuOption(2, 'delete')
    await menuOption.click()

    await page.getByRole('alertdialog').getByText('Delete', {exact: true}).click()

    await expect(memex.statusUpdates.STATUS_UPDATE_ITEM_LIST.getByRole('listitem')).toHaveCount(9)
  })

  test('Cannot delete status update without write access', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      paneState: {
        pane: 'info',
      },
      viewerPrivileges: {
        viewerRole: 'read',
      },
    })

    const menuOption = await memex.statusUpdates.getStatusUpdateItemMenuOption(2, 'delete')
    await expect(menuOption).toBeHidden()
  })

  test('Does not render edit button if user does not have write permissions', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      paneState: {
        pane: 'info',
      },
      viewerPrivileges: {
        viewerRole: 'read',
      },
    })

    await expect(memex.statusUpdates.STATUS_UPDATE_ITEM_LIST.getByRole('listitem')).toHaveCount(10)
    await memex.statusUpdates.openStatusUpdateItemMenu(0)
    await expect(memex.statusUpdates.STATUS_UPDATE_MENU_EDIT_BUTTON).toBeHidden()
  })

  test('Can edit an existing status update if user has write permissions', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      paneState: {
        pane: 'info',
      },
      viewerPrivileges: {
        viewerRole: 'write',
      },
    })

    const menuOption = await memex.statusUpdates.getStatusUpdateItemMenuOption(0, 'edit')
    await menuOption.click()
    await expect(page.getByTestId('status-updates-item-container')).toBeVisible()

    await memex.statusUpdates.selectStatus('On track')
    await memex.statusUpdates.selectStartDate('12')
    await memex.statusUpdates.selectTargetDate('25')
    await memex.statusUpdates.setStatusBody('Test status update body')

    await memex.statusUpdates.saveStatusUpdate()

    await memex.statusUpdates.expectStatusUpdateToHaveValues(
      0,
      'On track',
      '2023-10-12',
      '2023-11-25',
      'Test status update body',
    )
  })

  test('Highlights a deep-linked status update and deselects on outside click', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      paneState: {
        pane: 'info',
        statusUpdateId: 1,
      },
    })

    await expect(memex.statusUpdates.getStatusUpdateItemById(1)).toHaveAttribute('aria-current', 'true')
    await expect(page).toHaveURL(/statusUpdateId=1/)

    await memex.statusUpdates.getStatusUpdateItemById(2).click()

    await expect(memex.statusUpdates.getStatusUpdateItemById(1)).not.toHaveAttribute('aria-current', 'true')
    await expect(page).not.toHaveURL(/statusUpdateId=1/)
  })

  test('Clears statusUpdateId query param after sidepanel is closed', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      viewerPrivileges: {
        viewerRole: 'write',
      },
    })

    await memex.statusUpdates.LATEST_STATUS_UPDATE_TOKEN_BUTTON.click()
    await expect(memex.statusUpdates.getStatusUpdateItemById(10)).toHaveAttribute('aria-current', 'true')
    await expect(page).toHaveURL(/statusUpdateId=10/)
    await page.keyboard.press('Escape')

    // ensure that the sidepanel is closed and the query param is cleared
    await expect(memex.statusUpdates.STATUS_UPDATE_ITEM_LIST).toBeHidden()
    await expect(page).not.toHaveURL(/statusUpdateId/)
  })

  test('user is able to overwrite default settings when creating new status update', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      paneState: {
        pane: 'info',
      },
    })

    await memex.statusUpdates.openStatusUpdateEditor()
    await memex.statusUpdates.selectStatus('clear')
    await memex.statusUpdates.selectStartDate('clear')
    await memex.statusUpdates.selectTargetDate('clear')
    await memex.statusUpdates.setStatusBody('Test status update body')

    await memex.statusUpdates.saveStatusUpdate()

    const statusUpdateItem = memex.statusUpdates.getStatusUpdateByIndex(0)
    await expect(statusUpdateItem.getByTestId('status-update-item-value-status')).toBeHidden()
    await expect(statusUpdateItem.getByTestId('status-update-item-value-start-date')).toBeHidden()
    await expect(statusUpdateItem.getByTestId('status-update-item-value-target-date')).toBeHidden()
    await expect(statusUpdateItem.getByTestId('status-update-item-value-body')).toContainText('Test status update body')
  })

  test('user can subscribe and unsubscribe to notifications', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithStatusUpdates', {
      paneState: {
        pane: 'info',
      },
    })

    await expect(memex.statusUpdates.NOTIFICATIONS_SUBSCRIPTIONS_TOGGLE).toBeVisible()
    await expect(memex.statusUpdates.NOTIFICATIONS_SUBSCRIPTIONS_TOGGLE).toContainText('Subscribe')
    await memex.statusUpdates.NOTIFICATIONS_SUBSCRIPTIONS_TOGGLE.click()
    await expect(memex.statusUpdates.NOTIFICATIONS_SUBSCRIPTIONS_TOGGLE).toContainText('Unsubscribe')

    await memex.statusUpdates.NOTIFICATIONS_SUBSCRIPTIONS_TOGGLE.click()
    await expect(memex.statusUpdates.NOTIFICATIONS_SUBSCRIPTIONS_TOGGLE).toContainText('Subscribe')
  })

  test('logged out users cant see the notification subscription toggle', async ({memex}) => {
    await memex.navigateToStory('integrationTestsInReadonlyMode', {
      paneState: {
        pane: 'info',
      },
    })

    await expect(memex.statusUpdates.NOTIFICATIONS_SUBSCRIPTIONS_TOGGLE).toBeHidden()
  })
})
