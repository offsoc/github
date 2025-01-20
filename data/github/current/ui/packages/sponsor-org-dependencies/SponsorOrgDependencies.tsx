import {useCallback, useEffect, useMemo, useState} from 'react'
import {testIdProps} from '@github-ui/test-id-props'
import {Text, TextInput} from '@primer/react'
import {HeartIcon, SearchIcon, XCircleFillIcon} from '@primer/octicons-react'
import {Blankslate, Table} from '@primer/react/drafts'
import {Banner, DataTable} from '@primer/react/experimental'
import {BannerVariants, ExportDependencies} from './ExportDependencies'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {dependenciesColumn, maintainerColumn, recentActivityColumn, sponsorColumn} from './Columns'
import type {SponsorableData} from './types'

export interface SponsorOrgDependenciesProps {
  sponsorableDependencies: SponsorableData[]
  pageSize?: number
  orgName: string
  viewerPrimaryEmail: string
}

const PAGE_SIZE = 10

export function SponsorOrgDependencies({
  sponsorableDependencies,
  pageSize = PAGE_SIZE,
  orgName,
  viewerPrimaryEmail,
}: SponsorOrgDependenciesProps) {
  const [currentPaginatedPage, setCurrentPaginatedPage] = useState(0)
  const [searchInputValue, setSearchInputValue] = useState<string>('')
  const [selectedSponsorable, setSelectedSponsorable] = useState<string>('')
  const [openPopups, setOpenPopups] = useState<{[key: string]: boolean}>({})
  const [totalPaginatedCount, setTotalPaginatedCount] = useState(sponsorableDependencies.length)
  const [paginatedSponsorables, setPaginatedSponsorables] = useState<SponsorableData[]>(
    sponsorableDependencies.slice(0, pageSize),
  )
  const [searchResults, setSearchResults] = useState<SponsorableData[]>([])
  const [banner, setBanner] = useState<{
    variant?: BannerVariants.SUCCESS | BannerVariants.ERROR
    message: string
    isVisible: boolean
  }>({variant: undefined, message: '', isVisible: false})
  const [searchSubmitted, setSearchSubmitted] = useState<boolean>(false)
  const [searchLoading, setSearchLoading] = useState<boolean>(false)

  const handleLinkClick = (sponsorableName: string) => {
    setSelectedSponsorable(sponsorableName)
    // Open just the modal for the selected sponsorable
    setOpenPopups(prevState => ({
      ...prevState,
      [sponsorableName]: true,
    }))
  }
  const handleClose = (sponsorableName: string) => {
    // Close just the modal for the selected sponsorable
    setOpenPopups(prevState => ({
      ...prevState,
      [sponsorableName]: false,
    }))
  }

  const handleSearchReset = () => {
    setSearchLoading(true)
    setSearchSubmitted(false)
    setSearchInputValue('')
    setTotalPaginatedCount(sponsorableDependencies.length)
    setCurrentPaginatedPage(0)
    setSearchLoading(false)
  }

  const handleSearch = async (searchTerm?: string) => {
    setSearchLoading(true)
    setSearchSubmitted(true)
    setCurrentPaginatedPage(0)
    if (!searchTerm) {
      setTotalPaginatedCount(sponsorableDependencies.length)
      setSearchResults([])
      setSearchSubmitted(false)
      setSearchLoading(false)
      return
    }
    const url = `/orgs/${orgName}/dependencies/search?search_term=${searchTerm}`
    const response = await verifiedFetchJSON(url, {
      method: 'GET',
    })
    if (!response.ok) {
      setBanner({
        variant: BannerVariants.ERROR,
        message: 'An error occurred while searching for your dependencies.',
        isVisible: true,
      })
      setTotalPaginatedCount(sponsorableDependencies.length)
      return setSearchLoading(false)
    } else {
      const jsonResp = await response.json()
      setTotalPaginatedCount(jsonResp.length)
      setSearchResults(jsonResp)
      setSearchLoading(false)
      return
    }
  }

  const getCurrentPageData = useCallback(async () => {
    const paginationStart = currentPaginatedPage * pageSize
    const paginationEnd = paginationStart + pageSize
    let paginated: SponsorableData[] = sponsorableDependencies.slice(paginationStart, paginationEnd)
    if (searchSubmitted) {
      if (!searchLoading) {
        if (searchResults.length === 0) {
          paginated = []
        }
        if (searchResults.length) {
          paginated = searchResults.slice(paginationStart, paginationEnd)
        }
      }
    }
    return setPaginatedSponsorables(paginated)
  }, [currentPaginatedPage, pageSize, searchLoading, searchResults, searchSubmitted, sponsorableDependencies])

  useEffect(() => {
    getCurrentPageData()
  }, [getCurrentPageData, currentPaginatedPage])

  const columns = useMemo(() => {
    return [
      maintainerColumn,
      dependenciesColumn(orgName, handleLinkClick, handleClose, openPopups, selectedSponsorable),
      recentActivityColumn,
      sponsorColumn(orgName),
    ]
  }, [openPopups, orgName, selectedSponsorable])

  return (
    <div>
      {banner?.isVisible && (
        <Banner
          variant={banner.variant}
          title={banner.variant === BannerVariants.SUCCESS ? 'Success' : 'Error'}
          description={banner.message}
          onDismiss={() => setBanner(prevState => ({...prevState, isVisible: false}))}
          {...testIdProps('dependencies-flash-banner')}
        />
      )}
      <div className="border-bottom color-border-muted mb-3">
        <Text as="h2" id="dependencies-heading" sx={{mt: 0, mb: 2, py: 2}}>
          Dependencies
        </Text>
        <p className="f5 color-fg-muted mb-4">
          We only show dependencies that have an active sponsors profile. We use files in your repositories like
          package-lock.json and requirements.txt to find your dependencies. We check their maintainer status by seeing
          if they’re listed in a repository’s funding file.
        </p>
      </div>
      {sponsorableDependencies.length === 0 ? (
        <div {...testIdProps('your-sponsorships-empty-state')}>
          <Blankslate>
            <Blankslate.Visual>
              <HeartIcon size="medium" />
            </Blankslate.Visual>
            <Blankslate.Heading>Your dependencies will appear here</Blankslate.Heading>
            <Blankslate.Description>
              {`Looks like you don't have any dependencies that can be sponsored right now. You can find open source
              maintainers to sponsor on our explore page.`}
            </Blankslate.Description>
            <Blankslate.PrimaryAction href="/search?q=is%3Asponsorable&type=Users">
              Explore maintainers
            </Blankslate.PrimaryAction>
          </Blankslate>
        </div>
      ) : (
        <>
          <div className="d-flex flex-nowrap mb-3">
            <TextInput
              className="flex-1 mr-2"
              placeholder="Search maintainers, dependencies"
              value={searchInputValue}
              onChange={e => {
                setSearchInputValue(e.target.value)
              }}
              onKeyDown={e => {
                // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic -- manual shortcut logic is idiomatic in React
                if (e.key === 'Enter') {
                  handleSearch(searchInputValue)
                }
              }}
              trailingAction={
                <>
                  {searchInputValue && searchSubmitted ? (
                    <TextInput.Action
                      onClick={() => {
                        handleSearchReset()
                      }}
                      icon={XCircleFillIcon}
                      aria-label="Clear search"
                      sx={{
                        mr: 0,
                        color: 'fg.subtle',
                      }}
                      {...testIdProps('clear-search-button')}
                    />
                  ) : null}
                  <TextInput.Action
                    onClick={() => {
                      handleSearch(searchInputValue)
                    }}
                    icon={SearchIcon}
                    aria-label="Search"
                    sx={{
                      color: 'fg.subtle',
                    }}
                    {...testIdProps('search-button')}
                  />
                </>
              }
            />
            <ExportDependencies orgName={orgName} viewerPrimaryEmail={viewerPrimaryEmail} setBanner={setBanner} />
          </div>
          {searchSubmitted && paginatedSponsorables.length === 0 ? (
            <Blankslate>
              <Blankslate.Heading>No results</Blankslate.Heading>
              <Blankslate.Description>Try searching for something else</Blankslate.Description>
            </Blankslate>
          ) : (
            <Table.Container>
              {searchLoading ? (
                <Table.Skeleton
                  aria-labelledby="Loading dependencies table"
                  columns={columns}
                  rows={pageSize}
                  {...testIdProps('table-loading')}
                />
              ) : (
                <DataTable data={paginatedSponsorables} columns={columns} />
              )}
              {sponsorableDependencies.length > pageSize && (
                <Table.Pagination
                  key={currentPaginatedPage + Math.random()} // not rendering correctly unless we use key to force total update
                  defaultPageIndex={currentPaginatedPage}
                  pageSize={pageSize}
                  aria-label="Table pagination"
                  totalCount={totalPaginatedCount}
                  onChange={pageInfo => {
                    setCurrentPaginatedPage(pageInfo.pageIndex)
                  }}
                />
              )}
            </Table.Container>
          )}
        </>
      )}
    </div>
  )
}
