import {useCallback, useState, useEffect, useContext} from 'react'
import {Box, Button, Dialog, Flash, Heading, Link, Octicon, Text} from '@primer/react'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useNavigate} from '@github-ui/use-navigate'
import {CheckCircleIcon, AlertIcon} from '@primer/octicons-react'

import {
  BILLING_MANAGER,
  ENTERPRISE_OWNER,
  ENTERPRISE_ORG_OWNER,
  BUDGET_SCOPE_COST_CENTER,
  BUDGET_SCOPE_CUSTOMER,
  BUDGET_SCOPE_ORGANIZATION,
  BUDGET_SCOPE_REPOSITORY,
  HighWatermarkProducts,
} from '../../constants'
import {BudgetLimitTypes} from '../../enums/budgets'
import {HTTPMethod, doRequest} from '../../hooks/use-request'
import useRoute from '../../hooks/use-route'
import {BUDGETS_ROUTE, UPSERT_BUDGET_ROUTE} from '../../routes'
import {pageHeadingStyle} from '../../utils'

import {BudgetAmount} from './BudgetAmount'
import {BudgetAlertSelector} from './BudgetAlertSelector'
import {BudgetProductSelector} from './BudgetProductSelector'
import {BudgetScopeSelector} from './BudgetScopeSelector'
import {BudgetSelectedProduct} from './BudgetSelectedProduct'
import {BudgetSelectedScope} from './BudgetSelectedScope'

import type {UpsertBudgetRequest, EditBudget, BudgetPicker} from '../../types/budgets'
import type {AdminRole} from '../../types/common'
import type {Product} from '../../types/products'
import {PageContext} from '../../App'

type Props = {
  budget?: EditBudget
  slug: string
  currentUserId?: string
  adminRoles: AdminRole[]
  enabledProducts: Product[]
}

export const defaultBudgetLimitType = (product: string) => {
  // By default, Actions will not enforce a hard limit on usage
  // High watermark/seat based products cannot enforce a hard limit, since usage cannot be adjusted during the month
  if (isProductHighWaterMark(product)) {
    return BudgetLimitTypes.AlertingOnly
  }
  return BudgetLimitTypes.PreventFurtherUsage
}

const isProductHighWaterMark = (product: string) => {
  return Object.values(HighWatermarkProducts).includes(product as HighWatermarkProducts)
}

