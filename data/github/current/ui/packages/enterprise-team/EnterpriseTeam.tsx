import {useEffect, useState} from 'react'
import {Box, Pagination} from '@primer/react'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import SearchAndAddView from './EnterpriseTeamViewSearch'
import EmptyList from './EmptyList'
import type {EnterpriseTeam, User} from './types'
import TeamList from './TeamList'

export interface EnterpriseTeamProps {
  business_slug: string
  enterprise_team: EnterpriseTeam
  members: User[]
  total_members: number
  direct_memberships_enabled: boolean
  page_size: number
  member_suggestions_path: string
  readonly: boolean
  use_member_organizations_path_for_user_links: boolean
}

const pluralize = (count: number, noun: string, suffix = 's') => `${count} ${noun}${count !== 1 ? suffix : ''}`

const TableHeader = ({numMembers, teamName}: {numMembers: number; teamName: string}) => (
  // eslint-disable-next-line github/a11y-role-supports-aria-props
  <Box
    aria-labelledby="select-all-container"
    sx={{
      bg: 'canvas.subtle',
      borderBottom: '1px solid',
      borderBottomColor: 'border.muted',
    }}
  >
    <Box sx={{color: 'muted', display: 'flex', alignContent: 'center', padding: '13px'}}>
      <div>
        {pluralize(numMembers, 'member')} in {teamName}
      </div>
    </Box>
  </Box>
)

export function EnterpriseTeam({
  business_slug: businessSlug,
  enterprise_team: enterpriseTeam,
  members,
  total_members: initialTotalMembers,
  direct_memberships_enabled: directMembershipsEnabled,
  member_suggestions_path: memberSuggestionsPath,
  page_size: pageSize,
  readonly,
  use_member_organizations_path_for_user_links: useMemberOrganizationsPathForUserLinks,
}: EnterpriseTeamProps) {
  const [urlSearchParams, setUrlSearchParams] = useState(new URLSearchParams(''))
  const [currentPage, setCurrentPage] = useState(1)
  const [searchboxValue, setSearchboxValue] = useState('')
  const [membersToRender, setMembersToRender] = useState(members)
  const [totalMembers, setTotalMembers] = useState(initialTotalMembers)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setUrlSearchParams(params)
    setSearchboxValue(params.get('query') || '')
    setCurrentPage(parseInt(params.get('page') || '1'))
  }, [setUrlSearchParams, setSearchboxValue, setCurrentPage])

  const refreshData = () => {
    paginate(currentPage)
  }
  const setSearchParam = (key: string, value: string) => {
    urlSearchParams.set(key, value)
    window.history.replaceState({...window.history.state}, '', `?${urlSearchParams.toString()}`)
  }
  const handleSearchChange = (value: string) => {
    setSearchboxValue(value)
    setSearchParam('query', value)
    paginate(1)
  }
  const onPageChange: Parameters<typeof Pagination>['0']['onPageChange'] = (e, page) => {
    e.preventDefault()
    paginate(page)
  }
  const paginate = async (page: number): Promise<void> => {
    setLoading(true)
    setSearchParam('page', page.toString())

    const result = await verifiedFetchJSON(
      `/enterprises/${businessSlug}/teams/${enterpriseTeam.slug}/members?${urlSearchParams.toString()}`,
      {
        method: 'GET',
        headers: {Accept: 'application/json'},
      },
    )
    const data = await result.json()

    setMembersToRender(data.members)
    setTotalMembers(data.total_members)
    setCurrentPage(page)
    setLoading(false)
  }

  const addMember = () => {
    refreshData()
  }

  const removeMember = () => {
    paginate(currentPage)
  }

  return (
    // eslint-disable-next-line github/a11y-role-supports-aria-props
    <div aria-labelledby="enterprise-team-page-container">
      <SearchAndAddView
        addMember={addMember}
        addMemberPath={`/enterprises/${businessSlug}/teams/${enterpriseTeam.slug}/members`}
        editPath={`/enterprises/${businessSlug}/teams/${enterpriseTeam.slug}/edit`}
        directMembershipsEnabled={directMembershipsEnabled}
        loading={loading}
        searchboxValue={searchboxValue}
        onSearchChange={handleSearchChange}
        memberSuggestionsPath={memberSuggestionsPath}
        teamName={enterpriseTeam.name}
        hideAddMemberButton={readonly}
        hideEditTeamButton={readonly}
      />
      {/* eslint-disable-next-line github/a11y-role-supports-aria-props */}
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
          <TableHeader numMembers={totalMembers} teamName={enterpriseTeam.name} />
          {membersToRender.length > 0 ? (
            <TeamList
              enterpriseTeam={enterpriseTeam}
              members={membersToRender}
              businessSlug={businessSlug}
              removeMemberPath={`/enterprises/${businessSlug}/teams/${enterpriseTeam.slug}/members`}
              directMembershipsEnabled={directMembershipsEnabled}
              removeMember={removeMember}
              hideRemoveMemberButtons={readonly}
              useMemberOrganizationsPathForUserLinks={useMemberOrganizationsPathForUserLinks}
            />
          ) : (
            <EmptyList />
          )}
        </Box>
      </Box>
      {totalMembers > pageSize && (
        <Pagination
          showPages={totalMembers > pageSize}
          pageCount={Math.ceil(totalMembers / pageSize)}
          currentPage={currentPage}
          onPageChange={onPageChange}
          data-testid="pagination"
        />
      )}
    </div>
  )
}
