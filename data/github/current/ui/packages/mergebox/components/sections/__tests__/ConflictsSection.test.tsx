import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {
  conflictsSectionCleanMergeState,
  conflictsSectionComplexConflictsMergeState,
  conflictsSectionPendingMergeState,
  conflictsSectionStandardConflictsMergeState,
} from '../../../test-utils/query-data'
import {ConflictsSection as TestComponent} from '../ConflictsSection'
import type {ConflictsSectionProps} from '../ConflictsSection'

const conflictSectionPullRequest = {
  baseRefName: 'main',
  id: 'pr-123',
  resourcePath: '/octocat/Hello-World/pull/123',
  viewerCanUpdateBranch: false,
  viewerLogin: 'monalisa',
  onUpdateBranch: jest.fn(),
}

describe('CLEAN, UNSTABLE, and HAS_HOOKS merge state status map to clean state of the conflicts section', () => {
  test('when mergeStateStatus is CLEAN, renders clean merge state', async () => {
    const props: ConflictsSectionProps = {
      ...conflictSectionPullRequest,
      ...conflictsSectionCleanMergeState,
    }
    render(<TestComponent {...props} />)

    expect(screen.getByText('Merging can be performed automatically.')).toBeInTheDocument()
    expect(screen.getByText('This branch has no conflicts with the base branch')).toBeInTheDocument()
  })

  test('when mergeStateStatus is UNSTABLE, renders clean merge state', async () => {
    const props: ConflictsSectionProps = {
      ...conflictSectionPullRequest,
      ...conflictsSectionCleanMergeState,
      mergeStateStatus: 'UNSTABLE',
    }
    render(<TestComponent {...props} />)

    expect(screen.getByText('Merging can be performed automatically.')).toBeInTheDocument()
    expect(screen.getByText('This branch has no conflicts with the base branch')).toBeInTheDocument()
  })

  test('when mergeStateStatus is HAS_HOOKS, renders clean merge state', async () => {
    const props: ConflictsSectionProps = {
      ...conflictSectionPullRequest,
      ...conflictsSectionCleanMergeState,
      mergeStateStatus: 'HAS_HOOKS',
    }
    render(<TestComponent {...props} />)

    expect(screen.getByText('Merging can be performed automatically.')).toBeInTheDocument()
    expect(screen.getByText('This branch has no conflicts with the base branch')).toBeInTheDocument()
  })

  test('clean merge state shows update branch button if viewer can update branch', async () => {
    const props: ConflictsSectionProps = {
      ...conflictSectionPullRequest,
      ...conflictsSectionCleanMergeState,
      mergeStateStatus: 'HAS_HOOKS',
      viewerCanUpdateBranch: true,
    }
    render(<TestComponent {...props} />)

    expect(screen.getByRole('button', {name: 'Update branch'})).toBeInTheDocument()
  })

  test('clean merge state does not show update branch button if viewer cannot update branch', async () => {
    const props: ConflictsSectionProps = {
      ...conflictSectionPullRequest,
      ...conflictsSectionCleanMergeState,
      mergeStateStatus: 'HAS_HOOKS',
      viewerCanUpdateBranch: false,
    }
    render(<TestComponent {...props} />)

    expect(screen.queryByRole('button', {name: 'Update branch'})).not.toBeInTheDocument()
  })
})

describe('pending state', () => {
  test('when mergeStateStatus is UNKNOWN and viewer cannot update branch, renders pending merge state', async () => {
    const props: ConflictsSectionProps = {
      ...conflictSectionPullRequest,
      ...conflictsSectionPendingMergeState,
      viewerCanUpdateBranch: false,
    }
    render(<TestComponent {...props} />)

    expect(screen.getByText("Hang in there while we check the branch's status.")).toBeInTheDocument()
    expect(screen.getByText('Checking for the ability to merge automatically...')).toBeInTheDocument()
    expect(screen.queryByText('Update branch')).not.toBeInTheDocument()
  })

  test('when mergeStateStatus is UNKNOWN and viewer can update branch, renders pending merge state with update branch button', async () => {
    const props: ConflictsSectionProps = {
      ...conflictSectionPullRequest,
      ...conflictsSectionPendingMergeState,
      viewerCanUpdateBranch: true,
    }
    render(<TestComponent {...props} />)

    expect(screen.getByText("Hang in there while we check the branch's status.")).toBeInTheDocument()
    expect(screen.getByText('Checking for the ability to merge automatically...')).toBeInTheDocument()
    expect(screen.getByText('Update branch')).toBeInTheDocument()
    expect(screen.getByLabelText('Update branch options')).toBeInTheDocument()
  })
})

