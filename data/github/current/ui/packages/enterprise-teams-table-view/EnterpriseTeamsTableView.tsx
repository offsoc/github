import {
  Box,
  TextInput,
  Checkbox,
  FormControl,
  Button,
  CheckboxGroup,
  ActionMenu,
  ActionList,
  Flash,
} from '@primer/react'
import {SearchIcon} from '@primer/octicons-react'
import {useState, useCallback, useEffect, useRef, type ChangeEvent} from 'react'
import {TeamListItem} from './TeamListItem'
import EmptyList from './EmptyList'
import {verifiedFetch} from '@github-ui/verified-fetch'
import type {SaveResponse} from '@github-ui/code-view-types'
import {SafeHTMLBox, type SafeHTMLString} from '@github-ui/safe-html'

type EnterpriseTeam = {
  id: number
  name: string
  members: number
  slug: string
  external_group_id: number | null
}

export interface EnterpriseTeamsTableViewProps {
  business_slug: string
  business_name: string
  enterprise_teams: EnterpriseTeam[]
  readonly: boolean
  cannot_create_multiple_teams: boolean
  can_remove_teams: boolean
}

export function EnterpriseTeamsTableView({
  business_slug: businessSlug,
  business_name: businessName,
  enterprise_teams: enterpriseTeams,
  readonly,
  cannot_create_multiple_teams,
  can_remove_teams,
}: EnterpriseTeamsTableViewProps) {
  const [selectedCheckboxValues, setSelectedCheckboxValues] = useState<string[]>([])
  const [isSelectAll, setIfSelectAll] = useState(false)
  const [isIndeterminate, setIsIndeterminate] = useState(false)
  const [showSelectAllBtn, setShowSelectAllBtn] = useState(true)
  const [searchString, setSearchString] = useState('')
  const [flash, setFlash] = useState<SafeHTMLString>('' as SafeHTMLString)

  const handleSelectAll = useCallback(() => {
    setIfSelectAll(!isSelectAll)
    setIsIndeterminate(false)
    setShowSelectAllBtn(!showSelectAllBtn)
    setSelectedCheckboxValues(() => {
      if (!isSelectAll) {
        const filteredTeams = enterpriseTeams.filter(team => team.name.includes(searchString))
        return filteredTeams.map(team => `${team.slug}`)
      } else {
        return []
      }
    })
  }, [enterpriseTeams, isSelectAll, searchString, showSelectAllBtn])

  const handleSelectValues = useCallback((_selected: string[], e: ChangeEvent<HTMLInputElement> | undefined) => {
    if (e && e.target.checked) {
      setSelectedCheckboxValues(prevState => {
        return [...prevState, e.target.name]
      })
    } else if (e) {
      setSelectedCheckboxValues(prevState => {
        return prevState.filter(checkbox => checkbox !== e.target.name)
      })
    }
  }, [])

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchString(event.target.value)
    setSelectedCheckboxValues([])
  }, [])

  useEffect(() => {
    if (selectedCheckboxValues.length === 0) {
      setIfSelectAll(false)
      setIsIndeterminate(false)
      setShowSelectAllBtn(true)
    } else if (selectedCheckboxValues.length === enterpriseTeams.length) {
      setIfSelectAll(true)
      setIsIndeterminate(false)
      setShowSelectAllBtn(false)
    } else {
      setIfSelectAll(false)
      setIsIndeterminate(true)
      setShowSelectAllBtn(false)
    }
  }, [selectedCheckboxValues.length, enterpriseTeams.length])

  const flashRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    flashRef.current?.focus()
  }, [flash, flashRef])

  async function handleDelete() {
    // Todo in follow up PR: Show confirmation window with selected team slugs

    const selectedTeams = enterpriseTeams.filter(team => selectedCheckboxValues.includes(team.slug))
    const formData = new FormData()
    for (const team of selectedTeams) {
      formData.append('team_slugs[]', team.slug)
    }

    const result = await verifiedFetch(`/enterprises/${businessSlug}/teams/bulk_delete`, {
      method: 'DELETE',
      headers: {Accept: 'application/json'},
      body: formData,
    })

    const json: SaveResponse = await result.json()
    if (json.data.redirect) {
      window.location.replace(json.data.redirect)
    } else if (json.data.error) {
      setFlash(json.data.error as SafeHTMLString)
    }
  }

  const filteredTeams = enterpriseTeams.filter(team => team.name.includes(searchString))

  const teamsListItems = filteredTeams.map((enterpriseTeam: EnterpriseTeam) => (
    <TeamListItem
      key={enterpriseTeam.id}
      slug={enterpriseTeam.slug}
      name={enterpriseTeam.name}
      members={enterpriseTeam.members}
      externalGroupId={enterpriseTeam.external_group_id}
      checkable={!readonly && can_remove_teams}
      checked={selectedCheckboxValues.includes(enterpriseTeam.slug)}
    />
  ))
  const teamsList = (
    // eslint-disable-next-line github/a11y-role-supports-aria-props
    <Box aria-labelledby={`team-list-for-${businessSlug}`} sx={{marginTop: '8px'}}>
      {readonly ? (
        teamsListItems
      ) : (
        <CheckboxGroup aria-labelledby="enterprise-team-checkbox-group" onChange={handleSelectValues}>
          {teamsListItems}
        </CheckboxGroup>
      )}
    </Box>
  )

  const tableHeader = !readonly && can_remove_teams && (
    // eslint-disable-next-line github/a11y-role-supports-aria-props
    <Box
      aria-labelledby="select-all-container"
      sx={{
        bg: 'canvas.subtle',
        borderBottom: '1px solid',
        borderBottomColor: 'border.muted',
      }}
    >
      <CheckboxGroup sx={{py: 3, px: 3}} aria-labelledby="select-all">
        <Box sx={{display: 'flex'}}>
          <FormControl sx={{alignItems: 'center'}}>
            <Checkbox
              aria-labelledby="select-all"
              checked={isSelectAll}
              indeterminate={isIndeterminate}
              onChange={handleSelectAll}
              data-testid="select-all-checkbox"
            />
            <FormControl.Label aria-labelledby="select-all" id="select-all" sx={{color: 'fg.muted'}}>
              {showSelectAllBtn && 'Select all'}
              {!showSelectAllBtn && (
                <ActionMenu aria-labelledby="select-all-menu">
                  <ActionMenu.Button data-testid="select-all-menu-button">
                    {selectedCheckboxValues.length > 1
                      ? `${selectedCheckboxValues.length} teams selected`
                      : `${selectedCheckboxValues.length} team selected`}
                  </ActionMenu.Button>
                  <ActionMenu.Overlay>
                    <ActionList>
                      <ActionList.Item data-testid="delete-teams-button" onSelect={() => handleDelete()}>
                        Delete...
                      </ActionList.Item>
                    </ActionList>
                  </ActionMenu.Overlay>
                </ActionMenu>
              )}
            </FormControl.Label>
          </FormControl>
        </Box>
      </CheckboxGroup>
    </Box>
  )

  const shouldDisableButton = cannot_create_multiple_teams && enterpriseTeams.length >= 1

  const searchAndAddView = (
    // eslint-disable-next-line github/a11y-role-supports-aria-props
    <Box aria-labelledby="search-and-add-team-container" sx={{mb: 3, display: 'flex', justifyContent: 'space-between'}}>
      <TextInput
        data-testid="search-input"
        leadingVisual={SearchIcon}
        aria-label="Find a team search bar"
        name="search"
        placeholder="Find a team..."
        sx={{width: '30%', bg: 'canvas.subtle'}}
        onChange={handleSearchChange}
      />
      {!readonly && (
        <Button
          aria-labelledby="new-team-button"
          variant="primary"
          data-testid="new-team-button"
          disabled={shouldDisableButton}
          onClick={() => {
            window.location.href = `/enterprises/${businessSlug}/new_team`
          }}
        >
          New enterprise team
        </Button>
      )}
    </Box>
  )

  return (
    // eslint-disable-next-line github/a11y-role-supports-aria-props
    <div aria-labelledby={`${businessSlug}-team-page-container`} data-testid={`${businessSlug}-team-page-container`}>
      {flash && (
        <Flash tabIndex={0} ref={flashRef} variant="danger" sx={{mb: 2}} data-testid="flash-error">
          <SafeHTMLBox html={flash} />
        </Flash>
      )}
      {enterpriseTeams.length === 0 ? (
        <EmptyList businessName={businessName} businessSlug={businessSlug} hideCreateTeamButton={readonly} />
      ) : (
        <div>
          {searchAndAddView}
          {filteredTeams.length === 0 ? (
            <EmptyList businessName={businessName} businessSlug={businessSlug} searchString={searchString} />
          ) : (
            // eslint-disable-next-line github/a11y-role-supports-aria-props
            <Box
              aria-labelledby="team-list-table-container"
              sx={{border: '1px solid', borderColor: 'border.muted', borderBottom: 'none', borderRadius: 2}}
            >
              {/* eslint-disable-next-line github/a11y-role-supports-aria-props */}
              <Box
                aria-labelledby="team-list-table-view"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {tableHeader}
                {teamsList}
              </Box>
            </Box>
          )}
        </div>
      )}
    </div>
  )
}
