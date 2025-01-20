import {MockPayloadGenerator, type MockEnvironment} from 'relay-test-utils'

import type {BudgetAlertSelector} from '../../../components/budget/BudgetAlertSelector'

export const mockBudgetAlertQueries = (
  environment: MockEnvironment,
  props?: Partial<React.ComponentProps<typeof BudgetAlertSelector>>,
) => {
  for (const operation of environment.mock.getAllOperations()) {
    switch (operation.request.node.params.name) {
      case 'UserPickerEnterpriseOwnersQuery': {
        environment.mock.resolve(
          operation,
          MockPayloadGenerator.generate(operation, {
            EnterpriseAdministratorConnection() {
              return {
                nodes: [
                  {id: 'U_123', login: 'test-login-1', name: 'owner 1', avatarUrl: 'url1'},
                  {id: 'U_234', login: 'owner2', name: 'owner 2', avatarUrl: 'url2'},
                ],
              }
            },
          }),
        )
        break
      }
      case 'UserPickerInitialUsersQuery': {
        environment.mock.resolve(
          operation,
          MockPayloadGenerator.generate(operation, {
            Query() {
              if (props?.alertRecipientUserIds)
                return {
                  nodes: props.alertRecipientUserIds.map(id => ({id, login: `${id}-login`})),
                }
              return {
                nodes: [{id: 'U_123', login: 'current-user', name: 'owner 1', avatarUrl: 'url1'}],
              }
            },
          }),
        )
        break
      }
    }
  }
}