describe('has merge conflicts', () => {
  test('when mergeStateStatus is DIRTY, renders standard conflicts merge state', async () => {
    const props: ConflictsSectionProps = {
      ...conflictSectionPullRequest,
      ...conflictsSectionStandardConflictsMergeState,
    }
    render(<TestComponent {...props} />)

    expect(screen.getByText('web editor')).toBeInTheDocument()
    expect(screen.getByText('This branch has conflicts that must be resolved')).toBeInTheDocument()
    expect(screen.getByText('conflict.md')).toBeInTheDocument()
    expect(screen.getByText('conflict2.md')).toBeInTheDocument()
    expect(screen.getByText('Resolve conflicts')).toBeInTheDocument()
  })

  test('when mergeStateStatus is DIRTY, renders complex conflicts merge state', async () => {
    const props: ConflictsSectionProps = {
      ...conflictSectionPullRequest,
      ...conflictsSectionComplexConflictsMergeState,
    }
    render(<TestComponent {...props} />)

    expect(
      screen.getByText(
        'Resolve conflicts then push again. These conflicts are too complex to resolve in the web editor. Actions workflows will not trigger on activity from this pull request while it has merge conflicts.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('This branch has conflicts that must be resolved')).toBeInTheDocument()
    expect(screen.getByText('conflict.md')).toBeInTheDocument()
    expect(screen.getByText('conflict2.md')).toBeInTheDocument()
    expect(screen.queryByText('Resolve conflicts')).not.toBeInTheDocument()
  })
})

describe('out of date state', () => {
  test('when mergeStateStatus is BEHIND and viewer can update branch, renders branch out of date merge state with update button', async () => {
    const props: ConflictsSectionProps = {
      ...conflictSectionPullRequest,
      mergeStateStatus: 'BEHIND',
      conflictsCondition: {
        conflicts: [],
        isConflictResolvableInWeb: false,
        result: 'PASSED',
        message: null,
      },
      viewerCanUpdateBranch: true,
    }

    const {user} = render(<TestComponent {...props} />)

    expect(
      screen.getByText(
        'Merge the latest changes from main into this branch. This merge commit will be associated with monalisa.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('This branch is out-of-date with the base branch')).toBeInTheDocument()
    expect(screen.getByText('Update branch')).toBeInTheDocument()
    const toggleModeButton = screen.getByLabelText('Update branch options')
    await user.click(toggleModeButton)
    const rebaseButton = screen.getByText('Update with rebase')
    await user.click(rebaseButton)
    expect(screen.getByText('Rebase branch')).toBeInTheDocument()
  })

  test('when mergeStateStatus is BEHIND and viewer cannot update branch, renders branch out of date merge state without update button', async () => {
    const props: ConflictsSectionProps = {
      ...conflictSectionPullRequest,
      mergeStateStatus: 'BEHIND',
      conflictsCondition: {
        conflicts: [],
        isConflictResolvableInWeb: false,
        result: 'PASSED',
        message: null,
      },
      viewerCanUpdateBranch: false,
    }

    render(<TestComponent {...props} />)

    expect(
      screen.getByText(
        'Merge the latest changes from main into this branch. This merge commit will be associated with monalisa.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('This branch is out-of-date with the base branch')).toBeInTheDocument()
    expect(screen.queryByText('Update branch')).not.toBeInTheDocument()
  })

  test('when mergeStateStatus is BLOCKED, and user can update branch, renders branch out of date merge state', async () => {
    const props: ConflictsSectionProps = {
      ...conflictSectionPullRequest,
      mergeStateStatus: 'BLOCKED',
      conflictsCondition: {
        conflicts: [],
        isConflictResolvableInWeb: false,
        result: 'PASSED',
        message: null,
      },
      viewerCanUpdateBranch: true,
    }

    const {user} = render(<TestComponent {...props} />)

    expect(
      screen.getByText(
        'Merge the latest changes from main into this branch. This merge commit will be associated with monalisa.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('This branch is out-of-date with the base branch')).toBeInTheDocument()
    expect(screen.getByText('Update branch')).toBeInTheDocument()
    const toggleModeButton = screen.getByLabelText('Update branch options')
    await user.click(toggleModeButton)
    const rebaseButton = screen.getByText('Update with rebase')
    await user.click(rebaseButton)
    expect(screen.getByText('Rebase branch')).toBeInTheDocument()
  })

  test('when mergeStateStatus is BLOCKED and user cannot update the branch, renders nothing', async () => {
    const props: ConflictsSectionProps = {
      ...conflictSectionPullRequest,
      mergeStateStatus: 'BLOCKED',
      conflictsCondition: {
        conflicts: [],
        isConflictResolvableInWeb: false,
        result: 'PASSED',
        message: null,
      },
      viewerCanUpdateBranch: false,
    }

    const {container} = render(<TestComponent {...props} />)

    expect(container).toBeEmptyDOMElement()
  })
})

test('sends analytics events for updating branch', async () => {
  const props: ConflictsSectionProps = {
    ...conflictSectionPullRequest,
    mergeStateStatus: 'BEHIND',
    conflictsCondition: {
      conflicts: [],
      isConflictResolvableInWeb: false,
      result: 'PASSED',
      message: null,
    },
    viewerCanUpdateBranch: true,
  }
  const {user} = render(<TestComponent {...props} />)

  const toggleModeButton = screen.getByRole('button', {name: 'Update branch options'})
  await user.click(toggleModeButton)
  const rebaseMenuItem = screen.getByText('Update with rebase')
  await user.click(rebaseMenuItem)
  await user.click(toggleModeButton)
  const mergeCommitMenuItem = screen.getByText('Update with merge commit')
  await user.click(mergeCommitMenuItem)
  const updateBranchButton = screen.getByRole('button', {name: 'Update branch'})
  await user.click(updateBranchButton)

  expectAnalyticsEvents(
    {
      type: 'conflicts_section.select_rebase_method',
      target: 'MERGEBOX_CONFLICTS_SECTION_MERGE_METHOD_MENU_ITEM',
    },
    {type: 'conflicts_section.select_merge_commit_method', target: 'MERGEBOX_CONFLICTS_SECTION_MERGE_METHOD_MENU_ITEM'},
    {type: 'conflicts_section.update_branch', target: 'MERGEBOX_CONFLICTS_SECTION_UPDATE_BRANCH_BUTTON'},
  )
})
