// Allow this import here so we can override it directly
// eslint-disable-next-line no-restricted-imports
import {test as base} from '@playwright/test'

import {getTestEnvironment, TestEnvironment} from '../helpers/environment'
import {ClipboardFixture} from './clipboard'
import {MemexApp} from './memex-app'

export const test = base.extend<{memex: MemexApp; clipboard: ClipboardFixture}>({
  memex: async ({page}, use) => {
    return use(new MemexApp(page))
  },
  clipboard: async ({page, context}, use) => {
    const fixture = new ClipboardFixture(context, page)
    try {
      await fixture.grantPermissions()
    } catch (e) {
      // can't do this automatically inside ClipboardFixture because it would be a circular import
      test.skip(true, 'Clipboard API is not supported in this browser.')
    }
    await use(fixture)
  },
})

if (getTestEnvironment() === TestEnvironment.Dotcom) {
  test.beforeEach(({page}) => {
    let pageLoadCount = 0
    page.on('load', () => {
      pageLoadCount += 1

      test.fixme(pageLoadCount > 1, 'test is navigating to a page more than once')
    })
  })
}

if (process.env.CI) {
  test.afterEach(({}, testInfo) => {
    if (testInfo.retry > 0) {
      testInfo.annotations.push({type: 'dd_tags[retries]', description: `${testInfo.retry}`})
    }
  })
}
