/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders Tag Protection Deprecation Header with SSR', async () => {
  const view = await serverRenderReact({
    name: 'growth-banner-partial',
    data: {props: {bannerType: 'tag_protection_deprecation_header'}},
  })

  expect(view).toContain('Level up your tag protections with Repository Rules')
  expect(view).toContain(
    'Protected tags are being deprecated. To continue protecting tags, please migrate to a tag ruleset by August 30th. You can learn more about the sunset in our',
  )
  expect(view).toContain('changelog')
  expect(view).toContain('and can get started now by migrating to rulesets.')
})

test('Renders Branch Protection Deprecation Header with SSR', async () => {
  const view = await serverRenderReact({
    name: 'growth-banner-partial',
    data: {
      props: {
        bannerType: 'branch_protection_deprecation_header',
        childrenProps: {helpUrl: 'helpUrl', rulesetsPath: 'rulesetsPath'},
      },
    },
  })

  expect(view).toContain('Level up your branch protections with Repository Rules')
  expect(view).toContain(
    'Take advantage of new features such as signed commits, requiring status checks, requiring linear history, and more!',
  )
  expect(view).toContain('Learn more')
  expect(view).toContain('Go to rulesets')
})

test('Renders Branch Protection Deprecation Blankslate with SSR', async () => {
  const view = await serverRenderReact({
    name: 'growth-banner-partial',
    data: {
      props: {
        bannerType: 'branch_protection_deprecation_blankslate',
        childrenProps: {
          helpUrl: 'helpUrl',
          newBranchRulesetPath: 'newBranchRulesetPath',
          newClassicBranchProtectionPath: 'newClassicBranchProtectionPath',
        },
      },
    },
  })

  expect(view).toContain(
    'Define branch rules to disable force pushing, prevent branches from being deleted, or require pull requests before merging. Learn more about',
  )
  expect(view).toContain('repository rules')
  expect(view).toContain('protected branches')
  expect(view).toContain('Add branch ruleset')
  expect(view).toContain('Add classic branch protection rule')
})
