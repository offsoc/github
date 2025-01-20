import {useCallback, useEffect, useState, useRef, useDeferredValue, useMemo} from 'react'
import {Autocomplete, Box, Link, Spinner, Text} from '@primer/react'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useClickAnalytics} from '@github-ui/use-analytics'
import {announce, announceFromElement} from '@github-ui/aria-live'
import {AssignablesTable} from './Ui'
import type {CheckboxTypes, AssignablesResponse, SortName, SeatAssignable, MemberAssignables} from '../../types'
import {SeatType} from '../../types'
import {id} from '../../helpers/id'
import {PAGE_SIZE} from '../../constants'
import SeatAssignableListItem from './SeatAssignableListItem'
import {MemberSort} from './MemberSort'
import {AssignablesSearch} from './AssignablesSearch'
import {usePortal} from '../hooks/use-portal'
import {pluralize} from '../../helpers/text'
import {seatManagementEndpoint} from '../helpers/api-endpoints'
import {useCreateFetcher} from '../../hooks/use-fetchers'
import {SeatCheckboxControl} from '../../components/table/seat-checkbox-control/SeatCheckboxControl'
import {CopilotFlash} from '../../components/CopilotFlash'

interface SelectedSeat {
  name: string
  member_ids?: number[]
}

type SelectedState = {
  Team: SelectedSeat[]
  User: SelectedSeat[]
  OrganizationInvitation: SelectedSeat[]
}
type Props = {
  organization: string
  selected: SelectedState
  setSelected: (data: SelectedState) => void
  selectionError: string
  setSelectionError: (selectionError: string) => void
  newSeatsCount: number
  initialSort?: SortName
  hasPendingRequests?: boolean
  ariaLiveRegionId: string
}

const EMPTY_ASSIGNABLES: MemberAssignables = []
const noResultsContentId = 'no-results-message'
const ariaLiveDebounceTimeInMs = 500

const isUserLikeAssignable = (assignable: SeatAssignable) => {
  return assignable.type === SeatType.User || assignable.type === SeatType.OrganizationInvitation
}

const hasDuplicate = (invites: SeatAssignable[], assignable: SeatAssignable) => {
  return invites.some(item => {
    const isCorrectType =
      item.type === assignable.type && isUserLikeAssignable(item) && isUserLikeAssignable(assignable)
    return isCorrectType && item.display_login === assignable.display_login
  })
}

