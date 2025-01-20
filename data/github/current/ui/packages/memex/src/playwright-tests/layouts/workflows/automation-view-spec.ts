import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {mustFind} from '../../helpers/dom/assertions'
import {_} from '../../helpers/dom/selectors'

test.describe('Workflow view Tests', () => {
  test('the automation page can be navigated to/from with a mouse', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.navigateToAutomationPage()
    await memex.automationPage.expectAutomationPageVisible()

    await memex.topBarNavigation.returnToProjectView()

    await memex.automationPage.expectAutomationPageNotVisible()
  })

  test('the automation page can be navigated to and from with back/forward', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.navigateToAutomationPage()
    await memex.automationPage.expectAutomationPageVisible()

    await page.goBack()

    await memex.automationPage.expectAutomationPageNotVisible()

    await page.goForward()

    await memex.automationPage.expectAutomationPageVisible()
  })

  test('the automation page is not visible if memex_automation_enabled disabled', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsInEnterpriseMode', {
      serverFeatures: {memex_automation_enabled: false},
    })

    await expect(memex.topBarNavigation.AUTOMATION_SETTINGS_NAV_BUTTON).toHaveCount(0)

    const url = new URL(page.url())
    url.pathname += '/workflows'
    await page.goto(`${url}`)
    await mustFind(page, _('404-page'))
  })
})
