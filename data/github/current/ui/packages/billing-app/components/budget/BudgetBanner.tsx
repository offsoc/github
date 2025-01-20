import {useState} from 'react'
import {useNavigate} from '@github-ui/use-navigate'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {AlertIcon, StopIcon, XIcon} from '@primer/octicons-react'
import {Box, Button, Flash, IconButton, Octicon, Text} from '@primer/react'

import useRoute from '../../hooks/use-route'
import {EDIT_BUDGET_ROUTE} from '../../routes'

import type {BudgetAlertDetails} from '../../types/budgets'

type BudgetBannerProps = {
  budgetAlertDetail: BudgetAlertDetails
}

export default function BudgetBanner({budgetAlertDetail}: BudgetBannerProps) {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(true)

  const {text, variant, dismissible, dismiss_link: dismissLink, budget_id: budgetId} = budgetAlertDetail

  const getIcon = () => {
    if (variant === 'danger') {
      return StopIcon
    } else return AlertIcon
  }

  const handleDismiss = async () => {
    setVisible(false)
    await verifiedFetchJSON(dismissLink, {method: 'POST'})
  }

  const icon = getIcon()
  const {path: editBudgetUrl} = useRoute(EDIT_BUDGET_ROUTE, {budgetUUID: budgetId})

  if (!visible) return null

  return (
    <Flash data-testid="billing-banner" variant={variant} sx={{display: 'flex', alignItems: 'center', mb: 3}}>
      <Octicon aria-label="Alert icon" icon={icon} sx={{margin: 2}} />
      <Text sx={{fontWeight: 'bold', m: 1}}>{text}</Text>
      <Box sx={{display: 'flex', marginLeft: 'auto', gap: '3', alignItems: 'center'}}>
        <Button sx={{m: 2}} onClick={() => navigate(editBudgetUrl)}>
          Update your budget
        </Button>
        {dismissible && (
          // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
          <IconButton
            unsafeDisableTooltip={true}
            aria-label="Close"
            icon={XIcon}
            size="small"
            onClick={handleDismiss}
            variant="invisible"
            sx={{svg: {color: 'black'}}}
          />
        )}
      </Box>
    </Flash>
  )
}
