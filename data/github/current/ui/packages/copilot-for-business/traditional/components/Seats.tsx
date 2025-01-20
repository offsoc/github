import type {Dispatch, SetStateAction} from 'react'
import {currency as formatCurrency} from '@github-ui/formatters'
import {useClickAnalytics} from '@github-ui/use-analytics'
import {CheckIcon, FileIcon, MailIcon, PlusIcon, TrashIcon} from '@primer/octicons-react'
import {Box, Button, Checkbox, Heading, Link, Pagination, Spinner} from '@primer/react'
import React, {useEffect, useState} from 'react'
import {createPortal} from 'react-dom'
import {REDESIGN_PAGE_SIZE as PAGE_SIZE} from '../../constants'
import {createURLParams} from '../../helpers/query'
import {planCost} from '../../helpers/plan'
import {pluralize} from '../../helpers/text'
import {useCopilotSettingsApi} from '../hooks/use-copilot-settings-api'
import {CopilotForBusinessSeatPolicy, SeatType} from '../../types'
import {ConfirmationPaymentDialog} from './ConfirmationDialog'
import {FilterableSearch} from './FilterableSearch'
import {MemberSort} from './MemberSort'
import {NoMemberAccessBlankslate} from './NoMemberAccessBlankslate'
import {NoSearchResultsBlankslate} from './NoSearchResultsBlankslate'
import SeatListItem from './SeatListItem'
import {AddMembersDialog} from './AddMembersDialog'
import {PendingRequestCard} from './PendingRequestCard'
import {anyPendingCancellation} from '../../helpers/seats'
import {usePaginatedSearchQuery} from '../../hooks/use-search-query'
import {useCreateCSV} from '../../hooks/use-create-csv'
import {orgCSVEndpoint} from '../helpers/api-endpoints'
import {CopilotFlash} from '../../components/CopilotFlash'
import type {
  CopilotForBusinessPayload,
  CopilotForBusinessTrial,
  CopilotSeatAssignment,
  SeatBreakdown,
  PlanText,
  SortName,
} from '../../types'

type SeatAssignmentCheckbox = {
  id: number
  type: SeatType
}

type SeatsProps = {
  setPayload: Dispatch<SetStateAction<CopilotForBusinessPayload>>
  payload: CopilotForBusinessPayload
  policy: CopilotForBusinessSeatPolicy
  setCurrentPolicy: (policy: CopilotForBusinessSeatPolicy) => void
  selectedPolicy: CopilotForBusinessSeatPolicy
  setSelectedPolicy: (policy: CopilotForBusinessSeatPolicy) => void
  seatCount: number
  seatBreakdown: SeatBreakdown
  setPolicyChangeIntent: (intent: 'remove' | 'add' | null) => void
  policyChangeIntent: 'remove' | 'add' | null
  membersCount: number
  businessTrial?: CopilotForBusinessTrial
  nextBillingDate: string
  planText: PlanText
}

const FlashMessage = ({onClose}: {onClose: () => void}) => {
  const container = document.getElementById('js-flash-container')
  if (!container) return null
  return createPortal(
    <CopilotFlash full variant="success" onClose={onClose} sx={{display: 'flex', justifyContent: 'space-between'}}>
      <div>
        <CheckIcon />
        The CSV report is being generated and successfully exported.{' '}
      </div>
    </CopilotFlash>,
    container,
  )
}

