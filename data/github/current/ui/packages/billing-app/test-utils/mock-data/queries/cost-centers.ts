import {MockPayloadGenerator, type MockEnvironment} from 'relay-test-utils'
import {USER_RESOURCE_LIST} from '..'

import {OrganizationPickerRecentQuery} from '../../../components/pickers/OrganizationPicker'
import {UserPickerInitialUsersQuery} from '../../../components/pickers/UserPicker'

import type {OperationDescriptor} from 'relay-runtime'

export const mockCostCenterOrgQueries = (environment: MockEnvironment) => {
  environment.mock.queuePendingOperation(OrganizationPickerRecentQuery, {
    slug: 'github-inc',
  })

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      OrganizationConnection() {
        return {
          nodes: [
            {id: 'O_111', login: 'test1', avatarUrl: 'github.localhost'},
            {id: 'O_222', login: 'test2', avatarUrl: 'github.localhost'},
          ],
          totalCount: 2,
        }
      },
    })
  })
}

export const mockCostCenterUserQueries = (environment: MockEnvironment) => {
  environment.mock.queuePendingOperation(UserPickerInitialUsersQuery, {
    ids: USER_RESOURCE_LIST.map(user => user.id),
  })

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Query() {
        return {
          nodes: USER_RESOURCE_LIST.map((user, index) => ({
            id: user.id,
            login: user.id,
            name: `owner-${index}`,
            avatarUrl: 'url1',
          })),
          totalCount: 2,
        }
      },
    })
  })
}
