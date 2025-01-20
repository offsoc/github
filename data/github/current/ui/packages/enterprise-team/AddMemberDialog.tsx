import {Box, Button, Dialog, Spinner, TextInput} from '@primer/react'
import {PersonIcon, XCircleFillIcon} from '@primer/octicons-react'
import {debounce} from '@github/mini-throttle'
import {useEffect, useRef, useState} from 'react'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {ownerAvatarPath} from '@github-ui/paths'
import {verifiedFetch, verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {User} from './types'

type AddMemberDialogProps = {
  teamName: string
  isOpen: boolean
  onDialogClose: () => void
  searchInput: string
  setSearchInput: (value: string) => void
  addMember: () => void
  addMemberPath: string
  memberSuggestionsPath: string
}

const AddMemberDialog = ({
  teamName,
  isOpen,
  onDialogClose,
  searchInput,
  setSearchInput,
  addMember,
  addMemberPath,
  memberSuggestionsPath,
}: AddMemberDialogProps) => {
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedMember, setSelectedMember] = useState<User | null>(null)
  const [showLoadingSpinner, setShowLoadingSpinner] = useState<boolean>(false)
  const [visibleErrorMessage, setVisibleErrorMessage] = useState<string>('')
  useEffect(() => {
    // When the user selects a member from the dropdown, the textbox value will change and this effect will trigger
    // If the user has fast network and an error is already displayed by the time we reach this logic, the error might end up hidden - so we ignore the event
    if (searchInput !== selectedMember?.login) {
      setVisibleErrorMessage('')
    }
  }, [searchInput, selectedMember])

  const onAddToTeam = async () => {
    setVisibleErrorMessage('')
    setShowLoadingSpinner(true)
    try {
      let responseJson = await submitAddToTeam()
      setShowLoadingSpinner(false)

      if (responseJson.data === undefined) {
        setSearchInput(selectedMember?.login ?? '')
        setVisibleErrorMessage('An error occurred.')
      } else {
        responseJson = responseJson.data
        if (responseJson.error === undefined) {
          addMember()
          handleClose()
        } else {
          setSearchInput(selectedMember?.login ?? '')
          setVisibleErrorMessage(responseJson.error)
        }
      }
    } catch (error) {
      // Unexpected error like 422 or 500
      setSearchInput(selectedMember?.login ?? '')
      setVisibleErrorMessage('An error occurred.')
      setShowLoadingSpinner(false)
    }
  }

  const submitAddToTeam = async () => {
    const formData = new FormData()
    formData.append('user_login', selectedMember!.login)
    const response = await verifiedFetch(addMemberPath, {
      method: 'POST',
      body: formData,
      headers: {Accept: 'application/json'},
    })
    return await response.json()
  }

  const handleClose = () => {
    setVisibleErrorMessage('')
    setSearchInput('')
    setSelectedMember(null)
    onDialogClose()
  }

  const callSearch = async (input: string) => {
    input = input.trim()
    if (input.length > 0) {
      try {
        const result = await verifiedFetchJSON(`${memberSuggestionsPath}?query=${input.toString()}`, {
          method: 'GET',
          headers: {Accept: 'application/json'},
        })
        const results = await result.json()
        setSearchResults(results.enterprise_members)
      } catch (error) {
        setVisibleErrorMessage('An error occurred while looking for members.')
      }
    }
  }

  const debounceSearch = useRef(debounce((input: string) => callSearch(input), 500))

  const handleSearchChange = (input: string) => {
    setSelectedMember(null)
    setSearchInput(input)
    setVisibleErrorMessage('')
    setSearchResults([])
    debounceSearch.current(input)
  }

  return (
    <Dialog title="Add Member to team" isOpen={isOpen} onDismiss={handleClose}>
      <Box sx={{padding: '34px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <h3 className="blankslate">Add member to {teamName}</h3>
        <div style={{position: 'relative', width: '100%'}}>
          <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
            <TextInput
              leadingVisual={PersonIcon}
              aria-label="Search by username or full name"
              name="search"
              placeholder={'Search by username or full name'}
              value={selectedMember?.login ?? searchInput}
              onChange={e => handleSearchChange(e.target.value)}
              sx={{
                bg: 'canvas.subtle',
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                width: '100%',
              }}
            />
            <Button
              onClick={onAddToTeam}
              sx={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                marginLeft: '-1px',
              }}
              variant="primary"
              disabled={!selectedMember || showLoadingSpinner}
            >
              {showLoadingSpinner ? <Spinner size="small" sx={{mt: '5px'}} /> : 'Add'}
            </Button>
          </div>
          {searchInput && !selectedMember && searchResults.length > 0 && (
            <Box
              className="autocomplete-results"
              sx={{
                position: 'absolute',
              }}
            >
              {searchResults.map(result => (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div
                  data-testid="member-suggestion-result"
                  className="member-suggestion typeahead-result"
                  onClick={() => {
                    setSelectedMember(result)
                    setSearchResults([])
                  }}
                  key={result.id}
                >
                  <GitHubAvatar square sx={{ml: '1px'}} size={24} src={ownerAvatarPath({owner: result.login})} />
                  <Box sx={{display: 'inline', marginLeft: '5px'}}>
                    {result.login} <Box sx={{color: 'grey'}}>{result.name}</Box>
                  </Box>
                </div>
              ))}
            </Box>
          )}
        </div>
        {visibleErrorMessage && (
          <Box sx={{color: 'red', mt: '2px', fontSize: '12px', alignSelf: 'flex-start', alignItems: 'flex-start'}}>
            <XCircleFillIcon size={12} /> {visibleErrorMessage}
          </Box>
        )}
      </Box>
    </Dialog>
  )
}

export default AddMemberDialog
