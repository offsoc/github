import type {LicenseHolder} from './types'
import {CustomerIdProvider} from './CustomerIdContext'
import {Link, Pagination, TextInput} from '@primer/react'
import {Blankslate} from '@primer/react/experimental'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {ListView} from '@github-ui/list-view'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItem} from '@github-ui/list-view/ListItem'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {AlertIcon, ProjectRoadmapIcon, SearchIcon, XCircleFillIcon} from '@primer/octicons-react'
import {LicenseDetails} from './LicenseDetails'
import {getSignificanceBasedPrecision, human} from '@github-ui/formatters'

export interface LicensifyLicensesProps {
  customerId: string
}

enum LoadingState {
  Loading,
  Done,
  Error,
}

const PAGE_SIZE = 25

export function LicensifyLicenses({customerId}: LicensifyLicensesProps) {
  const [state, setState] = useState<LoadingState>(LoadingState.Loading)
  const [licenseHolders, setLicenseHolders] = useState<LicenseHolder[]>([])

  const fetchLicenses = useCallback(async () => {
    setState(LoadingState.Loading)
    const response = await verifiedFetchJSON(`/stafftools/customers/${customerId}/licensify_licenses`)

    if (response.ok) {
      const data = await response.json()
      setState(LoadingState.Done)
      data.sort((a: LicenseHolder, b: LicenseHolder) => a.display_name.localeCompare(b.display_name))
      setLicenseHolders(data || [])
    } else {
      setState(LoadingState.Error)
    }
  }, [customerId])

  useEffect(() => {
    fetchLicenses()
  }, [fetchLicenses])

  return (
    <div className="my-3">
      <div className="d-flex flex-justify-between mb-2">
        <h3>SDLC Licenses</h3>
      </div>
      <CustomerIdProvider customerId={customerId}>
        <LicensesContent state={state} licenseHolders={licenseHolders} reloadLicenses={fetchLicenses} />
      </CustomerIdProvider>
    </div>
  )
}

interface LicensesContentProps {
  state: LoadingState
  licenseHolders: LicenseHolder[]
  reloadLicenses: () => void
}

function LicensesContent({state, licenseHolders, reloadLicenses}: LicensesContentProps) {
  if (state === LoadingState.Loading) {
    return (
      <div className="border rounded-2">
        <div className="d-flex p-3 border-bottom">
          <LoadingSkeleton className="mr-2" variant="pill" height="sm" width="sm" />
          <LoadingSkeleton variant="text" height="sm" width="100%" />
        </div>
        <div className="d-flex p-3 border-bottom">
          <LoadingSkeleton className="mr-2" variant="pill" height="sm" width="sm" />
          <LoadingSkeleton variant="text" height="sm" width="100%" />
        </div>
      </div>
    )
  }
  if (state === LoadingState.Error) {
    return (
      <Blankslate border>
        <Blankslate.Visual>
          <AlertIcon size="medium" />
        </Blankslate.Visual>
        <Blankslate.Heading>There was an error loading licenses</Blankslate.Heading>
        <Link onClick={reloadLicenses}>Try again</Link>
      </Blankslate>
    )
  }
  return <LicenseHolderList licenseHolders={licenseHolders} />
}

interface LicenseHolderListProps {
  licenseHolders: LicenseHolder[]
}

function getDisplayLicensesCount(count: number): string {
  const displayCount = human(count, {
    precision: getSignificanceBasedPrecision(count),
    suffix: false,
  })

  return `${displayCount} ${count === 1 ? 'license' : 'licenses'}`
}

function NoLicenses() {
  return (
    <Blankslate>
      <Blankslate.Visual>
        <ProjectRoadmapIcon size="medium" />
      </Blankslate.Visual>
      <Blankslate.Heading>No licenses found</Blankslate.Heading>
      <Blankslate.Description>Try adjusting your filter criteria</Blankslate.Description>
    </Blankslate>
  )
}

function LicenseHolderList({licenseHolders}: LicenseHolderListProps) {
  const [filterValue, setFilterValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredLicenseHolders = useMemo(() => {
    setCurrentPage(1)
    if (!filterValue) {
      return licenseHolders
    }

    return licenseHolders.filter(
      licenseHolder =>
        licenseHolder.display_name.toLowerCase().includes(filterValue.toLowerCase()) ||
        licenseHolder.id.toString() === filterValue,
    )
  }, [licenseHolders, filterValue])

  const licenseCount = filteredLicenseHolders.length
  const pageCount = Math.ceil(licenseCount / PAGE_SIZE)
  const onPageChange = useCallback((e: React.MouseEvent, page: number) => {
    setCurrentPage(page)
    e.preventDefault()
  }, [])

  const licensesOnPage = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    const end = Math.min(currentPage * PAGE_SIZE, licenseCount)
    return filteredLicenseHolders.slice(start, end)
  }, [currentPage, filteredLicenseHolders, licenseCount])

  return (
    <>
      <TextInput
        aria-label="Filtered search"
        leadingVisual={SearchIcon}
        block
        placeholder="Filter licenses"
        className="mb-3"
        value={filterValue}
        onChange={e => setFilterValue(e.target.value)}
        trailingAction={
          <TextInput.Action
            onClick={() => {
              setFilterValue('')
            }}
            icon={XCircleFillIcon}
            aria-label="Clear input"
            className="fgColor-muted"
          />
        }
      />
      <div className="border rounded-2">
        {licenseCount === 0 ? (
          <NoLicenses />
        ) : (
          <ListView
            title="List of license holders"
            totalCount={licenseCount}
            metadata={<ListViewMetadata title={getDisplayLicensesCount(licenseCount)} />}
            singularUnits="license"
            pluralUnits="licenses"
          >
            {licensesOnPage.map(licenseHolder => (
              <LicenseHolderItem key={licenseHolder.global_id} licenseHolder={licenseHolder} />
            ))}
          </ListView>
        )}
      </div>
      {pageCount > 1 && <Pagination pageCount={pageCount} currentPage={currentPage} onPageChange={onPageChange} />}
    </>
  )
}

interface LicenseHolderItemProps {
  licenseHolder: LicenseHolder
}

function LicenseHolderItem({licenseHolder}: LicenseHolderItemProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <ListItem title={<ListItemTitle value={licenseHolder.display_name} onClick={() => setShowDetails(true)} />}>
      <ListItemLeadingContent>
        <GitHubAvatar className="mr-2 flex-self-center" src={licenseHolder.avatar_url} />
      </ListItemLeadingContent>
      {showDetails && <LicenseDetails licenseHolder={licenseHolder} onClose={() => setShowDetails(false)} />}
    </ListItem>
  )
}
