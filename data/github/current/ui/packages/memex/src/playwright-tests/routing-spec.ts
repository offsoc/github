import {expect} from '@playwright/test'

import {test} from './fixtures/test-extended'
import {mustFind} from './helpers/dom/assertions'
import {_} from './helpers/dom/selectors'

test.describe('Routing', () => {
  test.describe('Settings page', () => {
    test('User with admin permission can access', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestSettingsPage', {
        testIdToAwait: 'settings-side-nav',
        viewerPrivileges: {
          viewerRole: 'admin',
        },
      })
      const heading = await page.textContent('h2')

      expect(heading).toEqual('Project settings')
    })
    test('User with write permission can access', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestSettingsPage', {
        testIdToAwait: 'settings-side-nav',
        viewerPrivileges: {
          viewerRole: 'write',
        },
      })
      const heading = await page.textContent('h2')

      expect(heading).toEqual('Project settings')
    })
    test('User with read permission can not access', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestSettingsPage', {
        testIdToAwait: '404-page',
        viewerPrivileges: {
          viewerRole: 'read',
        },
      })

      await mustFind(page, _('404-page'))
    })
  })

  test.describe('Settings field page', () => {
    test('User with admin permission can access', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestSettingsFieldPage', {
        testIdToAwait: 'settings-side-nav',
        viewerPrivileges: {
          viewerRole: 'admin',
        },
      })
      const heading = await page.textContent('h2')

      expect(heading).toEqual('Status field settings')
    })
    test('User with write permission can access', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestSettingsFieldPage', {
        testIdToAwait: 'settings-side-nav',
        viewerPrivileges: {
          viewerRole: 'write',
        },
      })
      const heading = await page.textContent('h2')

      expect(heading).toEqual('Status field settings')
    })
    test('User with read permission can not access', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestSettingsFieldPage', {
        testIdToAwait: '404-page',
        viewerPrivileges: {
          viewerRole: 'read',
        },
      })

      await mustFind(page, _('404-page'))
    })
  })

  test.describe('Settings access page', () => {
    test('User with admin permission can access', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestAccessSettingsPage', {
        testIdToAwait: 'access-settings',
      })
      const heading = await page.textContent('h2')

      expect(heading).toEqual('Who has access')
    })
    test('User with write permission can not access', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestAccessSettingsPage', {
        testIdToAwait: '404-page',
        viewerPrivileges: {
          viewerRole: 'write',
        },
      })

      await mustFind(page, _('404-page'))
    })
    test('User with read permission can not access', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestAccessSettingsPage', {
        testIdToAwait: '404-page',
        viewerPrivileges: {
          viewerRole: 'read',
        },
      })

      await mustFind(page, _('404-page'))
    })
  })
})
