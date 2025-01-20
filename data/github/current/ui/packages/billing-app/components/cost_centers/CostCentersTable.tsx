import {OrganizationIcon, RepoIcon, PersonIcon} from '@primer/octicons-react'
import {Pagination, Box, Text, Link, Label} from '@primer/react'
import Pluralize from 'pluralize'
import {useContext, useState, useEffect} from 'react'

import {ResourceType} from '../../enums/cost-centers'
import {PageContext, ReloadContext} from '../../App'
import useRoute from '../../hooks/use-route'
import {CostCenterTabs} from '../../routes/CostCentersPage'
import {PEOPLE_BASE_ROUTE} from '../../routes'
import {boxStyle, tableHeaderStyle, tableContainerStyle, tableRowStyle} from '../../utils/style'

import CostCenterActionMenu from './CostCenterActionMenu'

import type {CostCenter} from '../../types/cost-centers'

const tableDataCellStyleName = {
  p: 3,
  display: 'flex',
  flexDirection: 'column',
  width: ['100%', 'auto', 'auto'],
  justifyContent: 'space-between',
}

const tableRowStyleRowtoCol = {
  p: 0,
  flexDirection: ['column', 'row', 'row'],
  flexWrap: ['nowrap', 'wrap', 'wrap'],
  display: 'flex',
  alignItems: [null, 'center', 'center'],
}

type Props = {
  costCenters: CostCenter[]
  selectedTab: CostCenterTabs
  hasUserScopedCostCenters: boolean
}

