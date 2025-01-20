import {useCallback, useMemo, useState} from 'react'
import {testIdProps} from '@github-ui/test-id-props'
import {Flash, Pagehead, Text, TextInput, UnderlineNav} from '@primer/react'
import {Blankslate, Table} from '@primer/react/drafts'
import {DataTable} from '@primer/react/experimental'
import {HeartIcon, SearchIcon} from '@primer/octicons-react'
import {
  AmountColumn,
  ManageButtonColumn,
  SponsorableColumn,
  SponsorButtonColumn,
  StartDateColumn,
  VisibilityColumn,
} from './Columns'
import {ExportSponsorships} from './ExportSponsorships'
import {TabStates, type SponsorshipData} from './your-sponsorships-types'
import {updateSponsorship, type SponsorshipUpdate} from './update-sponsorship'

export interface YourSponsorshipsProps {
  sponsorLogin: string
  viewerPrimaryEmail?: string
  viewerIsOrgMember: boolean
  viewerCanManageSponsorships: boolean
  sponsorships: SponsorshipData[]
  pageSize?: number
}

export interface FilterableSponsorshipData extends SponsorshipData {
  normalizedSponsorableLogin: string
}

const PAGE_SIZE = 10

const pluralizedSponsorship = (count: number) => (count === 1 ? 'sponsorship' : 'sponsorships')

