import {Box, Button, TextInput, Spinner} from '@primer/react'
import {SearchIcon} from '@primer/octicons-react'
import {useState, useCallback} from 'react'
import AddMemberDialog from './AddMemberDialog'

const SearchAndAddView = ({
  teamName,
  editPath,
  directMembershipsEnabled,
  loading,
  searchboxValue,
  onSearchChange,
  addMember,
  addMemberPath,
  memberSuggestionsPath,
  hideAddMemberButton = false,
  hideEditTeamButton = false,
}: {
  teamName: string
  editPath: string
  directMembershipsEnabled: boolean
  loading: boolean
  searchboxValue: string
  onSearchChange: (value: string) => void
  addMember: () => void
  addMemberPath: string
  memberSuggestionsPath: string
  hideAddMemberButton?: boolean
  hideEditTeamButton?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const onDialogClose = useCallback(() => {
    setIsOpen(false)
    setSearchInput('')
  }, [])

  return (
    // eslint-disable-next-line github/a11y-role-supports-aria-props
    <Box aria-labelledby="search-and-add-team-container" sx={{mb: 3, display: 'flex', justifyContent: 'space-between'}}>
      <TextInput
        data-testid="search-input"
        leadingVisual={loading ? <Spinner size="small" /> : SearchIcon}
        aria-label="Find a member search bar"
        name="search"
        placeholder="Find a member..."
        sx={{
          width: '30%',
          bg: 'canvas.subtle',
        }}
        value={searchboxValue}
        onChange={e => onSearchChange(e.target.value)}
      />
      <Box sx={{display: 'flex'}}>
        {directMembershipsEnabled && !hideAddMemberButton && (
          <>
            <Button
              sx={{marginRight: '5px'}}
              aria-labelledby="Add a member"
              variant="primary"
              onClick={() => setIsOpen(!isOpen)}
            >
              Add a member
            </Button>
            <AddMemberDialog
              teamName={teamName}
              isOpen={isOpen}
              onDialogClose={onDialogClose}
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              addMember={addMember}
              addMemberPath={addMemberPath}
              memberSuggestionsPath={memberSuggestionsPath}
            />
          </>
        )}
        {!hideEditTeamButton && (
          <Button aria-labelledby="Edit Team" variant="default" onClick={() => (window.location.href = editPath)}>
            Edit team
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default SearchAndAddView
