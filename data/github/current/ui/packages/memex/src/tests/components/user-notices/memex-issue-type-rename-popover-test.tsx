import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {MemexIssueTypeRenamePopover} from '../../../client/components/user-notices/memex-issue-type-rename-popover'
import {not_typesafe_nonNullAssertion} from '../../../client/helpers/non-null-assertion'
import {UserNoticeResources} from '../../../client/strings'
import {org, users} from '../../../mocks/data/users-list'
import {DefaultColumns} from '../../../mocks/mock-data'
import {seedJSONIsland} from '../../../mocks/server/mock-server'
import {stubDismissUserNotice} from '../../mocks/api/user-notices'
import {createUserNoticesStateProvider} from './user-notices-test-helpers'

function seedIslands() {
  seedJSONIsland('memex-user-notices', ['memex_issue_types_rename_prompt'])
  seedJSONIsland('memex-enabled-features', ['issue_types'])
  seedJSONIsland('memex-viewer-privileges', {role: 'admin', canChangeProjectVisibility: true, canCopyAsTemplate: true})
  seedJSONIsland('memex-owner', org)
}

describe('MemexIssueTypeRenamePopover', () => {
  beforeEach(() => {
    seedIslands()
  })

  it('should not render any popover when memex_issue_types_rename_prompt user notice is not present', () => {
    seedJSONIsland('memex-user-notices', [])

    const {anchorRef, wrapper} = createUserNoticesStateProvider()
    render(<MemexIssueTypeRenamePopover anchorRef={anchorRef} />, {wrapper})

    expect(screen.queryByText(UserNoticeResources.IssueTypeRenamePopover.title)).not.toBeInTheDocument()
  })

  it('should not render any popover if user is not admin', () => {
    seedJSONIsland('memex-viewer-privileges', {
      role: 'write',
      canChangeProjectVisibility: true,
      canCopyAsTemplate: true,
    })

    const {anchorRef, wrapper} = createUserNoticesStateProvider()
    render(<MemexIssueTypeRenamePopover anchorRef={anchorRef} />, {wrapper})

    expect(screen.queryByText(UserNoticeResources.IssueTypeRenamePopover.title)).not.toBeInTheDocument()
  })

  it('should not render any popover if user is missing feature flags', () => {
    seedJSONIsland('memex-enabled-features', [])

    const {anchorRef, wrapper} = createUserNoticesStateProvider()
    render(<MemexIssueTypeRenamePopover anchorRef={anchorRef} />, {wrapper})

    expect(screen.queryByText(UserNoticeResources.IssueTypeRenamePopover.title)).not.toBeInTheDocument()
  })

  it('should not render any popover if project owner is not org', () => {
    seedJSONIsland('memex-owner', {...not_typesafe_nonNullAssertion(users[0]), type: 'user'})

    const {anchorRef, wrapper} = createUserNoticesStateProvider()
    render(<MemexIssueTypeRenamePopover anchorRef={anchorRef} />, {wrapper})

    expect(screen.queryByText(UserNoticeResources.IssueTypeRenamePopover.title)).not.toBeInTheDocument()
  })

  it('should not render any popover if user has no custom type column', () => {
    seedJSONIsland('memex-user-notices', [])

    const {anchorRef, wrapper} = createUserNoticesStateProvider(DefaultColumns)
    render(<MemexIssueTypeRenamePopover anchorRef={anchorRef} />, {wrapper})

    expect(screen.queryByText(UserNoticeResources.IssueTypeRenamePopover.title)).not.toBeInTheDocument()
  })

  it('should render popover when memex_issue_types_rename_prompt user notice is present', () => {
    seedJSONIsland('memex-user-notices', ['memex_issue_types_rename_prompt'])

    const {anchorRef, wrapper} = createUserNoticesStateProvider()
    render(<MemexIssueTypeRenamePopover anchorRef={anchorRef} />, {wrapper})

    expect(screen.getByText(UserNoticeResources.IssueTypeRenamePopover.title)).toBeInTheDocument()
  })

  it('should dismiss the notice on dismiss, and not show the announcement prompt', async () => {
    seedJSONIsland('memex-user-notices', ['memex_issue_types_rename_prompt'])
    const dismissUserNoticesStub = stubDismissUserNotice()

    const {anchorRef, wrapper} = createUserNoticesStateProvider()
    render(<MemexIssueTypeRenamePopover anchorRef={anchorRef} />, {wrapper})

    await userEvent.click(
      screen.getByRole('button', {name: UserNoticeResources.IssueTypeRenamePopover.actionSecondary}),
    )

    // Dismiss once for the rename prompt, and once for the announcement
    expect(dismissUserNoticesStub).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(UserNoticeResources.IssueTypeRenamePopover.title)).not.toBeInTheDocument()
  })
})
