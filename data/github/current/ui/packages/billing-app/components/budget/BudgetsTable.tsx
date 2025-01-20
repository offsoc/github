import {useState, useEffect} from 'react'
import {Box, Text, Pagination, ActionMenu, ActionList} from '@primer/react'

import {
  BILLING_MANAGER,
  ENTERPRISE_OWNER,
  ENTERPRISE_ORG_OWNER,
  BUDGET_SCOPE_ORGANIZATION,
  BUDGET_SCOPE_REPOSITORY,
} from '../../constants'

import {boxStyle, tableContainerStyle, tableHeaderStyle} from '../../utils/style'

import type {Budget} from '../../types/budgets'
import type {AdminRole} from '../../types/common'
import BudgetData from './BudgetData'
import type {Product} from '../../types/products'

type Props = {
  budgets: Budget[]
  adminRoles: AdminRole[]
  deleteBudget: (budgetUuid: string) => void
  isEnterpriseTable?: boolean
  enabledProducts?: Product[]
}

export default function BudgetsTable({
  budgets,
  adminRoles,
  deleteBudget,
  isEnterpriseTable = false,
  enabledProducts,
}: Props) {
  const pageSize = 10
  const [pageNumber, setPageNumber] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [currData, setCurrData] = useState<Budget[]>([])
  const [pagedData, setPagedData] = useState<Budget[]>([])
  const scopeTypes = ['All', 'Organizations', 'Repositories']

  const hasBudgetWritePermissions =
    adminRoles.includes(BILLING_MANAGER) ||
    adminRoles.includes(ENTERPRISE_OWNER) ||
    adminRoles.includes(ENTERPRISE_ORG_OWNER)

  const onPageChange: Parameters<typeof Pagination>['0']['onPageChange'] = (e, page) => {
    e.preventDefault()
    setCurrentPage(page)
  }

  useEffect(() => {
    const updatePagedData = async () => {
      setPageNumber(Math.ceil(currData.length / (1.0 * pageSize)) || 1)
      setPagedData(currData.slice((currentPage - 1) * pageSize, currentPage * pageSize))
    }
    updatePagedData()
  }, [currData, currentPage])

  useEffect(() => {
    let resourceType = 'All'
    let currBudgets: Budget[]
    switch (selectedIndex) {
      case 1: {
        resourceType = BUDGET_SCOPE_ORGANIZATION
        break
      }
      case 2: {
        resourceType = BUDGET_SCOPE_REPOSITORY
        break
      }
    }
    if (resourceType !== 'All') {
      currBudgets = budgets.filter(budget => budget.targetType === resourceType)
    } else {
      currBudgets = budgets
    }
    setCurrentPage(1)
    setCurrData(currBudgets)
  }, [selectedIndex, budgets])

  return (
    <>
      <Box sx={{...boxStyle, p: 0}}>
        <Box as="table" sx={tableContainerStyle} data-hpc>
          <Box
            as="thead"
            sx={{
              ...tableHeaderStyle,
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <Box as="tr" sx={{flex: 1}}>
              <Box as="td" sx={{float: 'left', mt: '6px', mb: '6px'}}>
                <Text sx={{fontWeight: 'bold'}}>
                  {isEnterpriseTable ? 'Enterprise budgets' : `${currData.length} budgets`}
                </Text>
              </Box>
              <Box as="td" sx={{float: 'right'}}>
                {!isEnterpriseTable && (
                  <ActionMenu>
                    <ActionMenu.Button variant="invisible" sx={{color: 'btn.text'}}>
                      <Text sx={{fontWeight: 'normal'}}>Scope: {scopeTypes[selectedIndex] ?? 'All'}</Text>
                    </ActionMenu.Button>
                    <ActionMenu.Overlay>
                      <ActionList>
                        <ActionList.Group selectionVariant="single">
                          <ActionList.GroupHeading>Filter scope</ActionList.GroupHeading>
                          {scopeTypes.map((scopeType, index) => (
                            <ActionList.Item
                              key={index}
                              selected={index === selectedIndex}
                              onSelect={() => setSelectedIndex(index)}
                            >
                              {scopeType}
                            </ActionList.Item>
                          ))}
                        </ActionList.Group>
                      </ActionList>
                    </ActionMenu.Overlay>
                  </ActionMenu>
                )}
              </Box>
            </Box>
          </Box>
          <tbody>
            {pagedData.map(budgetData => {
              return (
                <BudgetData
                  key={budgetData.uuid}
                  budgetData={budgetData}
                  hasBudgetWritePermissions={hasBudgetWritePermissions}
                  deleteBudget={deleteBudget}
                  enabledProducts={enabledProducts}
                />
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