export function YourSponsorships({
  sponsorLogin,
  viewerPrimaryEmail,
  sponsorships: initialSponsorships,
  viewerIsOrgMember,
  viewerCanManageSponsorships,
  pageSize = PAGE_SIZE,
}: YourSponsorshipsProps) {
  const [currentPaginatedPage, setCurrentPaginatedPage] = useState(0)
  const [sponsorships, setSponsorships] = useState(initialSponsorships)
  const [currentTab, setCurrentTab] = useState<TabStates>(TabStates.ACTIVE_SPONSORSHIPS)
  const [sponsorFilter, setSponsorFilter] = useState<string>('')
  const [flash, setFlash] = useState<{variant: 'success' | 'danger'; message: string}>()

  const sponsorshipCounts = useMemo(() => {
    return sponsorships.reduce(
      (counts, sponsorship) => {
        sponsorship.active ? counts.current++ : counts.past++
        return counts
      },
      {current: 0, past: 0},
    )
  }, [sponsorships])

  const filterableSponsorships = useMemo(() => {
    return sponsorships.map(sponsorship => {
      return {...sponsorship, normalizedSponsorableLogin: sponsorship.sponsorableLogin.toLowerCase()}
    })
  }, [sponsorships])

  const currentTabSponsorships = useMemo(() => {
    // support exhaustiveness checking for tab states
    const ensureUnreachable = (state: never) => {
      throw new Error(`Unhandled state: ${state}`)
    }
    return filterableSponsorships.filter(sponsorship => {
      switch (currentTab) {
        case TabStates.ACTIVE_SPONSORSHIPS:
          return sponsorship.active
        case TabStates.PAST_SPONSORSHIPS:
          return !sponsorship.active
        default:
          ensureUnreachable(currentTab)
      }
    })
  }, [filterableSponsorships, currentTab])

  const filteredSponsorships = useMemo(() => {
    if (!sponsorFilter) return currentTabSponsorships
    const searchFilter = (sponsorship: FilterableSponsorshipData) => {
      return sponsorship.normalizedSponsorableLogin.includes(sponsorFilter)
    }
    return currentTabSponsorships.filter(searchFilter)
  }, [currentTabSponsorships, sponsorFilter])

  const paginationStart = currentPaginatedPage * pageSize
  const paginationEnd = paginationStart + pageSize

  const paginatedSponsorships = useMemo(() => {
    return filteredSponsorships.slice(paginationStart, paginationEnd)
  }, [filteredSponsorships, paginationStart, paginationEnd])

  const sponsorshipUpdater = useCallback(
    async (sponsorshipUpdate: SponsorshipUpdate) => {
      await updateSponsorship({sponsorLogin, sponsorshipUpdate, sponsorships, setSponsorships, setFlash})
    },
    [sponsorLogin, sponsorships],
  )

  const columns = useMemo(() => {
    if (viewerCanManageSponsorships) {
      return [
        SponsorableColumn,
        VisibilityColumn,
        StartDateColumn,
        AmountColumn,
        ManageButtonColumn(sponsorLogin, sponsorshipUpdater),
      ]
    }
    if (viewerIsOrgMember) {
      return [SponsorableColumn, VisibilityColumn, StartDateColumn, SponsorButtonColumn]
    }
    return [SponsorableColumn, StartDateColumn, SponsorButtonColumn]
  }, [viewerCanManageSponsorships, viewerIsOrgMember, sponsorLogin, sponsorshipUpdater])

  return (
    <>
      {flash && (
        <Flash variant={flash.variant} {...testIdProps('your-sponsorships-flash')}>
          {flash.message}
        </Flash>
      )}
      <Pagehead
        as="h2"
        id="your-sponsorships-heading"
        sx={{mt: 0, mb: 2, py: 2}}
        {...testIdProps('your-sponsorships-header')}
      >
        {sponsorLogin}&apos;s sponsorships
      </Pagehead>
      <div className="mb-2">
        <span id="your-sponsorships-description" {...testIdProps('your-sponsorships-description')}>
          <Text sx={{fontWeight: 'bold'}}>{sponsorLogin}</Text> has{' '}
          <Text sx={{fontWeight: 'bold'}}>{sponsorshipCounts.current}</Text> current{' '}
          {pluralizedSponsorship(sponsorshipCounts.current)} and{' '}
          <Text sx={{fontWeight: 'bold'}}>{sponsorshipCounts.past}</Text> past{' '}
          {pluralizedSponsorship(sponsorshipCounts.past)}
        </span>
      </div>

      <UnderlineNav aria-label="Current or past sponsorships navigation" sx={{marginBottom: 4, paddingLeft: 0}}>
        <UnderlineNav.Item
          key={TabStates.ACTIVE_SPONSORSHIPS}
          aria-current={currentTab === TabStates.ACTIVE_SPONSORSHIPS ? 'page' : undefined}
          onSelect={() => setCurrentTab(TabStates.ACTIVE_SPONSORSHIPS)}
        >
          Current Sponsorships
        </UnderlineNav.Item>
        <UnderlineNav.Item
          key={TabStates.PAST_SPONSORSHIPS}
          aria-current={currentTab === TabStates.PAST_SPONSORSHIPS ? 'page' : undefined}
          onSelect={() => setCurrentTab(TabStates.PAST_SPONSORSHIPS)}
        >
          Past Sponsorships
        </UnderlineNav.Item>
      </UnderlineNav>

      {currentTabSponsorships.length === 0 ? (
        <div {...testIdProps('your-sponsorships-empty-state')}>
          <Blankslate>
            <Blankslate.Heading>No sponsorships</Blankslate.Heading>
            <Blankslate.Description>No sponsorships to display.</Blankslate.Description>
            <Blankslate.PrimaryAction href="/sponsors/explore">Explore your dependencies</Blankslate.PrimaryAction>
          </Blankslate>
        </div>
      ) : (
        <>
          <div className="d-flex flex-nowrap mb-4">
            <TextInput
              className="flex-1"
              leadingVisual={SearchIcon}
              placeholder="Search users"
              onChange={e => setSponsorFilter(e.target.value.toLowerCase())}
            />
            {viewerCanManageSponsorships && (
              <div className="ml-2">
                <ExportSponsorships
                  sponsorLogin={sponsorLogin}
                  viewerPrimaryEmail={viewerPrimaryEmail}
                  currentTab={currentTab}
                  setFlash={setFlash}
                />
              </div>
            )}
          </div>

          {filteredSponsorships.length === 0 ? (
            <div {...testIdProps('your-sponsorships-filter-empty-state')}>
              <Blankslate>
                <Blankslate.Visual>
                  <HeartIcon size="medium" />
                </Blankslate.Visual>
                <Blankslate.Heading>No sponsorships</Blankslate.Heading>
                <Blankslate.Description>No sponsorships match the search.</Blankslate.Description>
              </Blankslate>
            </div>
          ) : (
            <div {...testIdProps('your-sponsorships-table')}>
              <Table.Container>
                <DataTable
                  aria-labelledby="your-sponsorships-heading"
                  aria-describedby="your-sponsorships-description"
                  cellPadding="spacious"
                  data={paginatedSponsorships}
                  columns={columns}
                />
                {filteredSponsorships.length > pageSize && (
                  <Table.Pagination
                    pageSize={pageSize}
                    aria-label="Table pagination"
                    totalCount={filteredSponsorships.length}
                    onChange={pageInfo => {
                      setCurrentPaginatedPage(pageInfo.pageIndex)
                    }}
                  />
                )}
              </Table.Container>
            </div>
          )}
        </>
      )}
    </>
  )
}
