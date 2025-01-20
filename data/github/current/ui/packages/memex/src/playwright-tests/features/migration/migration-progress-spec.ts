import {expect, type Page} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {emitMockMessageOnMessageChannel, MESSAGE_SOCKET_CHANNEL_ELEMENT_SELECTOR} from '../../helpers/alive/message'
import {_} from '../../helpers/dom/selectors'
import type {MigrationStatus} from '../../types/live-update'

/**
 * We debounced calls to every 1250ms calling for refresh, and this twice as long
 * to ensure we've reacted to incoming messages
 */
const THROTTLE_TIMER_COMPLETION_TIMEOUT = 2500

async function emitMockMigrationMessage(
  page: Page,
  migrationStatus: MigrationStatus,
  sourceProjectClosed = false,
  isAutomated = false,
) {
  return emitMockMessageOnMessageChannel(page, {
    waitFor: 0,
    data: {
      project_migration: {
        id: '1',
        source_project_id: 2,
        target_memex_project_id: 3,
        status: migrationStatus,
        requester_id: '2',
        last_retried_at: null,
        last_migrated_project_item_id: null,
        completed_at: null,
        updated_at: null,
        created_at: null,
        source_project: {
          name: 'name',
          closed: sourceProjectClosed,
        },
        is_automated: isAutomated,
      },
    },
  })
}

async function assertMigrationStatusMessage(page: Page, message: string, automated?: boolean) {
  await waitForThrottleTimerCompletion()
  await page.waitForFunction(
    ([selector, m]) => {
      const migrationStatus = document.querySelector(selector)
      if (!migrationStatus) {
        throw new Error(`Could not find element matching selector: ${selector}, expected text: '${m}'`)
      }
      return migrationStatus.textContent.trim() === m
    },
    [_(`${automated ? 'automated-' : ''}migration-status`), message],
  )
}

const waitForThrottleTimerCompletion = () => {
  return new Promise(resolve => setTimeout(resolve, THROTTLE_TIMER_COMPLETION_TIMEOUT))
}

test.describe('Project Migration', () => {
  test.beforeEach(async ({page, memex}) => {
    await memex.navigateToStory('integrationTestLiveUpdates')
    await page.waitForSelector(_('live-update-listener'), {state: 'attached'})
    /**
     * Ensure the socket channel element is in the dom
     */
    await page.waitForSelector(MESSAGE_SOCKET_CHANNEL_ELEMENT_SELECTOR, {
      state: 'attached',
    })
  })

  test('Should display migration progress bar overlay with the correct message when the source project is closed', async ({
    page,
  }) => {
    await emitMockMigrationMessage(page, 'pending')

    await assertMigrationStatusMessage(page, 'Starting migration…')

    // Updates status when a new migration message is received
    await emitMockMigrationMessage(page, 'in_progress_status_fields')
    await assertMigrationStatusMessage(page, 'Creating project columns…')

    // Processes the completion message correctly
    await emitMockMigrationMessage(page, 'completed', true)
    await assertMigrationStatusMessage(
      page,
      '• Your classic project has been closed and is read-only.• Users visiting the classic project will be linked to this one.',
    )

    // Ignores messages received out of order
    await emitMockMigrationMessage(page, 'in_progress_permissions')
    await assertMigrationStatusMessage(
      page,
      '• Your classic project has been closed and is read-only.• Users visiting the classic project will be linked to this one.',
    )

    const doneButton = page.getByTestId('migration-popover').getByRole('button', {name: 'Done'})
    await expect(doneButton).toBeVisible()
  })

  test('should display the correct message on completion when the source project is still open', async ({page}) => {
    await emitMockMigrationMessage(page, 'pending')

    await assertMigrationStatusMessage(page, 'Starting migration…')

    // Updates status when a new migration message is received
    await emitMockMigrationMessage(page, 'in_progress_status_fields')
    await assertMigrationStatusMessage(page, 'Creating project columns…')

    // Processes the completion message correctly when the project is still open
    await emitMockMigrationMessage(page, 'completed', false)
    await assertMigrationStatusMessage(
      page,
      "Your classic project is still open, but future changes won't be synchronized.",
    )
  })

  test('Should display error state when migration with error status is received', async ({page}) => {
    await emitMockMigrationMessage(page, 'pending')
    await assertMigrationStatusMessage(page, 'Starting migration…')

    // Updates status when a new migration message is received
    await emitMockMigrationMessage(page, 'in_progress_status_fields')
    await assertMigrationStatusMessage(page, 'Creating project columns…')

    // Processes the completion message correctly
    await emitMockMigrationMessage(page, 'error')
    await assertMigrationStatusMessage(page, 'Your project could not be migrated.')

    const tryAgainButton = page.getByTestId('migration-popover').getByRole('button', {name: 'Try again'})
    await expect(tryAgainButton).toBeVisible()

    const cancelButton = page.getByTestId('migration-popover').getByRole('button', {name: 'Cancel'})
    await expect(cancelButton).toBeVisible()

    // Ignores any other progress messages that might be sent
    await emitMockMigrationMessage(page, 'in_progress_permissions')
    await assertMigrationStatusMessage(page, 'Your project could not be migrated.')

    // Ignores any other progress messages that might be sent
    await emitMockMigrationMessage(page, 'completed')
    await assertMigrationStatusMessage(page, 'Your project could not be migrated.')
  })

  test('Clicking Cancel button after error dismisses the dialog', async ({page}) => {
    await emitMockMigrationMessage(page, 'error')
    await assertMigrationStatusMessage(page, 'Your project could not be migrated.')

    const cancelMigrationResponse = page.waitForResponse(r => r.url().endsWith('memex-migration-cancel-api-data-url'))

    await page.getByTestId('migration-popover').getByRole('button', {name: 'Cancel'}).click()

    // assert that this request was made to the backend as a result of clicking the button
    await cancelMigrationResponse

    await expect(page.getByTestId('migration-popover')).toBeHidden()
  })

  test('Clicking Try Again button after error redirects to new page', async ({page}) => {
    const initialUrl = page.url()

    await emitMockMigrationMessage(page, 'error')
    await assertMigrationStatusMessage(page, 'Your project could not be migrated.')

    await page.getByTestId('migration-popover').getByRole('button', {name: 'Try again'}).click()

    await page.waitForLoadState()

    expect(page.url()).not.toBe(initialUrl)
  })

  test('Shows appropriate message when the migration is automated', async ({page}) => {
    await emitMockMigrationMessage(page, 'in_progress_permissions', false, true)
    await assertMigrationStatusMessage(
      page,
      'This project is being migrated as part of the sunset for Projects (classic). Learn more',
      true,
    )

    await emitMockMigrationMessage(page, 'completed', false, true)

    await assertMigrationStatusMessage(
      page,
      'This project has been migrated as part of the sunset for Projects (classic). Learn more',
      true,
    )

    const popover = page.getByTestId('migration-popover')
    await popover.getByRole('button', {name: 'Done'}).click()
    await expect(popover).toBeHidden()
  })
})
