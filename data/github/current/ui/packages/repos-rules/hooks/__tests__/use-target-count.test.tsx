import {act, renderHook} from '@testing-library/react'
import {useTargetCount} from '../use-target-count'
import {
  createPropertyCondition,
  createRefNameCondition,
  createRepoIdCondition,
  createRule,
  createRuleset,
} from '../../test-utils/mock-data'
import {expectMockFetchCalledTimes, expectMockFetchCalledWith, mockFetch} from '@github-ui/mock-fetch'
import {Wrapper} from '@github-ui/react-core/test-utils'
import type React from 'react'
import type {SourceType} from '../../types/rules-types'
import type {Repository} from '@github-ui/current-repository'
import type {Organization} from '@github-ui/repos-types'

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

const orgSource = {...samples.org, type: 'organization'}
const repoSource = {...samples.repo, type: 'repository'}

const getWrapper = ({preview, isStafftools = false}: {preview: boolean; isStafftools?: boolean}) => {
  const WrapperComponent: React.FC<{children: React.ReactNode}> = ({children}) => (
    <Wrapper
      appPayload={{
        ['enabled_features']: {['property_ruleset_async_preview']: preview},
        ['is_stafftools']: isStafftools,
      }}
    >
      {children}
    </Wrapper>
  )
  WrapperComponent.displayName = 'CreatePreviewWrapper'
  return WrapperComponent
}