export default function BudgetForm({budget, slug, currentUserId, adminRoles, enabledProducts}: Props) {
  const navigate = useNavigate()
  const [budgetAmount, setBudgetAmount] = useState<number | string>(budget ? budget.targetAmount : 0)
  const [budgetProduct, setBudgetProduct] = useState(budget ? budget?.pricingTargetId : enabledProducts[0]?.name || '')
  const [budgetLimitType, setBudgetLimitType] = useState<BudgetLimitTypes>(
    budget ? budget.budgetLimitType : defaultBudgetLimitType(budgetProduct),
  )
  const [budgetScope, setBudgetScope] = useState<string>(budget ? budget.targetType : BUDGET_SCOPE_CUSTOMER)
  const [budgetScopeIds, setBudgetScopeId] = useState<string[]>(budget ? [budget.targetId] : ['1'])

  const [alertEnabled, setAlertEnabled] = useState<boolean>(budget?.alertEnabled ?? true)
  const defaultRecipient = currentUserId ? [currentUserId] : []
  const [alertRecipientUserIds, setAlertRecipientUserIds] = useState<string[]>(
    budget?.alertRecipientUserIds ? budget.alertRecipientUserIds : defaultRecipient,
  )
  const [isConfirmUpdateDialogOpen, setIsConfirmUpdateDialogOpen] = useState(false)
  const onConfirmUpdateDialogOpen = useCallback((e: React.FormEvent<EventTarget>) => {
    e.preventDefault()
    return setIsConfirmUpdateDialogOpen(true)
  }, [])
  const onConfirmUpdateDialogClose = useCallback(() => setIsConfirmUpdateDialogOpen(false), [])

  const isEnterpriseRoute = useContext(PageContext).isEnterpriseRoute

  useEffect(() => {
    if (!budget) {
      setBudgetLimitType(defaultBudgetLimitType(budgetProduct))
    }
  }, [budgetProduct, budget])

  const {addToast} = useToastContext()

  const action = budget ? 'edit' : 'create'

  const {path: allBudgetsRoute} = useRoute(BUDGETS_ROUTE)
  const {path: editBudgetsRoute} = useRoute(UPSERT_BUDGET_ROUTE, {budgetUUID: budget?.uuid ?? ''})

  async function createBudget() {
    const data: UpsertBudgetRequest = {
      targetAmount: budgetAmount as number,
      targetType: budgetScope,
      targetId: budgetScopeIds[0] ?? '1', // We only support single scope creation right now
      pricingTargetType: 'ProductPricing',
      pricingTargetId: budgetProduct,
      budgetLimitType,
      alertEnabled,
      alertRecipientUserIds: alertEnabled ? alertRecipientUserIds : [],
    }

    try {
      const res = await doRequest<UpsertBudgetRequest>(HTTPMethod.POST, allBudgetsRoute, data)
      if (!res.ok) {
        let message = 'There was an issue creating your budget'

        if (res.data?.error?.includes('Budget with this key already exists')) {
          message = `A budget for this product and scope already exists. Please edit the existing budget instead of creating another.`
        }

        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message,
          role: 'alert',
        })
      } else {
        navigate(allBudgetsRoute)
      }
    } catch {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: 'There was an issue creating your budget',
        role: 'alert',
      })
    }
  }

  async function editBudget() {
    if (!budget) return

    const data: UpsertBudgetRequest = {
      targetAmount: budgetAmount as number,
      targetType: budgetScope,
      targetId: budgetScopeIds[0] ?? '1', // We only support single scope creation right now
      pricingTargetType: budget.pricingTargetType,
      pricingTargetId: budget.pricingTargetId,
      budgetLimitType,
      alertEnabled,
      alertRecipientUserIds: alertEnabled ? alertRecipientUserIds : [],
    }

    try {
      const {ok} = await doRequest<UpsertBudgetRequest>(HTTPMethod.PUT, editBudgetsRoute, data)
      if (!ok) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'There was an issue editing your budget',
          role: 'alert',
        })
      } else {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'success',
          message: `Your budget has been updated`,
          icon: <CheckCircleIcon />,
          role: 'status',
        })
        navigate(allBudgetsRoute)
      }
    } catch {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: 'There was an issue editing your budget',
        role: 'alert',
      })
    }
  }

  const handleSubmit = async (e?: React.FormEvent<EventTarget>) => {
    e?.preventDefault()
    if (!budgetScopeIds[0]) {
      let message = ''
      switch (budgetScope) {
        case BUDGET_SCOPE_ORGANIZATION:
          message = 'Please select at least one organization in order to successfully create a budget'
          break
        case BUDGET_SCOPE_REPOSITORY:
          message = 'Please select at least one repository in order to successfully create a budget'
          break
        case BUDGET_SCOPE_COST_CENTER:
          message = 'Please select at least one cost center in order to successfully create a budget'
          break
        default:
          message = 'Please select a scope in order to successfully create a budget'
      }
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message,
        role: 'alert',
      })
      return
    }

    if (alertEnabled && alertRecipientUserIds.length === 0) {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: 'At least one alert recipient must be selected',
        role: 'alert',
      })
      return
    }

    if (!budgetProduct) {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: 'A product must be selected',
        role: 'alert',
      })
      return
    }
    setIsConfirmUpdateDialogOpen(false)
    if (action === 'edit') {
      await editBudget()
    } else {
      await createBudget()
    }
  }

  const disablePicker: BudgetPicker[] = []

  if (isEnterpriseRoute) {
    if (
      !adminRoles.includes(ENTERPRISE_ORG_OWNER) &&
      (adminRoles.includes(ENTERPRISE_OWNER) || adminRoles.includes(BILLING_MANAGER))
    ) {
      disablePicker.push('repo')
    }

    if (
      adminRoles.includes(ENTERPRISE_ORG_OWNER) &&
      !(adminRoles.includes(ENTERPRISE_OWNER) || adminRoles.includes(BILLING_MANAGER))
    ) {
      disablePicker.push('org', 'enterprise')
    }
  } else {
    disablePicker.push('org', 'repo', 'enterprise')
  }

  const shouldConfirmEditModalBeDisplayed = () => {
    if (
      budget &&
      (budgetAmount as number) < budget.targetAmount &&
      budgetLimitType === BudgetLimitTypes.PreventFurtherUsage &&
      action === 'edit'
    ) {
      return true
    }
    return false
  }

  return (
    <>
      <header className="Subhead flex-column">
        <Heading as="h2" className="Subhead-heading" sx={pageHeadingStyle}>
          <Link href={allBudgetsRoute}>Budgets and alerts</Link>
          <span>&nbsp;/&nbsp;</span>
          {action === 'edit' ? 'Edit monthly budget' : 'New monthly budget'}
        </Heading>
        {action === 'create' && (
          <Text sx={{color: 'fg.muted'}}>Create a budget to track spending for a selected product and scope.</Text>
        )}
      </header>
      <Box sx={{maxWidth: '65ch'}}>
        <form onSubmit={shouldConfirmEditModalBeDisplayed() ? onConfirmUpdateDialogOpen : handleSubmit}>
          {action === 'create' && (
            <>
              <BudgetProductSelector
                budgetProduct={budgetProduct}
                setBudgetProduct={setBudgetProduct}
                products={enabledProducts}
              />
              <BudgetScopeSelector
                budgetScope={budgetScope}
                setBudgetScope={setBudgetScope}
                setBudgetScopeId={setBudgetScopeId}
                budgetScopeIds={budgetScopeIds}
                slug={slug}
                disablePicker={disablePicker}
                budgetProduct={budgetProduct}
              />
            </>
          )}
          {action === 'edit' && (
            <>
              <BudgetSelectedProduct budgetProduct={budgetProduct} enabledProducts={enabledProducts} />
              <BudgetSelectedScope budgetScope={budgetScope} budgetTargetName={budget?.targetName || ''} />
            </>
          )}
          <BudgetAmount
            budgetAmount={budgetAmount}
            setBudgetAmount={setBudgetAmount}
            action={action}
            budgetLimitType={budgetLimitType}
            setBudgetLimitType={setBudgetLimitType}
            budgetProduct={budgetProduct}
          />
          {isEnterpriseRoute && (
            <BudgetAlertSelector
              alertEnabled={alertEnabled}
              setAlertEnabled={setAlertEnabled}
              alertRecipientUserIds={alertRecipientUserIds}
              setAlertRecipientUserIds={setAlertRecipientUserIds}
              slug={slug}
            />
          )}
          <Box as="hr" sx={{p: 1}} />
          <Box sx={{display: 'flex'}}>
            <Button type="submit" variant="primary">
              {action === 'edit' ? 'Update budget' : 'Create budget'}
            </Button>
            <Button sx={{ml: 2}} onClick={() => navigate(allBudgetsRoute)}>
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
      {isConfirmUpdateDialogOpen && (
        <Dialog
          aria-labelledby="confirm-budget-edit-dialog-header"
          data-testid="confirm-budget-edit-dialog"
          title="Confirm budget update"
          onDismiss={onConfirmUpdateDialogClose}
          isOpen={isConfirmUpdateDialogOpen}
          sx={{width: 470}}
        >
          <Dialog.Header sx={{border: 0, bg: 'transparent'}}>Confirm editing budget</Dialog.Header>
          <Box sx={{px: 3}}>
            <Text as="p" sx={{mb: 0}}>
              Are you sure you want to save changes made to this monthly budget?
            </Text>
            <Flash variant="warning" sx={{display: 'flex', mt: 3, mb: 2}}>
              <Octicon icon={AlertIcon} size={20} sx={{mr: 2, pt: 1, color: 'accent.fg'}} />
              <span>
                Usage for the selected product may be stopped, in case the updated budget limit is less than the spend
                already incurred this month.
              </span>
            </Flash>
          </Box>
          <Box sx={{display: 'flex', justifyContent: 'flex-end', p: 3}}>
            <Button onClick={onConfirmUpdateDialogClose} sx={{mr: 2}}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="danger" data-testid="confirm-budget-edit-dialog-cancel">
              Confirm
            </Button>
          </Box>
        </Dialog>
      )}
    </>
  )
}
