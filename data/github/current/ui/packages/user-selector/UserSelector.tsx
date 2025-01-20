import {GitHubAvatar} from '@github-ui/github-avatar'
import {PeopleIcon, SearchIcon} from '@primer/octicons-react'
import {
  ActionList,
  ActionMenu,
  Box,
  type ButtonProps,
  Flash,
  type OverlayProps,
  Spinner,
  TextInput,
  Octicon,
} from '@primer/react'
import type React from 'react'
import {useState} from 'react'

import type {User, UsersState} from './user-types'
import {UsersList} from './UsersList'

export interface UserSelectorProps {
  /**
   * Default text to display when no user is selected
   */
  defaultText: string
  /**
   * The current selected user.
   */
  usersState: UsersState
  /**
   * The current selected user.
   */
  currentUser?: User
  /**
   * Callback when a user is selected.
   */
  onSelect?: (user: User) => void
  /**
   * The name of the data-hotkey
   */
  hotKey?: string
  /**
   * A callback that is invoked on user selector menu state change.
   */
  onOpenChange?: (open: boolean) => void
  /**
   * Custom content to append to the bottom of the ref selector
   */
  renderCustomFooter?: () => React.ReactNode
  /**
   * Size of the button to render
   * @default 'medium' if not provided
   * Option of 'small', 'medium', or 'large'
   */
  size?: ButtonProps['size']
  /**
   * Whether or not the user selector should provide a filter on whatever the user typed in
   * that didn't have any results in the user list provided.
   */
  showTypedInUser?: boolean
  /**
   * The width of the `ActionMenu.Overlay`.
   * @default 'large' if not provided.
   * Option of 'small', 'medium', 'large', 'xlarge', 'xxlarge', or 'auto'.
   * See Primer React Overlay documentation for more information.
   */
  width?: OverlayProps['width']
  /**
   * Search bar placeholder
   */
  placeholder?: string
  /**
   * Words prepending filter
   */
  label?: string
}

export function UserSelector(props: UserSelectorProps) {
  const {
    defaultText,
    usersState,
    currentUser,
    onSelect,
    hotKey,
    onOpenChange,
    renderCustomFooter,
    size,
    showTypedInUser = false,
    width = 'large',
    label = '',
  } = props
  const [filterText, setFilterText] = useState('')
  const filteredUsers = filterUsersHelper(usersState.users, filterText)

  return (
    <div>
      <ActionMenu onOpenChange={onOpenChange}>
        <ActionMenu.Button data-hotkey={hotKey} size={size} data-testid="user-selector-button">
          <Box sx={{display: 'flex'}}>
            <Box sx={{mr: 2}}>
              {currentUser ? (
                <GitHubAvatar
                  size={16}
                  src={currentUser.primaryAvatarUrl}
                  square={currentUser.path.startsWith('/apps/')}
                />
              ) : (
                <Octicon icon={PeopleIcon} size="small" sx={{color: 'fg.muted'}} />
              )}
            </Box>
            <Box sx={{maxWidth: 125, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              {currentUser ? (
                <span>
                  {label}
                  {currentUser.login}
                </span>
              ) : (
                <span>{defaultText}</span>
              )}
            </Box>
          </Box>
        </ActionMenu.Button>
        <ActionMenu.Overlay width={width}>
          <ActionList showDividers selectionVariant="single">
            <UserFilter defaultText={filterText} onFilterChange={setFilterText} />
            <ActionList.Divider />
            {usersState.loading ? (
              <Loading />
            ) : usersState.error ? (
              <LoadingFailed />
            ) : filteredUsers.length === 0 ? (
              <UsersZeroState showTypedInUser={showTypedInUser} filterText={filterText} onSelect={onSelect} />
            ) : (
              <UsersList
                users={filteredUsers}
                currentUser={currentUser}
                onSelect={onSelect}
                sx={renderCustomFooter ? {pb: '10px', pt: 1} : {pt: 1}}
              />
            )}
            {renderCustomFooter && <ActionList.Divider sx={{marginTop: 0}} />}
            {renderCustomFooter?.()}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </div>
  )
}

function filterUsersHelper(users: User[], filterText: string): User[] {
  if (!users) return []

  const trimmedFilterText = filterText.trim().toLowerCase()
  if (!trimmedFilterText) {
    // Use the full list of users if there is no filterText
    return users
  }

  return users.filter(
    user =>
      user.login.toLowerCase().includes(trimmedFilterText) || user.name?.toLowerCase().includes(trimmedFilterText),
  )
}

interface UserFilterProps {
  onFilterChange: (filterText: string) => void
  defaultText: string
}

function UserFilter({onFilterChange, defaultText}: UserFilterProps) {
  const placeholder = 'Find a user...'
  return (
    <ActionList.Group sx={{px: 2}}>
      <TextInput
        leadingVisual={SearchIcon}
        value={defaultText}
        sx={{width: '100%'}}
        placeholder={placeholder}
        onChange={e => onFilterChange(e.target.value)}
      />
    </ActionList.Group>
  )
}

function Loading() {
  return (
    <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}>
      <Spinner size="medium" aria-label="Loading users..." />
    </Box>
  )
}

function LoadingFailed() {
  return <Flash variant="danger">Could not load users</Flash>
}

function UsersZeroState({
  showTypedInUser,
  filterText,
  onSelect,
}: {
  showTypedInUser: boolean
  filterText: string
  onSelect?: (user: User) => void
}) {
  if (showTypedInUser) {
    return (
      <ActionList.Item
        sx={{display: 'flex', justifyContent: 'center', mb: 2}}
        onSelect={() => {
          //for this onSelect to work, you need to only care about the login property of a given User.
          if (onSelect) {
            onSelect({
              login: filterText,
              name: filterText,
              path: '',
              primaryAvatarUrl: '',
            })
          }
        }}
      >
        <>
          Filter on author&nbsp;
          <Box as="span" sx={{fontWeight: 600}}>
            {filterText}
          </Box>
        </>
      </ActionList.Item>
    )
  }

  return <Box sx={{p: 3, display: 'flex', justifyContent: 'center'}}>Nothing to show</Box>
}
