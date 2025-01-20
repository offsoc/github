import {Box, Heading, Text} from '@primer/react'
import {CreditCardIcon, GlobeIcon, OrganizationIcon, RepoIcon} from '@primer/octicons-react'
import {Fonts} from '../../utils'

import {
  BUDGET_SCOPE_COST_CENTER,
  BUDGET_SCOPE_CUSTOMER,
  BUDGET_SCOPE_ORGANIZATION,
  BUDGET_SCOPE_REPOSITORY,
} from '../../constants'

interface Props {
  budgetScope: string
  budgetTargetName: string
}

export function BudgetSelectedScope({budgetScope, budgetTargetName}: Props) {
  const getBudgetScopeDetails = (scope: string) => {
    switch (scope) {
      case BUDGET_SCOPE_CUSTOMER:
        return {
          name: 'Enterprise',
          description: 'Spending for all organizations and repositories in your enterprise.',
        }
      case BUDGET_SCOPE_ORGANIZATION:
        return {
          name: 'Organization',
          description: 'Spending for a single organization.',
        }
      case BUDGET_SCOPE_REPOSITORY:
        return {
          name: 'Repository',
          description: 'Spending for a single repository.',
        }
      case BUDGET_SCOPE_COST_CENTER:
        return {
          name: 'Cost center',
          description: 'Spending for a single cost center.',
        }
    }
  }

  const budgetScopeDetails = getBudgetScopeDetails(budgetScope)

  const budgetScopeIconMap: {[key: string]: JSX.Element} = {
    [BUDGET_SCOPE_CUSTOMER]: <GlobeIcon />,
    [BUDGET_SCOPE_ORGANIZATION]: <OrganizationIcon />,
    [BUDGET_SCOPE_REPOSITORY]: <RepoIcon />,
    [BUDGET_SCOPE_COST_CENTER]: <CreditCardIcon />,
  }

  return (
    <Box sx={{mb: 4}}>
      <Heading as="h3" sx={{fontSize: 2, mb: 2}} className="Box-title">
        Budget scope
      </Heading>
      <div className="Box">
        <Box className="Box-row" sx={{display: 'flex', flexDirection: 'column'}}>
          <Text sx={{fontWeight: 'bold'}}>{budgetScopeDetails?.name}</Text>
          <Text sx={{color: 'fg.muted'}}>{budgetScopeDetails?.description}</Text>
          <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, mt: 2}}>
            {budgetScopeIconMap[budgetScope]}
            <Text sx={{color: 'fg.subtle', fontSize: Fonts.FontSizeSmall}}>{budgetTargetName}</Text>
          </Box>
        </Box>
      </div>
    </Box>
  )
}
