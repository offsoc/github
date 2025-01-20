import {useContext} from 'react'
import {Box, Link, Text} from '@primer/react'
import {OrganizationIcon, RepoIcon, GlobeIcon, CreditCardIcon} from '@primer/octicons-react'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {BudgetLabel, BudgetProgressBar, BudgetWarningIcon, BudgetActionMenu} from '.'
import {ResourceType} from '../../enums/cost-centers'
import {formatMoneyDisplay} from '../../utils/money'
import {tableRowStyle} from '../../utils/style'
import {tableDataCellStyle, tableRowStyleRowtoCol} from './style'
import type {Budget} from '../../types/budgets'
import {
  BUDGET_SCOPE_ORGANIZATION,
  BUDGET_SCOPE_ENTERPRISE,
  BUDGET_SCOPE_CUSTOMER,
  BUDGET_SCOPE_REPOSITORY,
} from '../../constants'
import useRoute from '../../hooks/use-route'
import {EDIT_BUDGET_ROUTE, EDIT_COST_CENTER_ROUTE, UPSERT_BUDGET_ROUTE} from '../../routes'
import {doRequest, HTTPMethod} from '../../hooks/use-request'
import type {Product} from '../../types/products'
import {PageContext} from '../../App'

interface Props {
  budgetData: Budget
  hasBudgetWritePermissions: boolean
  deleteBudget: (budgetUuid: string) => void
  enabledProducts?: Product[]
}

export default function BudgetData({budgetData, hasBudgetWritePermissions, deleteBudget, enabledProducts}: Props) {
  const {addToast} = useToastContext()
  const {path: editBudgetPath} = useRoute(EDIT_BUDGET_ROUTE, {budgetUUID: budgetData.uuid})
  const {path: deletePath} = useRoute(UPSERT_BUDGET_ROUTE, {budgetUUID: budgetData.uuid})
  const {path: editCostCenterPath} = useRoute(EDIT_COST_CENTER_ROUTE, {costCenterUUID: budgetData.targetId})
  const isStafftoolsRoute = useContext(PageContext).isStafftoolsRoute

  async function handleDeleteBudget() {
    try {
      const {ok} = await doRequest(HTTPMethod.DELETE, deletePath, {})
      if (ok) {
        deleteBudget(budgetData.uuid)
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'success',
          message: 'Budget deleted',
          role: 'status',
        })
      } else {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Unable to delete budget',
          role: 'alert',
        })
      }
    } catch {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: 'Unable to delete budget',
        role: 'alert',
      })
    }
  }

  function IconType({type}: {type: string}) {
    if (type === BUDGET_SCOPE_ORGANIZATION) {
      return <OrganizationIcon size={16} />
    } else if ([BUDGET_SCOPE_ENTERPRISE, BUDGET_SCOPE_CUSTOMER].includes(type)) {
      return <GlobeIcon size={16} />
    } else if (type === BUDGET_SCOPE_REPOSITORY) {
      return <RepoIcon size={16} />
    }
    return <CreditCardIcon size={16} />
  }

  function fullTargetType(type: string) {
    if (type === BUDGET_SCOPE_ORGANIZATION) {
      return 'Organization'
    } else if (type === BUDGET_SCOPE_REPOSITORY) {
      return 'Repository'
    } else if ([BUDGET_SCOPE_ENTERPRISE, BUDGET_SCOPE_CUSTOMER].includes(type)) {
      return 'Enterprise'
    } else if (type === ResourceType.CostCenterResource) {
      return 'Cost center'
    }
    return ''
  }

  function getFriendlyProductName(pricingTargetId?: string): string {
    if (!enabledProducts || !pricingTargetId) return ''

    return enabledProducts.find(product => product.name === pricingTargetId)?.friendlyProductName ?? ''
  }

  return (
    <>
      <Box
        as="tr"
        key={budgetData.uuid}
        sx={{
          ...tableRowStyle,
          ...tableRowStyleRowtoCol,
        }}
      >
        <Box as="td" sx={{display: 'flex', flex: 3}}>
          <Box sx={{pr: [0, 3, 3], display: ['none', 'flex', 'flex'], alignItems: 'center'}}>
            <IconType type={budgetData.targetType} />
          </Box>
          <Box sx={{display: 'flex', alignItems: [null, 'center', 'center'], width: ['100%', '50%', 'auto']}}>
            <Box sx={tableDataCellStyle}>
              <Text sx={{fontSize: 0, color: 'fg.muted', mr: [1, 0, 0]}}>{fullTargetType(budgetData.targetType)}</Text>
              {budgetData.targetType === ResourceType.CostCenterResource && !budgetData.targetName ? (
                <Link href={editCostCenterPath} sx={{color: 'btn.text'}}>
                  <Text sx={{fontWeight: 'normal'}}>View Details</Text>
                </Link>
              ) : (
                <Text sx={{fontWeight: 'bold', fontSize: 1}}>{budgetData.targetName}</Text>
              )}
            </Box>
            <BudgetLabel budgetCurrentAmount={budgetData.currentAmount} budgetTargetAmount={budgetData.targetAmount} />
          </Box>
        </Box>
        <Box as="td" sx={{flex: 1, ml: [0, 2, 2], mr: [0, 1, 2]}}>
          <Box sx={tableDataCellStyle}>
            <Text sx={{fontSize: 0, color: 'fg.muted'}}>Product</Text>
            <Text sx={{fontSize: 1}}>{getFriendlyProductName(budgetData.pricingTargetId)}</Text>
          </Box>
        </Box>
        <Box as="td" sx={{flex: 1, ml: [0, 1, 2], mr: [0, 2, 2]}}>
          <Box sx={tableDataCellStyle}>
            <Text sx={{fontSize: 0, color: 'fg.muted'}}>Alerts</Text>
            <Text sx={{fontSize: 1}}>{budgetData.alertEnabled ? 'On' : 'Off'}</Text>
          </Box>
        </Box>
        <Box as="td" sx={{flex: 3}}>
          <Box sx={{display: 'flex', flexDirection: 'column', width: ['100%', 'auto', 'auto']}}>
            <Box sx={{display: 'flex'}}>
              <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: '1'}}>
                <BudgetProgressBar
                  budgetCurrentAmount={budgetData.currentAmount}
                  budgetTargetAmount={budgetData.targetAmount}
                />
                <Box sx={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap'}}>
                  <div>
                    <BudgetWarningIcon isOverBudget={budgetData.currentAmount > budgetData.targetAmount} />
                    <Text sx={{fontWeight: 'normal'}}>{formatMoneyDisplay(budgetData.currentAmount)}</Text>
                    &nbsp;
                    <Text sx={{fontWeight: 'light', fontSize: 0}}>spent</Text>
                  </div>
                  <div>
                    <Text sx={{fontWeight: 'normal'}}>{formatMoneyDisplay(budgetData.targetAmount)}</Text>&nbsp;
                    <Text sx={{fontWeight: 'light', fontSize: 0}}>budget</Text>
                  </div>
                </Box>
              </Box>
              {(hasBudgetWritePermissions || isStafftoolsRoute) && (
                <BudgetActionMenu
                  budgetId={budgetData.uuid}
                  productName={getFriendlyProductName(budgetData.pricingTargetId)}
                  targetType={budgetData.targetType}
                  targetName={budgetData.targetName}
                  editLink={editBudgetPath}
                  onDeleteClick={handleDeleteBudget}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}
