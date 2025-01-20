import {CostCenterState, CostCenterType, ResourceType} from '../../enums/cost-centers'

export const mockCostCenter = {
  costCenterKey: {
    customerId: '123',
    targetType: CostCenterType.ZuoraSubscription,
    targetId: '',
    uuid: '7fba8517-6d6d-4475-83d7-e7d242661e9f',
  },
  name: 'test',
  resources: [{id: '123', type: ResourceType.Org}],
  costCenterState: CostCenterState.Active,
}

export const USER_RESOURCE_LIST = [
  {
    type: ResourceType.User,
    id: 'U_1',
  },
  {
    type: ResourceType.User,
    id: 'U_2',
  },
  {
    type: ResourceType.User,
    id: 'U_3',
  },
  {
    type: ResourceType.User,
    id: 'U_4',
  },
  {
    type: ResourceType.User,
    id: 'U_5',
  },
  {
    type: ResourceType.User,
    id: 'U_6',
  },
  {
    type: ResourceType.User,
    id: 'U_7',
  },
  {
    type: ResourceType.User,
    id: 'U_8',
  },
  {
    type: ResourceType.User,
    id: 'U_9',
  },
  {
    type: ResourceType.User,
    id: 'U_10',
  },
  {
    type: ResourceType.User,
    id: 'U_11',
  },
]