export function Seats(props: SeatsProps) {
  const {payload, setPayload, policyChangeIntent, policy} = props
  const {organization, seat_breakdown: seatBreakdown, seats: orgSeats, plan_text: planText} = payload
  const seatCount = orgSeats.count
  const pendingRequests = orgSeats.pending_requests
  const seatAssignments = orgSeats.seats
  const licenses = orgSeats.licenses
  const pendingCancellationExists = anyPendingCancellation(seatAssignments)
  const initialSort = pendingCancellationExists ? 'pending_cancelled_asc' : 'name_asc'
  const totalSeatBillingCount = seatBreakdown.seats_billed + seatBreakdown.seats_pending
  const [showAddMembers, setShowAddMembers] = useState(false)
  const [preselectRequesters, setPreselectRequesters] = useState(false)
  const [hasRemoveIntent, setHasRemoveIntent] = useState(false)
  const [didSort, setDidSort] = useState(initialSort === 'pending_cancelled_asc')
  const [checkBoxIndeterminate, setCheckBoxIndeterminate] = useState(false)
  const [allChecked, setAllChecked] = useState(false)
  const [checkBoxes, setCheckBoxes] = useState<SeatAssignmentCheckbox[]>([])
  const {error, callApi} = useCopilotSettingsApi(payload.organization.name)
  const [showFlashMessage, setShowFlashMessage] = useState(false)
  const [hasAssignedSeatRecently, setHasAssignedSeatRecently] = useState(false)
  const {sendClickAnalyticsEvent} = useClickAnalytics()
  const {loading: csvLoading, makeCSVRequest} = useCreateCSV({
    slug: payload.organization.name,
    endpoint: orgCSVEndpoint,
    onSuccess: () => setShowFlashMessage(true),
  })

  const {
    filter: filterDetails,
    getFilterParam,
    query: searchQuery,
    currentPage,
    sortDetails,
    updateSortDetails,
    handleFilter,
    handleSearch,
    paginate: handleSetPage,
  } = usePaginatedSearchQuery({
    initialPage: 1,
    initialSort,
    initialQuery: '',
    initialFilter: SeatType.All,
  })

  const getCheckedSeatAssignmentsByType = (seatType: SeatType) => {
    const checkedTypeIds = checkBoxes.filter(({type}) => type === seatType).map(({id}) => id)
    return seatAssignments
      .filter(({assignable_type, assignable}) => assignable_type === seatType && checkedTypeIds.includes(assignable.id))
      .map(({assignable}) => assignable)
  }

  const assignables = {
    user: getCheckedSeatAssignmentsByType(SeatType.User),
    team: getCheckedSeatAssignmentsByType(SeatType.Team),
    invite: getCheckedSeatAssignmentsByType(SeatType.OrganizationInvitation),
  }

  const checkedIds = {
    user: assignables.user.map(({id}) => id),
    team: assignables.team.map(({id}) => id),
    invite: assignables.invite.map(({id}) => id),
    team_users: assignables.team.flatMap(({member_ids}) => member_ids || []),
    invite_users: assignables.invite.map(({invitee_id = undefined}) => invitee_id).filter(i => !!i),
    invite_emails: assignables.invite.map(({email = undefined}) => email).filter(i => !!i),
  }

  // The `licenses` object contains all the User.ids who have been assigned a seat (direct or team)
  // and Team.ids and Invite.assignee_ids / Invite.emails for Seat Assignments
  const uniqueCheckedUserIds = [...new Set([...checkedIds.user, ...checkedIds.team_users, ...checkedIds.invite_users])]
  const uniqueCheckedUserCount = uniqueCheckedUserIds.length + checkedIds.invite_emails.length
  const newSeatCount = uniqueCheckedUserIds.filter(id => id !== undefined && !licenses.user_ids.includes(id)).length

  const onResendEmails = async () => {
    await callApi<CopilotForBusinessPayload>('send_invitations', {
      method: 'PUT',
      body: {invitation_ids: checkedIds.invite},
    })

    setCheckBoxes([])
  }

  const onPageChange: Parameters<typeof Pagination>['0']['onPageChange'] = (e, page) => {
    e.preventDefault()
    paginate(page)
  }

  const paginate = async (page: number): Promise<void> => {
    const fetched = await fetchSeats({
      sort: `${sortDetails}`,
      type: getFilterParam(filterDetails),
      query: searchQuery,
      page: `${page}`,
    })

    fetched && handleSetPage(page)
  }

  const filter = async (type: SeatType) => {
    const response = await fetchSeats({
      sort: `${sortDetails}`,
      type: getFilterParam(type),
      query: searchQuery,
    })

    if (response) {
      handleFilter(type)
      handleSetPage(1)
    }
  }

  const sort = async (sortName: SortName) => {
    const response = await fetchSeats({
      sort: sortName,
      type: getFilterParam(filterDetails),
      query: searchQuery,
    })
    if (response) {
      updateSortDetails(sortName)
      handleSetPage(1)
      !didSort && setDidSort(true)
    }
  }

  const search = async (query: string) => {
    const response = await fetchSeats({
      sort: `${sortDetails}`,
      type: getFilterParam(filterDetails),
      query,
    })

    if (response) {
      handleSearch(query)
      handleSetPage(1)
    }
  }

  const setSeatData = (data?: CopilotForBusinessPayload) => {
    if (!data) return

    setPayload(data)
  }

  const addSeats = async (users: string[]) => {
    const body = {
      sort: sortDetails,
      type: getFilterParam(filterDetails),
      query: searchQuery,
      page: `${currentPage}`,
      users,
    }

    const response = await callApi<CopilotForBusinessPayload>('add_seats', {method: 'PUT', body})
    setSeatData(response)
  }

  const removeSeat = async (user_id: number) => {
    const params = createURLParams({
      sort: sortDetails,
      type: getFilterParam(filterDetails),
      query: searchQuery,
      page: currentPage,
      user_id,
    })

    const response = await callApi<CopilotForBusinessPayload>(`remove_seat?${params}`, {method: 'DELETE'})
    setSeatData(response)
  }

  const removeInvitation = async (invitation_id: number) => {
    const params = createURLParams({
      sort: sortDetails,
      type: getFilterParam(filterDetails),
      query: searchQuery,
      page: currentPage,
      invitation_id,
    }).toString()
    const response = await callApi<CopilotForBusinessPayload>(`remove_invitation?${params}`, {method: 'DELETE'})

    setSeatData(response)
  }

  const fetchSeats = async (data: Record<string, unknown>) => {
    const response = await callApi<CopilotForBusinessPayload>('seat_management/seats', {method: 'POST', body: data})

    if (response) {
      setSeatData(response)
    }

    return Boolean(response)
  }

  const addTeams = async (teams: string[]) => {
    const body = {
      sort: sortDetails,
      type: getFilterParam(filterDetails),
      query: searchQuery,
      page: currentPage,
      teams,
    }

    const response = await callApi<CopilotForBusinessPayload>('add_teams', {method: 'PUT', body})
    setSeatData(response)
  }

  const removeTeamSeat = async (teamId: number) => {
    const params = createURLParams({
      sort: sortDetails,
      type: getFilterParam(filterDetails),
      query: searchQuery,
      page: currentPage,
      team_id: teamId,
    })
    const response = await callApi<CopilotForBusinessPayload>(`remove_team_seat?${params}`, {method: 'DELETE'})

    setSeatData(response)
  }

  const removeSeats = async () => {
    const body: {
      [k: string]: string | number | number[]
    } = {
      sort: sortDetails,
      type: getFilterParam(filterDetails),
      query: searchQuery,
      page: currentPage,
      teams: checkedIds.team,
      invites: checkedIds.invite,
      users: checkedIds.user,
    }

    const response = await callApi<CopilotForBusinessPayload>('seat_management_bulk_update', {method: 'POST', body})

    setSeatData(response)
  }

  const selectAllCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      setCheckBoxes([])
      return
    }
    setCheckBoxes(
      seatAssignments
        .filter(sa => !sa.pending_cancellation_date)
        .map(({assignable, assignable_type}) => ({
          id: assignable.id,
          type: assignable_type,
        })),
    )
  }

  const checkSeat = ({assignable: {id}, assignable_type: type}: CopilotSeatAssignment) => {
    const seatChecked = checkBoxes.find(seat => seat.id === id && seat.type === type)
    setCheckBoxes(
      seatChecked ? checkBoxes.filter(seat => seat.id !== id || seat.type !== type) : [...checkBoxes, {id, type}],
    )
  }

  useEffect(() => {
    setCheckBoxes([])
  }, [seatAssignments])

  useEffect(() => {
    if (checkBoxes.length === 0) {
      setCheckBoxIndeterminate(false)
      setAllChecked(false)
      setHasRemoveIntent(false)
    } else if (checkBoxes.length === seatAssignments.filter(sa => !sa.pending_cancellation_date).length) {
      setCheckBoxIndeterminate(false)
      setAllChecked(true)
    } else {
      setCheckBoxIndeterminate(true)
    }
  }, [checkBoxes, seatAssignments])

  const enabledForSelectedGroups = policy === CopilotForBusinessSeatPolicy.EnabledForSelected
  const disabledForAllMembers = policy === CopilotForBusinessSeatPolicy.Disabled
  const noMembersHaveAccess = seatAssignments.length === 0 && totalSeatBillingCount === 0
  const hasPendingRequests = pendingRequests && pendingRequests.count > 0
  const pendingRequesters =
    CopilotForBusinessSeatPolicy.EnabledForSelected && preselectRequesters ? pendingRequests?.requesters : undefined

  useEffect(() => {
    if (policyChangeIntent === 'remove') {
      setAllChecked(true)
      setCheckBoxes(seatAssignments.map(sa => ({id: sa.assignable.id, type: sa.assignable_type, checked: true})))
    } else {
      setAllChecked(false)
      setCheckBoxes([])
    }
  }, [policyChangeIntent, seatAssignments])

  const handleExport = async () => {
    makeCSVRequest()
  }

  function formatErrorDisplay() {
    if (error !== 'No seats are available to invite this user') {
      return error
    }

    if (organization.add_seat_link) {
      return (
        <>
          Please purchase additional seats on your paid plan, in order to add this user.{' '}
          <Link inline href={organization.add_seat_link}>
            Add Seats
          </Link>
        </>
      )
    }

    return 'Please contact your enterprise owner to purchase additional seats, in order to add this user.'
  }

  function hasNoSearchResults() {
    return seatAssignments.length === 0 && (filterDetails !== SeatType.All || searchQuery !== '')
  }

  function renderSeatsTable() {
    return (
      <Box as="ul" className="table-list-bordered" data-testid="the-seats" sx={{position: 'relative'}}>
        {seatAssignments.map(sa => (
          <SeatListItem
            seatAssignment={sa}
            organization={organization.name}
            removeInvitation={removeInvitation}
            removeSeat={removeSeat}
            removeTeamSeat={removeTeamSeat}
            checkSeat={checkSeat}
            addSeats={addSeats}
            addTeams={addTeams}
            seatsAssigned={seatBreakdown.seats_assigned}
            totalSeatBillingCount={totalSeatBillingCount}
            key={sa.assignable.id}
            checked={!!checkBoxes.find(({id, type}) => id === sa.assignable.id && type === sa.assignable_type)}
            selectedGroupsChosen={enabledForSelectedGroups}
          />
        ))}
      </Box>
    )
  }

  const confirmationDialogReturnFocusRef = React.useRef(null)

  return (
    <>
      <div data-testid="seats-summary">
        {showFlashMessage && <FlashMessage onClose={() => setShowFlashMessage(false)} />}

        <Box
          sx={{
            marginBottom: 3,
            marginTop: 5,
            display: 'flex',
            alignItems: ['start', 'center'],
            justifyContent: 'space-between',
            flexDirection: ['column', 'row'],
          }}
        >
          {!noMembersHaveAccess && (
            <Heading as="h3" sx={{fontSize: 3, fontWeight: 'normal', pb: [2, 0]}} id="access-header">
              Access management
            </Heading>
          )}
          <div className="d-flex flex-justify-between flex-items-center">
            {csvLoading && <Spinner sx={{marginRight: 2}} size="small" aria-label="Loading a csv usage report" />}
            {!disabledForAllMembers && seatBreakdown.seats_billed > 0 && (
              <Button className="mr-2" leadingVisual={FileIcon} onClick={handleExport} name="get usage report csv">
                Get report
              </Button>
            )}
            {enabledForSelectedGroups && !noMembersHaveAccess && (
              <Button
                variant={hasPendingRequests ? 'default' : 'primary'}
                data-testid="add-seats"
                name="add-seats"
                leadingVisual={PlusIcon}
                onClick={() => {
                  setShowAddMembers(true)
                  setPreselectRequesters(false)
                  sendClickAnalyticsEvent({
                    category: 'copilot_access_management',
                    action: `click_to_open_add_seats_dialog`,
                    label: `ref_cta:add_seats;ref_loc:access_management_button_group`,
                  })
                }}
              >
                Add seats
              </Button>
            )}
          </div>
        </Box>
        {!hasAssignedSeatRecently && enabledForSelectedGroups && !noMembersHaveAccess && (
          <PendingRequestCard
            organization={organization.name}
            pendingRequests={pendingRequests}
            toggleSeatDialog={() => {
              setPreselectRequesters(true)
              setShowAddMembers(true)
            }}
          />
        )}
        {(totalSeatBillingCount > 0 || seatAssignments.length > 0) && (
          <FilterableSearch filter={filter} filterDetails={filterDetails} search={search} />
        )}
        {error && <CopilotFlash variant="danger">{formatErrorDisplay()}</CopilotFlash>}
        {noMembersHaveAccess ? (
          <NoMemberAccessBlankslate
            policy={policy}
            onClick={() => {
              setShowAddMembers(true)
            }}
            organization={organization}
            pendingRequests={pendingRequests}
            setPreselectRequesters={setPreselectRequesters}
            currentPolicy={props.policy}
            setCurrentPolicy={props.setCurrentPolicy}
            selectedPolicy={props.selectedPolicy}
            setSelectedPolicy={props.setSelectedPolicy}
            seatCount={props.seatCount}
            setPayload={props.setPayload}
            seatBreakdown={props.seatBreakdown}
            setPolicyChangeIntent={props.setPolicyChangeIntent}
            policyChangeIntent={props.policyChangeIntent}
            membersCount={props.membersCount}
            businessTrial={props.businessTrial}
            nextBillingDate={props.nextBillingDate}
            planText={props.planText}
          />
        ) : (
          <>
            <div className="mt-3 d-flex flex-items-center px-3 py-1 table-list-header table-list-header-next">
              <div className="select-all-dropdown flex-auto">
                <div className="d-flex flex-items-center">
                  <div className="pr-2">
                    {enabledForSelectedGroups && (
                      <Checkbox
                        onChange={selectAllCheckbox}
                        indeterminate={checkBoxIndeterminate}
                        checked={allChecked}
                        data-testid="selectAll"
                        sx={{height: 13, width: 13}}
                        aria-label={'Select all members'}
                      />
                    )}
                  </div>
                  <div className="text-bold">
                    {uniqueCheckedUserCount > 0 ? (
                      <span data-testid="bulk-selected">
                        {pluralize(uniqueCheckedUserCount, 'member', 's')} selected
                      </span>
                    ) : (
                      <span id="seat-management-breakdown" data-testid="seat-breakdown">
                        {pluralize(totalSeatBillingCount, 'member', 's')} with access to Copilot
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="table-list-header-toggle d-flex py-1">
                {checkBoxes.length > 0 ? (
                  <>
                    {checkedIds.invite.length === checkBoxes.length && (
                      <Button
                        size="small"
                        leadingVisual={MailIcon}
                        sx={{mr: 1}}
                        onClick={() => onResendEmails()}
                        data-testid="resend-invite-button"
                      >
                        Resend invite
                      </Button>
                    )}
                    <Button
                      size="small"
                      leadingVisual={TrashIcon}
                      variant="danger"
                      ref={confirmationDialogReturnFocusRef}
                      onClick={() => setHasRemoveIntent(true)}
                      data-testid="bulk-remove-button"
                    >
                      {pluralize(newSeatCount, 'Cancel seat', 's', false)}
                    </Button>
                  </>
                ) : (
                  <MemberSort sort={sort} sortDetails={sortDetails} cancellation={pendingCancellationExists} />
                )}
              </div>
            </div>
            <div role="region" aria-label="Members with access to Copilot">
              {hasNoSearchResults() ? <NoSearchResultsBlankslate /> : renderSeatsTable()}
            </div>
            {seatCount > PAGE_SIZE && (
              <Pagination
                showPages={seatCount > PAGE_SIZE}
                pageCount={Math.ceil(seatCount / PAGE_SIZE)}
                currentPage={currentPage}
                onPageChange={onPageChange}
                data-testid="pagination"
              />
            )}
          </>
        )}
      </div>
      <ConfirmationPaymentDialog
        onClose={() => setHasRemoveIntent(false)}
        returnFocusRef={confirmationDialogReturnFocusRef}
        isOpen={hasRemoveIntent && uniqueCheckedUserCount > 0}
        title="Confirm seat removal"
        breakdownRows={[
          {label: 'Cost per seat', content: `${formatCurrency(planCost(planText))}`},
          {
            label: 'Total assigned seats',
            content: totalSeatBillingCount,
            testid: 'total-seat-count',
          },
          {label: 'Seats to be removed', content: uniqueCheckedUserCount, testid: 'removed-seat-count'},
        ]}
        cost={formatCurrency(planCost(planText) * Math.max(totalSeatBillingCount - uniqueCheckedUserCount, 0))}
        footerButtons={[
          {buttonType: 'default', content: 'Cancel', onClick: () => setHasRemoveIntent(false)},
          {buttonType: 'danger', content: 'Remove seats', onClick: removeSeats, autoFocus: true},
        ]}
        paymentText="Seats will be removed at the end of the billing period."
      />
      <AddMembersDialog
        totalSeatBillingCount={totalSeatBillingCount}
        licenses={licenses}
        confirmPurchase={data => {
          setShowAddMembers(false)
          setPayload(data)
          setHasAssignedSeatRecently(true)
        }}
        organization={organization.name}
        isOpen={showAddMembers}
        onDismiss={() => setShowAddMembers(false)}
        hasPendingRequests={hasPendingRequests}
        addSeatLink={organization.add_seat_link}
        businessTrial={payload.business_trial}
        pendingRequesters={pendingRequesters}
        planText={planText}
      />
    </>
  )
}