export default function CostCentersTable({costCenters, selectedTab, hasUserScopedCostCenters}: Props) {
  const pageSize = 10
  const [pageNumber, setPageNumber] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [currData, setCurrData] = useState<CostCenter[]>([])
  const [pagedData, setPagedData] = useState<CostCenter[]>([])
  const isStafftoolsRoute = useContext(PageContext).isStafftoolsRoute
  const {path: enterprisePeopleRoute} = useRoute(PEOPLE_BASE_ROUTE)
  const {reloadKey} = useContext(ReloadContext)
  // cost center querying doesn't work in stafftools
  // the members link should only show up if the business has user scoped cost centers
  const showMembersLink = !isStafftoolsRoute && hasUserScopedCostCenters

  const onPageChange: Parameters<typeof Pagination>['0']['onPageChange'] = (e, page) => {
    e.preventDefault()
    setCurrentPage(page)
  }

  useEffect(() => {
    setCurrentPage(1)
    setCurrData(costCenters.sort((a, b) => a.name.localeCompare(b.name)))
  }, [costCenters])

  useEffect(() => {
    const updatePagedData = async () => {
      setPageNumber(Math.ceil(currData.length / (1.0 * pageSize)) || 1)
      setPagedData(currData.slice((currentPage - 1) * pageSize, currentPage * pageSize))
    }
    updatePagedData()
  }, [currData, currentPage])

  useEffect(() => {
    // reload cost centers page when the reload key changes
    // this is to handle the useFeatureFlag issue where the FF shows as false on the first render
    if (reloadKey !== 0) {
      // eslint-disable-next-line no-self-assign
      window.location.href = window.location.href
    }
  }, [reloadKey])

  const getMembersPageUrl = (costCenter: CostCenter) => {
    // cost center member querying does not work in stafftools
    if (isStafftoolsRoute) {
      return enterprisePeopleRoute
    }

    const costCenterSlug = getSlugFromName(costCenter.name)
    const allOtherCostCenterSlugs = costCenters
      .filter(costCenterData => costCenterData.costCenterKey.uuid !== costCenter.costCenterKey.uuid)
      .map(costCenterData => getSlugFromName(costCenterData.name))

    // use the cost center UUID if there are slug collisions
    if (allOtherCostCenterSlugs.includes(costCenterSlug)) {
      return `${enterprisePeopleRoute}?query=cost_center:${costCenter.costCenterKey.uuid}`
    }

    return `${enterprisePeopleRoute}?query=cost_center:${costCenterSlug}`
  }

  const getSlugFromName = (name: string) => {
    return name.toLowerCase().replace(/\s/g, '-')
  }

  return (
    <>
      <Box sx={{...boxStyle, p: 0}}>
        <Box as="table" sx={{...tableContainerStyle}} data-hpc>
          <Box as="thead" sx={{...tableHeaderStyle, alignItems: 'center', display: 'flex'}}>
            <Box as="tr" sx={{flex: 1}}>
              <Box as="td" sx={{mt: '6px', mb: '6px'}}>
                {costCenters.length} {selectedTab} {Pluralize('cost center', costCenters.length)}
              </Box>
            </Box>
          </Box>
          <tbody>
            {pagedData.map(costCenter => {
              const resourceByOrg = costCenter.resources.filter(resource => resource.type === ResourceType.Org)
              const resourceByRepo = costCenter.resources.filter(resource => resource.type === ResourceType.Repo)
              const resourceByUser = costCenter.resources.filter(resource => resource.type === ResourceType.User)

              return (
                <Box as="tr" key={costCenter.costCenterKey.uuid} sx={{...tableRowStyle, ...tableRowStyleRowtoCol}}>
                  {/* width: '99%' allows the td to fill the remaining space without flexbox */}
                  {/* The first column displays the cost center name */}
                  <Box as="td" sx={{display: 'flex', flex: '3', alignItems: 'center'}}>
                    <Box sx={tableDataCellStyleName}>
                      <div>
                        <Text sx={{mr: 2, fontWeight: 'bold', fontSize: 1, wordBreak: 'break-all'}}>
                          {costCenter.name}
                        </Text>
                        {selectedTab === CostCenterTabs.Deleted && (
                          <Label variant="attention" sx={{mx: 2}}>
                            Deleted
                          </Label>
                        )}
                      </div>
                      {isStafftoolsRoute && (
                        <Text sx={{fontSize: '12px', color: 'fg.muted'}}>{costCenter.costCenterKey.uuid}</Text>
                      )}
                    </Box>

                    <Box sx={{py: 2, px: 3, display: ['block', 'none']}}>
                      <CostCenterActionMenu costCenter={costCenter} />
                    </Box>
                  </Box>
                  {/* The second column displays the number of resources associated with the cost center */}
                  <Box as="td" sx={{minWidth: '138px', flex: 1}}>
                    <Text sx={{ml: [3, 2, 2], whiteSpace: 'nowrap'}}>
                      <OrganizationIcon size={16} /> {Pluralize('Organization', resourceByOrg.length, true)}
                    </Text>
                  </Box>
                  <Box as="td" sx={{minWidth: '128px', flex: 1, pb: showMembersLink ? 0 : [3, 0, 0]}}>
                    <Text sx={{ml: [3, 2, 2], whiteSpace: 'nowrap'}}>
                      <RepoIcon size={16} /> {Pluralize('Repository', resourceByRepo.length, true)}
                    </Text>
                  </Box>
                  {showMembersLink && (
                    <Box as="td" sx={{minWidth: '104px', flex: 1, pb: [3, 0, 0]}}>
                      <Text sx={{ml: [3, 2, 2], whiteSpace: 'nowrap'}}>
                        <PersonIcon size={16} />{' '}
                        <Link
                          data-testid={`cost-center-url-${costCenter.costCenterKey.uuid}`}
                          href={getMembersPageUrl(costCenter)}
                        >
                          {Pluralize('Member', resourceByUser.length, true)}
                        </Link>
                      </Text>
                    </Box>
                  )}
                  <Box as="td" sx={{py: 2, px: 3, display: ['none', 'table-cell']}}>
                    <CostCenterActionMenu costCenter={costCenter} />
                  </Box>
                </Box>
              )
            })}
          </tbody>
        </Box>
      </Box>
      {currData.length > pageSize && (
        <Pagination pageCount={pageNumber} currentPage={currentPage} onPageChange={onPageChange} />
      )}
    </>
  )
}
