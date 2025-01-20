import {useMemo, useState, useCallback, useEffect, useRef} from 'react'
import {Pagination} from '@primer/react'
import type {FilterQuery} from '@github-ui/filter'
import {settingsOrgSecurityProductsRepositories} from '@github-ui/paths'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import RepositoryTable from './RepositoryTable'
import SearchFilter from './SearchFilter'
import FailureBanner from './FailureBanner'
import type {
  ChangesInProgress,
  FailureCounts,
  OrganizationSecurityConfiguration,
  Repository,
} from '../security-products-enablement-types'
import {SelectedRepositoryContext} from '../contexts/SelectedRepositoryContext'
import {useAppContext} from '../contexts/AppContext'
import {useRepositoryContext} from '../contexts/RepositoryContext'
import LicenseSection from './LicenseSection'

interface RepositorySectionProps {
  setChangesInProgress: React.Dispatch<React.SetStateAction<ChangesInProgress>>
  repositories?: Repository[]
  githubRecommendedConfiguration?: OrganizationSecurityConfiguration
  customSecurityConfigurations: OrganizationSecurityConfiguration[]
  failureCounts: FailureCounts
  hideFailureCounts: boolean
  setHideFailureCounts: (arg0: boolean) => void
}

const RepositorySection: React.FC<RepositorySectionProps> = ({
  setChangesInProgress,
  githubRecommendedConfiguration,
  customSecurityConfigurations,
  failureCounts,
  hideFailureCounts,
  setHideFailureCounts,
}) => {
  const {customPropertySuggestions, capabilities, organization, pageCount: initialPageCount} = useAppContext()
  const {setRepositories, totalRepositoryCount: initialTotalRepositoryCount} = useRepositoryContext()
  const tableRef = useRef<HTMLTableElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [queryParams, setQueryParams] = useState<URLSearchParams>(new URLSearchParams())
  const [filterQuery, setFilterQuery] = useState<string>('')
  const [isQueryLoading, setIsQueryLoading] = useState<boolean>(false)
  const [selectedReposCount, setSelectedReposCount] = useState<number>(0)
  const [selectedReposMap, setSelectedRepos] = useState<Record<number, Repository>>({})
  const [pageCount, setPageCount] = useState(initialPageCount)
  const [totalRepositoryCount, setTotalRepositoryCount] = useState(initialTotalRepositoryCount)

  const selectedRepositoryContextValue = useMemo(
    () => ({selectedReposMap, setSelectedRepos, selectedReposCount, setSelectedReposCount}),
    [selectedReposCount, selectedReposMap],
  )

  useEffect(() => {
    setTotalRepositoryCount(initialTotalRepositoryCount)
  }, [initialTotalRepositoryCount])

  const [searchResultsLimitExceeded, setSearchResultsLimitExceeded] = useState<boolean>(false)
  const failureCountsPresent = Object.keys(failureCounts).length > 0
  const [showFailureBanner, setShowFailureBanner] = useState(
    capabilities.previewNext && failureCountsPresent && !hideFailureCounts,
  )

  useEffect(() => {
    const countsPresent = Object.keys(failureCounts).length > 0
    setShowFailureBanner(capabilities.previewNext && countsPresent && !hideFailureCounts)
  }, [failureCounts, capabilities.previewNext, hideFailureCounts])

  const submitSearchQuery = async (request: FilterQuery) => {
    setFilterQuery(request.raw)
    setIsQueryLoading(true)
    setQueryParams(new URLSearchParams({q: request.raw}))
  }

  useEffect(() => {
    const url = `${settingsOrgSecurityProductsRepositories({org: organization})}?${queryParams}`
    const fetchData = async () => {
      const result = await verifiedFetchJSON(url, {method: 'GET'})

      if (result.ok) {
        const resultJson = await result.json()
        setRepositories(resultJson.repositories)
        setSelectedRepos({})
        setSelectedReposCount(0)
        setSearchResultsLimitExceeded(resultJson.searchResultsLimitExceeded)
        setTotalRepositoryCount(resultJson.totalRepositoryCount)
        setPageCount(resultJson.pageCount)
        setCurrentPage(1)
      }

      setIsQueryLoading(false)
    }

    fetchData()
  }, [queryParams, organization, setTotalRepositoryCount, setPageCount, setRepositories])

  const paginateRepositories = useCallback(
    async (page: number) => {
      const queryParamsString = queryParams.toString()
      const urlParams = `${queryParamsString ? `?${queryParamsString}&` : '?'}page=${page}`
      const url = settingsOrgSecurityProductsRepositories({org: organization}) + urlParams
      const result = await verifiedFetchJSON(url, {method: 'GET'})

      if (result.ok) {
        const resultJson = await result.json()
        setRepositories(resultJson.repositories)
        setSelectedRepos({})
        setSelectedReposCount(0)
        setSearchResultsLimitExceeded(resultJson.searchResultsLimitExceeded)
      }
    },
    [organization, queryParams, setRepositories],
  )

  const handlePageChange = useCallback(
    (e: React.MouseEvent, newPage: number) => {
      e.preventDefault()

      if (currentPage !== newPage) {
        setCurrentPage(newPage)
        paginateRepositories(newPage)
      }
      tableRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'})
    },
    [currentPage, paginateRepositories],
  )

  return (
    <>
      <div className="f3-light mt-4 mb-1" ref={tableRef}>
        Apply configurations
      </div>
      {capabilities.ghasPurchased && (
        <LicenseSection
          selectedReposMap={selectedReposMap}
          selectedReposCount={selectedReposCount}
          totalRepositoryCount={totalRepositoryCount}
          filterQuery={filterQuery}
        />
      )}
      {showFailureBanner && (
        <FailureBanner closeFn={setHideFailureCounts} failureCounts={failureCounts} searchFn={submitSearchQuery} />
      )}
      <SearchFilter
        customConfigurationNames={customSecurityConfigurations.map(config => config.name)}
        onSubmit={submitSearchQuery}
        definitions={customPropertySuggestions}
        initialFilter={filterQuery}
        githubRecommendedConfiguration={githubRecommendedConfiguration}
      />
      <SelectedRepositoryContext.Provider value={selectedRepositoryContextValue}>
        <RepositoryTable
          setChangesInProgress={setChangesInProgress}
          githubRecommendedConfiguration={githubRecommendedConfiguration}
          customSecurityConfigurations={customSecurityConfigurations}
          filterQuery={filterQuery}
          searchResultsLimitExceeded={searchResultsLimitExceeded}
          pageCount={pageCount}
          totalRepositoryCount={totalRepositoryCount}
          isQueryLoading={isQueryLoading}
        />
      </SelectedRepositoryContext.Provider>
      {pageCount > 1 && (
        <Pagination
          data-testid="pagination"
          pageCount={pageCount}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          marginPageCount={2}
          surroundingPageCount={2}
        />
      )}
    </>
  )
}

export default RepositorySection
