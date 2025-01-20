import {expect} from '@playwright/test'

import {DefaultMemex} from '../../mocks/data/memexes'
import {test} from '../fixtures/test-extended'

test.describe('IssueCreator', () => {
  test('carries a title to the creator', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.omnibar.focusAndEnterText('#')
    const repo = page.getByRole('option', {
      name: 'memex',
    })
    await repo.click()
    const createNewIssueButton = page.getByTestId('create-new-issue')
    await test.expect(createNewIssueButton).toBeVisible()
    await memex.omnibar.focusAndEnterText('new issue title')
    await createNewIssueButton.click()

    await test
      .expect(page.getByRole('dialog').getByRole('textbox', {name: 'Add a title'}))
      .toHaveValue('new issue title')
  })

  test('ensures new content is copied, clearing old localStorage value', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await page.evaluate(() => {
      // manually seeding this because we can't import easily across the page eval boundary
      const prefix = ['projects-v2', 'session-store-v1', 'orgs', 'integration', 1, 'issue-creator'].join('/')
      // eslint-disable-next-line no-restricted-properties
      window.localStorage.setItem(`${prefix}.create-issue-title`, 'not-the-correct-title')
    })
    await memex.omnibar.focusAndEnterText('#')
    const repo = page.getByRole('option', {
      name: 'memex',
    })
    await repo.click()
    const createNewIssueButton = page.getByTestId('create-new-issue')
    await test.expect(createNewIssueButton).toBeVisible()
    await memex.omnibar.focusAndEnterText('new issue title')
    await createNewIssueButton.click()

    await test
      .expect(page.getByRole('dialog').getByRole('textbox', {name: 'Add a title'}))
      .toHaveValue('new issue title')

    // expect the project picker to have the memex title prefilled also
    test.expect(page.getByRole('dialog').getByText(DefaultMemex.title, {exact: false}))
  })

  test('returns focus to the omnibar when the issue create dialog is closed', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.omnibar.focusAndEnterText('#')
    // Select a repository
    await memex.omnibar.repositoryList.getRepositoryListItemLocator(1).click()

    await expect(memex.omnibar.issuePicker.ISSUE_PICKER_LIST).toBeVisible()
    const createNewIssueButton = page.getByTestId('create-new-issue')
    await expect(createNewIssueButton).toBeVisible()
    await createNewIssueButton.click()

    await expect(page.getByRole('dialog').getByRole('textbox', {name: 'Add a title'})).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(memex.omnibar.INPUT).toBeFocused()
    await expect(memex.omnibar.issuePicker.ISSUE_PICKER_LIST).toBeVisible()
  })
})