export function AddMembers(props: Props) {
  const {organization, selected, setSelected, selectionError, setSelectionError, hasPendingRequests, ariaLiveRegionId} =
    props
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortDetails, setSortDetails] = useState<SortName>(props?.initialSort || 'name_asc')
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const [usersToInvite, setInvitations] = useState<Set<SeatAssignable>>(new Set<SeatAssignable>())
  const [assignableUsers, setAssignableUsers] = useState<SeatAssignable[]>([])
  const shouldResetAssignables = useRef(false)
  const shouldUseSortbyRequestDate = hasPendingRequests

  const useCopilotSettingsFetcher = useCreateFetcher(seatManagementEndpoint, {org: organization})
  const {
    loading,
    data: memberData,
    error: fetchError,
  } = useCopilotSettingsFetcher<AssignablesResponse>({
    resource: `members?page=${currentPage}&sort=${sortDetails}&q=${deferredQuery}`,
  })

  const {ref: portalRef} = usePortal({id: 'member-dialog-portal'})
  const {sendClickAnalyticsEvent} = useClickAnalytics()

  const sort = async (sortName: SortName) => {
    setSortDetails(sortName)
  }

  useEffect(() => {
    if (!fetchError) {
      return
    }

    let message = 'Something went wrong. Please try again later.'
    const errorToUse = fetchError
    if (errorToUse && typeof errorToUse === 'object' && 'error' in errorToUse) {
      message = String(errorToUse.error)
    }

    setError(message)
  }, [fetchError])

  // We need to do this as we don't have the concept of an invitation at this stage —
  // just a user we intend to create an OrganizationInvitation for.
  function normalizeCheckboxType(type: CheckboxTypes) {
    return type === SeatType.OrganizationInvitation ? SeatType.User : type
  }

  function sortOptions() {
    const default_options = {
      name_asc: 'Name ascending (A–Z)',
      name_desc: 'Name descending (Z–A)',
    }

    const extra_options = {
      requested_at_asc: 'Requested date (Oldest first)',
      requested_at_desc: 'Requested date (Newest first)',
    }

    return shouldUseSortbyRequestDate ? Object.assign(default_options, extra_options) : default_options
  }

  function handleSetCheckbox(member: SeatAssignable) {
    const type = member.type
    const name = type === SeatType.Team ? member.name : member.display_login

    if (!name) {
      return
    }

    // Search now returns both users and invitations, so we need to check if the member being selected
    // is one of either of those types.
    const assignableUser = memberData?.assignables.find(
      assignable =>
        (assignable.type === SeatType.User || assignable.type === SeatType.OrganizationInvitation) &&
        assignable.display_login === name,
    )

    const normalizedType = normalizeCheckboxType(type)

    const data = {
      name,
      member_ids: type === SeatType.Team ? member.member_ids : type === SeatType.User ? [member.id] : undefined,
    }

    const updated = selected[normalizedType]
    const selectedIndex = selected[normalizedType].findIndex(seat => seat.name === name)

    if (selectedIndex > -1) {
      // If someone was selected, we always want to try to remove them from the invitations list.
      // This will simple recreate the existing list if comparatorId is nullish for any reason.
      setInvitations(assignables => {
        const comparatorId = assignableUser?.id ?? member.id
        return new Set([...Array.from(assignables).filter(item => item.id !== comparatorId)])
      })

      updated.splice(selectedIndex, 1)
    } else {
      setInvitations(assignables => {
        const usersToInviteList = Array.from(assignables)
        if (assignableUser && !assignableUser.org_member && !hasDuplicate(usersToInviteList, assignableUser)) {
          return new Set([...usersToInviteList, assignableUser])
        }
        return assignables
      })

      updated.push(data)
    }

    setSelectionError('')
    setSelected({
      ...selected,
      [normalizedType]: updated,
    })
  }

  const totalAssignables = memberData?.total ?? 0

  const emptyState = () => {
    if (loading && !memberData) {
      return <Spinner data-testid="org-assignables-list-loader" sx={{m: 3}} />
    }

    if (!loading && error) {
      return (
        <Text as="p" sx={{marginTop: '10px'}}>
          Unable to load organization members at this time
        </Text>
      )
    }
  }

  const searchData = memberData?.assignables?.filter(a => !a.id)

  const listEndRef = useRef<HTMLDivElement | null>(null)

  const hasLoadedAllPages = useMemo(() => {
    return currentPage * PAGE_SIZE >= totalAssignables
  }, [currentPage, totalAssignables])

  const loadMore = useCallback(async () => {
    if (loading) return
    if (hasLoadedAllPages) return
    if (query) return

    setCurrentPage(prevPage => prevPage + 1)
  }, [loading, query, hasLoadedAllPages])

  useEffect(() => {
    if (shouldResetAssignables.current) {
      setAssignableUsers(() => {
        const invites = Array.from(usersToInvite)
        const assignables = memberData?.assignables ?? []
        const filtered = assignables.filter(assignable => !hasDuplicate(invites, assignable))

        return filtered
      })
      shouldResetAssignables.current = false
    } else {
      setAssignableUsers(prevItems => {
        const assignables = memberData?.assignables ?? []
        const updates = prevItems.slice()

        // Here, we need to push new assignbles into our list to account
        // for results returned during pagination.
        // If we don't perform this comparison, we'll end up with a list of only
        // the most recent page of data.
        for (const assignable of assignables) {
          if (!prevItems.some(item => item.id === assignable.id)) {
            updates.push(assignable)
          }
        }

        return updates
      })
    }
  }, [memberData, usersToInvite])

  useEffect(() => {
    const listOfUsers = Array.from(usersToInvite)
    for (const member of assignableUsers) {
      if (!usersToInvite.has(member)) {
        listOfUsers.push(member)
      }
    }

    const total = listOfUsers.length
    if (total) {
      setTimeout(() => {
        announce(`${total} members`, {
          element: document.getElementById(ariaLiveRegionId) as HTMLElement,
        })
      }, ariaLiveDebounceTimeInMs)
    } else {
      const noResultsContent = document.getElementById(noResultsContentId) as HTMLElement
      if (!noResultsContent) return
      setTimeout(() => {
        announceFromElement(noResultsContent, {
          element: document.getElementById(ariaLiveRegionId) as HTMLElement,
        })
      }, ariaLiveDebounceTimeInMs)
    }
  }, [usersToInvite, assignableUsers, ariaLiveRegionId])

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target?.isIntersecting) {
        loadMore()
      }
    },
    [loadMore],
  )

  useEffect(() => {
    if (!listEndRef.current) return

    const observer = new IntersectionObserver(handleIntersection, {root: portalRef.current})

    observer.observe(listEndRef.current)

    return () => {
      observer.disconnect()
    }
  }, [handleIntersection, loading, portalRef])

  useEffect(() => {
    shouldResetAssignables.current = true
    setCurrentPage(1)
  }, [sortDetails, deferredQuery])

  const dismissRequest = async (memberFeatureRequestId: number, assignableId: number) => {
    sendClickAnalyticsEvent({
      category: 'member_feature_request',
      action: 'admin_dismissed_request',
      label: `request_id:${memberFeatureRequestId};`,
    })
    const response = await verifiedFetchJSON(`/growth/member_feature_request_dismissals/${memberFeatureRequestId}`, {
      method: 'PATCH',
    })

    if (response.ok) {
      setAssignableUsers(prevItems => prevItems.filter(item => item.id !== assignableId))
    } else {
      const responseError = new Error()
      const statusText = response.statusText ? ` ${response.statusText}` : ''
      responseError.message = `HTTP ${response.status}${statusText}`
      throw responseError
    }
  }

  const invitedUsersList = Array.from(usersToInvite)
  const noDataToDisplay = searchData && assignableUsers.length === 0 && invitedUsersList.length === 0 && !loading

  return (
    <Box as="section" sx={{padding: 3, maxHeight: 360, overflowY: 'auto'}} ref={portalRef}>
      <CopilotFlash sx={{marginTop: 2, marginBottom: 2}} variant="warning">
        {selectionError}
      </CopilotFlash>
      <Box sx={{paddingBottom: 3}}>
        Enter the name, handle, or email of existing members in your organization or invite new members. Invited members
        will receive an email with activation instructions. See the{' '}
        <Link
          href="https://docs.github.com/billing/managing-billing-for-github-copilot/about-billing-for-github-copilot"
          inline
        >
          billing documentation
        </Link>{' '}
        for more details.
      </Box>
      <Autocomplete>
        <AssignablesSearch
          organization={props.organization}
          portalName="member-dialog-portal"
          setQuery={setQuery}
          assignables={searchData ?? EMPTY_ASSIGNABLES}
        />
      </Autocomplete>
      <CopilotFlash sx={{marginTop: 3, marginBottom: 2}}>{error}</CopilotFlash>
      <AssignablesTable
        content={`${pluralize(props.newSeatsCount, 'member', 's')} selected`}
        emptyState={emptyState()}
        data-testid="org-assignables-list"
        trailingActions={<MemberSort sort={sort} sortDetails={sortDetails} sortOptions={sortOptions()} />}
      >
        {noDataToDisplay ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: '1px solid',
              borderColor: 'border.default',
              borderTop: 0,
              borderRadius: '0 0 6px 6px',
              p: 4,
            }}
            id={noResultsContentId}
          >
            <Text as="h4" sx={{fontSize: 2, fontWeight: 'bold'}}>
              No organization members or teams matching “{query}”
            </Text>
            <Text as="p" sx={{color: 'fg.muted', fontSize: 1, lineHeight: 2, ml: 2}}>
              Try searching for a different name, handle, or email address.
            </Text>
          </Box>
        ) : (
          <>
            {invitedUsersList.map((member, index) => {
              const name = member.type === SeatType.Team ? member.name : member.display_login
              const memberId = id(member)
              const checked = selected[normalizeCheckboxType(member.type)].some(seat => seat.name === name)

              return (
                <AssignablesTable.ListItem id={memberId} selected={false} key={`${memberId}-invite`}>
                  <SeatCheckboxControl
                    checked={checked}
                    onChange={() => handleSetCheckbox(member)}
                    selectable={member}
                    label={`Grant access to ${name}`}
                    testId={`${memberId}-checkbox`}
                  />
                  <SeatAssignableListItem owner={props.organization} member={member} key={index} />
                </AssignablesTable.ListItem>
              )
            })}
            {assignableUsers.map((member, index) => {
              const memberId = id(member)
              const name = member.type === SeatType.Team ? member.name : member.display_login
              const checked = selected[normalizeCheckboxType(member.type)].some(seat => seat.name === name)

              // Users to invite are now being returned directly from a search, which means they will appear in
              // the assignables array. We don't want to render them twice, so we return null here.
              // The reason they appear in both arrays is that we want to maintain a separate list
              // of pending invitations at the top of the assignables table.
              if (hasDuplicate(invitedUsersList, member)) {
                return null
              }

              return (
                <AssignablesTable.ListItem id={memberId} selected={false} key={memberId}>
                  <SeatCheckboxControl
                    selectable={member}
                    checked={checked}
                    onChange={() => handleSetCheckbox(member)}
                    label={`Grant access to ${name}`}
                    testId={`${memberId}-checkbox`}
                  />
                  <SeatAssignableListItem
                    owner={props.organization}
                    member={member}
                    key={index}
                    dismissRequest={dismissRequest}
                  />
                </AssignablesTable.ListItem>
              )
            })}
          </>
        )}
      </AssignablesTable>

      {memberData && loading && (
        <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
          <Spinner />
        </Box>
      )}

      <div ref={listEndRef} />
    </Box>
  )
}