describe('useTargetCount', () => {
  it('do not fetch previews when the payload contains the matches already', () => {
    const rulesets = [
      createRuleset({
        id: 1,
        rules: [createRule()],
        conditions: [createRefNameCondition(['n.+'], [])],
        matches: ['smile-1', 'smile-2', 'smile-3'],
        source: orgSource,
      }),
      createRuleset({
        id: 2,
        rules: [createRule()],
        conditions: [createPropertyCondition()],
        matches: ['smile-2'],
        source: orgSource,
      }),
      createRuleset({
        id: 4,
        rules: [createRule()],
        conditions: [createRefNameCondition(['n.+'], [])],
        matches: 'Unable to display affected targets due to a large number of repositories in this organization.',
        source: orgSource,
      }),
    ]

    const {result} = renderHook(() => useTargetCount(samples.org, 'organization', rulesets), {
      wrapper: getWrapper({preview: true}),
    })

    expectMockFetchCalledTimes('/organizations/my-org/settings/rules/deferred_target_counts', 0)
    expect(result.current.rulesetPreviewCounts).toEqual({
      '1': 3,
      '2': 1,
    })
    expect(result.current.rulesetPreviewSamples).toEqual({
      '1': ['smile-1', 'smile-2', 'smile-3'],
      '2': ['smile-2'],
    })
    expect(result.current.rulesetPreviewErrors).toEqual({
      '4': 'Unable to display affected targets due to a large number of repositories in this organization.',
    })
  })

  it.each`
    level             | rulesetSource | condition                    | expectedUrl
    ${'organization'} | ${orgSource}  | ${createRefNameCondition()}  | ${'/organizations/my-org'}
    ${'organization'} | ${orgSource}  | ${createPropertyCondition()} | ${'/organizations/my-org'}
    ${'organization'} | ${orgSource}  | ${createRepoIdCondition()}   | ${'/organizations/my-org'}
    ${'repository'}   | ${repoSource} | ${createRefNameCondition()}  | ${'/my-repo/my-repo'}
    ${'repository'}   | ${repoSource} | ${createPropertyCondition()} | ${'/my-repo/my-repo'}
    ${'repository'}   | ${repoSource} | ${createRepoIdCondition()}   | ${'/my-repo/my-repo'}
    ${'repository'}   | ${orgSource}  | ${createRefNameCondition()}  | ${'/my-repo/my-repo'}
    ${'repository'}   | ${orgSource}  | ${createPropertyCondition()} | ${'/my-repo/my-repo'}
    ${'repository'}   | ${orgSource}  | ${createRepoIdCondition()}   | ${'/my-repo/my-repo'}
  `(
    'fetch a preview for a $condition.target $rulesetSource.type ruleset at $level',
    async ({level, rulesetSource, condition, expectedUrl}) => {
      const rulesets = [
        createRuleset({
          id: 1,
          rules: [createRule()],
          conditions: [condition],
          matches: undefined,
          source: rulesetSource,
        }),
      ]

      const hookSource: Repository | Organization = level === 'organization' ? samples.org : samples.repo
      const {result} = renderHook(() => useTargetCount(hookSource, level as SourceType, rulesets), {
        wrapper: getWrapper({preview: true}),
      })

      await act(() =>
        mockFetch.resolvePendingRequest(`${expectedUrl}/settings/rules/deferred_target_counts`, {
          preview: [{rulesetId: 1, count: 15}],
        }),
      )

      expectMockFetchCalledTimes(`${expectedUrl}/settings/rules/deferred_target_counts`, 1)
      expectMockFetchCalledWith(`${expectedUrl}/settings/rules/deferred_target_counts`, {ruleset_ids: [1]}, 'equal')

      expect(result.current.rulesetPreviewCounts).toEqual({'1': 15})
      expect(result.current.rulesetPreviewSamples).toEqual({})
      expect(result.current.rulesetPreviewErrors).toEqual({})
    },
  )

  it.each`
    level             | rulesetSource | expectedUrl
    ${'organization'} | ${orgSource}  | ${'/organizations/my-org'}
    ${'repository'}   | ${orgSource}  | ${'/my-repo/my-repo'}
    ${'repository'}   | ${repoSource} | ${'/my-repo/my-repo'}
  `(
    `do not fetch the target count at $level level for a $rulesetSource.type ruleset when FF is off`,
    async ({level, rulesetSource, expectedUrl}) => {
      const rulesets = [
        createRuleset({
          id: 3,
          rules: [createRule()],
          conditions: [createPropertyCondition()],
          matches: undefined,
          source: rulesetSource,
        }),
      ]

      const hookSource: Repository | Organization = level === 'organization' ? samples.org : samples.repo
      renderHook(() => useTargetCount(hookSource, level as SourceType, rulesets), {
        wrapper: getWrapper({preview: false}),
      })
      expectMockFetchCalledTimes(`${expectedUrl}/settings/rules/deferred_target_counts`, 0)
    },
  )

  it('fetch preview for multiple repo name rulesets', async () => {
    const rulesets = [
      createRuleset({
        id: 1,
        rules: [createRule()],
        conditions: [createRefNameCondition(['m.+'], [])],
        matches: '',
        source: orgSource,
      }),
      createRuleset({
        id: 2,
        rules: [createRule()],
        conditions: [createRefNameCondition(['n.+'], [])],
        matches: '',
        source: orgSource,
      }),
      createRuleset({
        id: 3,
        rules: [createRule()],
        conditions: [createRefNameCondition(['n.+'], [])],
        matches: '',
        source: orgSource,
      }),
    ]

    const {result} = renderHook(() => useTargetCount(samples.org, 'organization', rulesets, 3), {
      wrapper: getWrapper({preview: true}),
    })

    await act(() => {
      mockFetch.resolvePendingRequest('/organizations/my-org/settings/rules/deferred_target_counts', {
        preview: [
          {rulesetId: 1, count: 15, sampleTargetNames: ['smile-1', 'smile-2', 'smile-3']},
          {rulesetId: 2, count: 0, sampleTargetNames: []},
          {
            rulesetId: 3,
            errorMessage:
              'Unable to display affected targets due to a large number of repositories in this organization.',
          },
        ],
      })
    })

    expect(result.current.rulesetPreviewCounts).toEqual({
      '1': 15,
      '2': 0,
    })
    expect(result.current.rulesetPreviewSamples).toEqual({
      '1': ['smile-1', 'smile-2', 'smile-3'],
      '2': [],
    })
  })

  it('fetch multiple previews when number of property rulesets is bigger than the batch size', async () => {
    const rulesets = Array.from({length: 5}, (_, i) =>
      createRuleset({
        id: i + 1,
        rules: [createRule()],
        conditions: [createPropertyCondition()],
        matches: '',
        source: orgSource,
      }),
    )

    const {result} = renderHook(() => useTargetCount(samples.org, 'organization', rulesets, 3), {
      wrapper: getWrapper({preview: true}),
    })

    await act(() => {
      mockFetch.resolvePendingRequest('/organizations/my-org/settings/rules/deferred_target_counts', {
        preview: [
          {rulesetId: 1, count: 10},
          {rulesetId: 2, count: 2},
          {rulesetId: 3, count: 30},
        ],
      })
    })
    await act(() => {
      mockFetch.resolvePendingRequest('/organizations/my-org/settings/rules/deferred_target_counts', {
        preview: [
          {rulesetId: 4, count: 0},
          {rulesetId: 5, count: 5},
        ],
      })
    })

    expect(result.current.rulesetPreviewCounts).toEqual({
      '1': 10,
      '2': 2,
      '3': 30,
      '4': 0,
      '5': 5,
    })
    expect(result.current.rulesetPreviewSamples).toEqual({})
  })

  it('fetch separate previews for property and repo name rulesets', async () => {
    const rulesets = [
      createRuleset({
        id: 1,
        rules: [createRule()],
        conditions: [createRefNameCondition(['m.+'], [])],
        matches: '',
        source: orgSource,
      }),
      createRuleset({
        id: 2,
        rules: [createRule()],
        conditions: [createRefNameCondition(['n.+'], [])],
        matches: '',
        source: orgSource,
      }),
      createRuleset({
        id: 3,
        rules: [createRule()],
        conditions: [createPropertyCondition()],
        matches: '',
        source: orgSource,
      }),
    ]

    const {result} = renderHook(() => useTargetCount(samples.org, 'organization', rulesets), {
      wrapper: getWrapper({preview: true}),
    })

    expectMockFetchCalledWith(
      '/organizations/my-org/settings/rules/deferred_target_counts',
      {ruleset_ids: [1, 2]},
      'equal',
    )

    await act(() => {
      mockFetch.resolvePendingRequest('/organizations/my-org/settings/rules/deferred_target_counts', {
        preview: [
          {rulesetId: 1, count: 2, sampleTargetNames: ['smile-1', 'smile-2']},
          {rulesetId: 2, count: 0, sampleTargetNames: []},
        ],
      })
    })
    expectMockFetchCalledWith(
      '/organizations/my-org/settings/rules/deferred_target_counts',
      {ruleset_ids: [3]},
      'equal',
    )

    await act(() => {
      mockFetch.resolvePendingRequest('/organizations/my-org/settings/rules/deferred_target_counts', {
        preview: [{rulesetId: 3, count: 13}],
      })
    })

    expect(result.current.rulesetPreviewCounts).toEqual({
      '1': 2,
      '2': 0,
      '3': 13,
    })

    expect(result.current.rulesetPreviewSamples).toEqual({
      '1': ['smile-1', 'smile-2'],
      '2': [],
    })
  })

  it.each`
    level             | rulesetSource | expectedUrl
    ${'organization'} | ${orgSource}  | ${'/organizations/my-org'}
    ${'repository'}   | ${repoSource} | ${'/my-repo/my-repo'}
  `('does not update the preview when the fetch fails at $level level', async ({level, rulesetSource, expectedUrl}) => {
    const rulesets = [
      createRuleset({
        id: 3,
        rules: [createRule()],
        conditions: [createRefNameCondition()],
        matches: undefined,
        source: rulesetSource,
      }),
    ]

    const hookSource: Repository | Organization = level === 'organization' ? samples.org : samples.repo
    const {result} = renderHook(() => useTargetCount(hookSource, level as SourceType, rulesets), {
      wrapper: getWrapper({preview: true}),
    })

    await act(() =>
      mockFetch.resolvePendingRequest(`${expectedUrl}/settings/rules/deferred_target_counts`, undefined, {
        ok: false,
      }),
    )

    expect(result.current.rulesetPreviewCounts).toEqual({})
    expect(result.current.rulesetPreviewSamples).toEqual({})
  })

  it.each`
    level             | rulesetSource | expectedUrl
    ${'organization'} | ${orgSource}  | ${'/organizations/my-org'}
    ${'repository'}   | ${repoSource} | ${'/my-repo/my-repo'}
  `('does not update the preview when the fetch fails at $level level', async ({level, rulesetSource, expectedUrl}) => {
    const rulesets = [
      createRuleset({
        id: 3,
        rules: [createRule()],
        conditions: [createPropertyCondition()],
        matches: '',
        source: rulesetSource,
      }),
    ]

    const hookSource: Repository | Organization = level === 'organization' ? samples.org : samples.repo
    const {result} = renderHook(() => useTargetCount(hookSource, level as SourceType, rulesets), {
      wrapper: getWrapper({preview: true}),
    })

    await act(() =>
      mockFetch.rejectPendingRequest(`${expectedUrl}/settings/rules/deferred_target_counts`, 'Something went wrong'),
    )

    expect(result.current.rulesetPreviewCounts).toEqual({})
    expect(result.current.rulesetPreviewSamples).toEqual({})
  })

  it('does not fetch the target count when source is a repository and matches are present', () => {
    const repoRulesets = [
      createRuleset({
        id: 1,
        rules: [createRule()],
        conditions: [createRefNameCondition(['m.+'], [])],
        matches: ['main'],
      }),
      createRuleset({
        id: 2,
        rules: [createRule()],
        conditions: [createRefNameCondition(['n.+'], [])],
        matches: ['main', 'master'],
      }),
      createRuleset({
        id: 3,
        rules: [createRule()],
        conditions: [createRefNameCondition(['n.+'], [])],
        matches: 'Unable to display affected targets due to a large number of branches in this repository',
      }),
      createRuleset({
        id: 4,
        rules: [createRule()],
        conditions: [createRefNameCondition(['n.+'], [])],
        matches: '',
      }),
    ]

    const {result} = renderHook(() => useTargetCount(samples.repo, 'repository', repoRulesets), {
      wrapper: getWrapper({preview: true}),
    })

    expectMockFetchCalledTimes('/organizations/my-org/settings/rules/deferred_target_counts', 0)
    expect(result.current.rulesetPreviewCounts).toEqual({
      '1': 1,
      '2': 2,
    })
    expect(result.current.rulesetPreviewSamples).toEqual({
      '1': ['main'],
      '2': ['main', 'master'],
    })
    expect(result.current.rulesetPreviewErrors).toEqual({
      '3': 'Unable to display affected targets due to a large number of branches in this repository',
    })
  })

  it('fetch the target count for multiple ref_name ruleset at repo level', async () => {
    const rulesets = [
      createRuleset({
        id: 1,
        rules: [createRule()],
        matches: undefined,
      }),
      createRuleset({
        id: 2,
        rules: [createRule()],
        matches: undefined,
      }),
    ]

    const {result} = renderHook(() => useTargetCount(samples.repo, 'repository', rulesets), {
      wrapper: getWrapper({preview: true}),
    })

    await act(() =>
      mockFetch.resolvePendingRequest('/my-repo/my-repo/settings/rules/deferred_target_counts', {
        preview: [
          {rulesetId: 1, count: 3},
          {rulesetId: 2, count: 5},
        ],
      }),
    )

    expectMockFetchCalledTimes('/my-repo/my-repo/settings/rules/deferred_target_counts', 1)
    expectMockFetchCalledWith('/my-repo/my-repo/settings/rules/deferred_target_counts', {ruleset_ids: [1, 2]}, 'equal')

    expect(result.current.rulesetPreviewCounts).toEqual({'1': 3, '2': 5})
    expect(result.current.rulesetPreviewSamples).toEqual({})
    expect(result.current.rulesetPreviewErrors).toEqual({})
  })

  it('fetch the target count for a repo and org rulesets at repo level', async () => {
    const rulesets = [
      createRuleset({
        id: 1,
        rules: [createRule()],
        conditions: [createRefNameCondition(['n.+'], [])],
        matches: undefined,
        source: orgSource,
      }),
      createRuleset({
        id: 2,
        rules: [createRule()],
        matches: undefined,
      }),
    ]

    const {result} = renderHook(() => useTargetCount(samples.repo, 'repository', rulesets), {
      wrapper: getWrapper({preview: true}),
    })

    await act(() =>
      mockFetch.resolvePendingRequest('/my-repo/my-repo/settings/rules/deferred_target_counts', {
        preview: [
          {rulesetId: 1, count: 3},
          {rulesetId: 2, count: 1},
        ],
      }),
    )

    expectMockFetchCalledTimes('/my-repo/my-repo/settings/rules/deferred_target_counts', 1)
    expectMockFetchCalledWith('/my-repo/my-repo/settings/rules/deferred_target_counts', {ruleset_ids: [1, 2]}, 'equal')

    expect(result.current.rulesetPreviewCounts).toEqual({'1': 3, '2': 1})
    expect(result.current.rulesetPreviewSamples).toEqual({})
    expect(result.current.rulesetPreviewErrors).toEqual({})
  })

  it.each`
    level             | rulesetSource | isStafftools | expectedUrl
    ${'organization'} | ${orgSource}  | ${false}     | ${'/organizations/my-org/settings/rules/deferred_target_counts'}
    ${'repository'}   | ${repoSource} | ${false}     | ${'/my-repo/my-repo/settings/rules/deferred_target_counts'}
    ${'organization'} | ${orgSource}  | ${true}      | ${'/stafftools/users/my-org/organization_rules/deferred_target_counts'}
    ${'repository'}   | ${repoSource} | ${true}      | ${'/stafftools/repositories/my-repo/my-repo/repository_rules/deferred_target_counts'}
  `(
    'fetches the target count for a $rulesetSource.type ruleset at $level level when stafftools is $isStafftools',
    async ({level, rulesetSource, isStafftools, expectedUrl}) => {
      const rulesets = [
        createRuleset({
          id: 1,
          rules: [createRule()],
          conditions: [createPropertyCondition()],
          matches: undefined,
          source: rulesetSource,
        }),
      ]

      const hookSource: Repository | Organization = level === 'organization' ? samples.org : samples.repo

      renderHook(() => useTargetCount(hookSource, level as SourceType, rulesets), {
        wrapper: getWrapper({preview: true, isStafftools}),
      })

      expectMockFetchCalledTimes(expectedUrl, 1)
    },
  )
})
