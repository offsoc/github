import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {GrowthBannerPartial} from '../GrowthBannerPartial'

test('Renders the Tag Protection Deprecation Header', () => {
  render(<GrowthBannerPartial bannerType="tag_protection_deprecation_header" />)

  expect(screen.getByTestId('growth-banner-partial')).toHaveTextContent(
    'Level up your tag protections with Repository Rules',
  )
  expect(screen.getByTestId('growth-banner-partial')).toHaveTextContent(
    'Protected tags are being deprecated. To continue protecting tags, please migrate to a tag ruleset by August 30th. You can learn more about the sunset in our',
  )
  expect(screen.getByTestId('growth-banner-partial')).toHaveTextContent('changelog')
  expect(screen.getByTestId('growth-banner-partial')).toHaveTextContent(
    'and can get started now by migrating to rulesets.',
  )
})

test('Renders the Branch Protection Deprecation Header', () => {
  render(
    <GrowthBannerPartial
      bannerType="branch_protection_deprecation_header"
      childrenProps={{helpUrl: 'helpUrl', rulesetsPath: 'rulesetsPath'}}
    />,
  )

  expect(screen.getByTestId('growth-banner-partial')).toHaveTextContent(
    'Level up your branch protections with Repository Rules',
  )
  expect(screen.getByTestId('growth-banner-partial')).toHaveTextContent(
    'Take advantage of new features such as signed commits, requiring status checks, requiring linear history, and more!',
  )
  expect(screen.getByTestId('growth-banner-partial')).toHaveTextContent('Learn more')
  expect(screen.getByTestId('growth-banner-partial')).toHaveTextContent('Go to rulesets')
})

test('Renders the Branch Protection Deprecation Blankslate', () => {
  render(
    <GrowthBannerPartial
      bannerType="branch_protection_deprecation_blankslate"
      childrenProps={{
        helpUrl: 'helpUrl',
        newBranchRulesetPath: 'newBranchRulesetPath',
        newClassicBranchProtectionPath: 'newClassicBranchProtectionPath',
      }}
    />,
  )

  expect(screen.getByTestId('growth-banner-partial')).toHaveTextContent("You haven't protected any of your branches")
  expect(screen.getByTestId('growth-banner-partial')).toHaveTextContent(
    'Define branch rules to disable force pushing, prevent branches from being deleted, or require pull requests before merging. Learn more about',
  )
  expect(screen.getByTestId('growth-banner-partial')).toHaveTextContent('repository rules')
  expect(screen.getByTestId('growth-banner-partial')).toHaveTextContent('protected branches')
  expect(screen.getByTestId('growth-banner-partial')).toHaveTextContent('Add branch ruleset')
  expect(screen.getByTestId('growth-banner-partial')).toHaveTextContent('Add classic branch protection rule')
})
