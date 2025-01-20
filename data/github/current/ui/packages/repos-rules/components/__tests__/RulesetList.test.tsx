import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {DEFAULT_BRANCH_PATTERN, RulesetEnforcement} from '../../types/rules-types'
import {
  createRuleset,
  createRule,
  createRefNameCondition,
  createUpsellInfo,
  createPropertyCondition,
} from '../../test-utils/mock-data'

import {RulesetList} from '../RulesetList'
import {mockFetch} from '@github-ui/mock-fetch'

const samples = {
  repo: {
    id: 1,
    name: 'my-repo',
    ownerLogin: 'my-repo',
    defaultBranch: 'main',
    createdAt: '2021-01-01',
  },
  org: {
    id: 1,
    name: 'my-org',
    ownerLogin: 'my-org',
  },
}

describe('RulesetList', () => {
  describe('summary', () => {
    describe('for repository source type', () => {
      test('should render given an empty disabled ruleset', () => {
        const ruleset = createRuleset()

        render(
          <RulesetList
            rulesets={[ruleset]}
            upsellInfo={createUpsellInfo()}
            sourceType="repository"
            source={samples.repo}
            setFlashAlert={() => {}}
          />,
        )

        expect(screen.getByRole('listitem')).toBeInTheDocument()
        expect(screen.getByText('Test Ruleset')).toBeInTheDocument()
        expect(screen.getByText('Disabled')).toBeInTheDocument()
      })

      test('should render given an enabled ruleset with rules and include conditions', () => {
        const ruleset = createRuleset({
          enforcement: RulesetEnforcement.Enabled,
          rules: [createRule()],
          conditions: [createRefNameCondition(['m.+'], [])],
          matches: ['main', 'master'],
        })

        render(
          <RulesetList
            rulesets={[ruleset]}
            upsellInfo={createUpsellInfo()}
            sourceType="repository"
            source={samples.repo}
            setFlashAlert={() => {}}
          />,
        )

        expect(screen.getByText('1 branch rule', {exact: false})).toBeInTheDocument()
        expect(screen.getByText('targeting 2 branches', {exact: false})).toBeInTheDocument()
      })

      test('should render given an enabled ruleset with 1 rules and exclude conditions', () => {
        const ruleset = createRuleset({
          enforcement: RulesetEnforcement.Enabled,
          rules: [createRule()],
          conditions: [createRefNameCondition([], ['m.+'])],
          matches: [],
        })

        render(
          <RulesetList
            rulesets={[ruleset]}
            upsellInfo={createUpsellInfo()}
            sourceType="repository"
            source={samples.repo}
            setFlashAlert={() => {}}
          />,
        )

        expect(screen.getByText('1 branch rule', {exact: false})).toBeInTheDocument()
        expect(screen.getByText('targeting 0 branches', {exact: false})).toBeInTheDocument()
      })

      test('should render given an enabled ruleset with 1 rule and default branch included', () => {
        const ruleset = createRuleset({
          enforcement: RulesetEnforcement.Enabled,
          rules: [createRule()],
          conditions: [createRefNameCondition([DEFAULT_BRANCH_PATTERN], [])],
          matches: ['main'],
        })

        render(
          <RulesetList
            rulesets={[ruleset]}
            upsellInfo={createUpsellInfo()}
            sourceType="repository"
            source={samples.repo}
            setFlashAlert={() => {}}
          />,
        )

        expect(screen.getByText('1 branch rule', {exact: false})).toBeInTheDocument()
        expect(screen.getByText('targeting 1 branch', {exact: false})).toBeInTheDocument()
      })

      test('should render given an enabled ruleset 4 or more conditions', () => {
        const ruleset = createRuleset({
          enforcement: RulesetEnforcement.Enabled,
          rules: [createRule()],
          conditions: [createRefNameCondition([DEFAULT_BRANCH_PATTERN, 'main', 'master', 'releases\\/\\d+'], [])],
          matches: ['main', 'master', 'releases/1', 'releases/2', 'releases/3'],
        })

        render(
          <RulesetList
            rulesets={[ruleset]}
            upsellInfo={createUpsellInfo()}
            sourceType="repository"
            source={samples.repo}
            setFlashAlert={() => {}}
          />,
        )

        expect(screen.getByText('1 branch rule', {exact: false})).toBeInTheDocument()
        expect(screen.getByText('targeting 5 branches', {exact: false})).toBeInTheDocument()
      })

      test('should render given a ruleset with 1 property condition', () => {
        const ruleset = createRuleset({
          enforcement: RulesetEnforcement.Enabled,
          rules: [createRule()],
          conditions: [createPropertyCondition()],
          matches: ['main'],
        })

        render(
          <RulesetList
            rulesets={[ruleset]}
            upsellInfo={createUpsellInfo()}
            sourceType="repository"
            source={samples.repo}
            setFlashAlert={() => {}}
          />,
        )

        expect(screen.getByText('1 branch rule', {exact: false})).toBeInTheDocument()
      })
    })

    describe('for organization source type', () => {
      test('should render given an enabled ruleset with rules and include ref name conditions with targets calculated in the payload', () => {
        const rulesets = [
          createRuleset({
            enforcement: RulesetEnforcement.Enabled,
            rules: [createRule()],
            conditions: [createRefNameCondition(['m.+'], [])],
            matches: ['parchis', 'parchis-1', 'parchis-10'],
            source: {
              id: 1,
              type: 'Organization',
              name: 'my-org',
            },
          }),
        ]

        render(
          <RulesetList
            rulesets={rulesets}
            upsellInfo={createUpsellInfo()}
            sourceType="organization"
            source={samples.org}
            setFlashAlert={() => {}}
          />,
        )

        expect(screen.getByText('1 branch rule', {exact: false})).toBeInTheDocument()
        expect(screen.getByText('targeting 3 repositories', {exact: false})).toBeInTheDocument()
      })

      test('should render given an enabled ruleset fetching the repository target calculation for a property condition', async () => {
        const rulesets = [
          createRuleset({
            id: 3,
            rules: [createRule()],
            conditions: [createPropertyCondition()],
            matches: '',
            source: {
              id: 1,
              type: 'Organization',
              name: 'my-org',
            },
          }),
        ]

        render(
          <RulesetList
            rulesets={rulesets}
            upsellInfo={createUpsellInfo()}
            sourceType="organization"
            source={samples.org}
            setFlashAlert={() => {}}
          />,
          {
            appPayload: {['enabled_features']: {['property_ruleset_async_preview']: true}},
          },
        )

        await act(() =>
          mockFetch.resolvePendingRequest('/organizations/my-org/settings/rules/deferred_target_counts', {
            preview: [{rulesetId: 3, count: 15}],
          }),
        )

        expect(screen.getByText('1 branch rule', {exact: false})).toBeInTheDocument()
        expect(screen.getByText('targeting 15 repositories', {exact: false})).toBeInTheDocument()
      })
    })
  })
})
