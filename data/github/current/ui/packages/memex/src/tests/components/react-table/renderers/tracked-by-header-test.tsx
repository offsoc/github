import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {TrackedByGroupHeaderLabel} from '../../../../client/components/common/group/label/tracked-by-group-header-label'
import {useEnabledFeatures} from '../../../../client/hooks/use-enabled-features'
import {useSidePanel} from '../../../../client/hooks/use-side-panel'
import {OldBugTrackedItem} from '../../../../mocks/memex-items/tracked-issues'
import {stubGetItemsTrackedByParent} from '../../../mocks/api/memex-items'
import {asMockHook} from '../../../mocks/stub-utilities'
import {createTrackedByItemsStateProviderWrapper} from '../../../state-providers/tracked-by-items/helpers'

jest.mock('../../../../client/hooks/use-enabled-features')
jest.mock('../../../../client/hooks/use-side-panel')

describe('withTrackedByGroupHeader', () => {
  beforeEach(() => {
    asMockHook(useEnabledFeatures).mockReturnValue({
      tasklist_block: true,
    })

    asMockHook(useSidePanel).mockReturnValue({
      openProjectItemInPane: jest.fn(),
    })
  })

  it('makes a request to server when grouping by tracked by', async () => {
    const {trackedByWrapper} = createTrackedByItemsStateProviderWrapper()

    const getItemsTrackedByParentStub = stubGetItemsTrackedByParent({
      count: 0,
      items: [],
      parentCompletion: {completed: 0, total: 0, percent: 0},
    })

    render(<TrackedByGroupHeaderLabel trackedBy={OldBugTrackedItem} rowCount={0} hideItemsCount aggregates={[]} />, {
      wrapper: trackedByWrapper,
    })

    expect(await screen.findByTestId('tracked-by-completion-pill')).toBeInTheDocument()
    await waitFor(() => expect(getItemsTrackedByParentStub).toHaveBeenCalledTimes(1))
  })

  it('does not make a request to server when feature flag is turned off', () => {
    asMockHook(useEnabledFeatures).mockReturnValue({
      tasklist_block: false,
    })

    const {trackedByWrapper} = createTrackedByItemsStateProviderWrapper()

    const getItemsTrackedByParentStub = stubGetItemsTrackedByParent({
      count: 0,
      items: [],
      parentCompletion: {completed: 0, total: 0, percent: 0},
    })

    render(
      <TrackedByGroupHeaderLabel trackedBy={OldBugTrackedItem} rowCount={0} hideItemsCount={false} aggregates={[]} />,
      {
        wrapper: trackedByWrapper,
      },
    )

    expect(getItemsTrackedByParentStub).not.toHaveBeenCalled()
  })

  it('does not show completion pill when feature flag is off', () => {
    asMockHook(useEnabledFeatures).mockReturnValue({
      tasklist_block: false,
    })
    const {trackedByWrapper} = createTrackedByItemsStateProviderWrapper()

    render(
      <TrackedByGroupHeaderLabel trackedBy={OldBugTrackedItem} rowCount={0} hideItemsCount={false} aggregates={[]} />,
      {
        wrapper: trackedByWrapper,
      },
    )

    expect(screen.queryByTestId('tracked-by-completion-pill')).not.toBeInTheDocument()
  })

  it('shows completion pill when feature flag is on', async () => {
    const {trackedByWrapper} = createTrackedByItemsStateProviderWrapper()

    render(
      <TrackedByGroupHeaderLabel trackedBy={OldBugTrackedItem} rowCount={0} hideItemsCount={false} aggregates={[]} />,
      {
        wrapper: trackedByWrapper,
      },
    )

    expect(await screen.findByTestId('tracked-by-completion-pill')).toBeInTheDocument()
  })

  it('renders the issue owner information by default', () => {
    const {trackedByWrapper} = createTrackedByItemsStateProviderWrapper()

    render(
      <TrackedByGroupHeaderLabel trackedBy={OldBugTrackedItem} rowCount={0} hideItemsCount={false} aggregates={[]} />,
      {
        wrapper: trackedByWrapper,
      },
    )

    const link = screen.getByRole('link', {name: 'github/github#123'})
    expect(link).toBeVisible()
    expect(link).toHaveTextContent('github/github#123')
  })

  it('can hide the issue owner information until hover/focus', async () => {
    const {trackedByWrapper} = createTrackedByItemsStateProviderWrapper()

    render(
      <TrackedByGroupHeaderLabel
        trackedBy={OldBugTrackedItem}
        rowCount={0}
        hideItemsCount={false}
        aggregates={[]}
        showOwnerOnFocus
      />,
      {
        wrapper: trackedByWrapper,
      },
    )

    // Visual text is partially hidden, but accessible name is still there in full
    const link = screen.getByRole('link', {name: 'github/github#123'})
    expect(link).toBeVisible()

    // Full text is visible on hover
    expect(link).toHaveTextContent('#123')
    await userEvent.hover(link)
    expect(link).toHaveTextContent('github/github#123')

    // Full text is visible on focus
    await userEvent.unhover(link)
    expect(link).toHaveTextContent('#123')
    await userEvent.tab()
    expect(link).toHaveTextContent('github/github#123')
  })

  it('does not display items count if hideItemsCount is true', () => {
    const {trackedByWrapper} = createTrackedByItemsStateProviderWrapper()

    render(
      <TrackedByGroupHeaderLabel
        trackedBy={OldBugTrackedItem}
        rowCount={10}
        hideItemsCount
        aggregates={[]}
        showOwnerOnFocus
      />,
      {
        wrapper: trackedByWrapper,
      },
    )

    expect(screen.queryByText('10')).not.toBeInTheDocument()
  })

  it('shows field sums and items count', () => {
    const {trackedByWrapper} = createTrackedByItemsStateProviderWrapper()
    const aggregates = [
      {name: 'foo', sum: 9000, maxDecimalPlaces: 0},
      {name: 'baz', sum: 4, maxDecimalPlaces: 0},
    ]
    render(
      <TrackedByGroupHeaderLabel
        trackedBy={OldBugTrackedItem}
        rowCount={10}
        hideItemsCount={false}
        aggregates={aggregates}
        showOwnerOnFocus
      />,
      {
        wrapper: trackedByWrapper,
      },
    )

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByTestId('column-sum-foo')).toHaveTextContent('foo: 9000')
    expect(screen.getByTestId('column-sum-baz')).toHaveTextContent('baz: 4')
  })
})
