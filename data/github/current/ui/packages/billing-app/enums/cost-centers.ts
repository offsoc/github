export enum CostCenterState {
  Active = 'CostCenterActive',
  Archived = 'CostCenterArchived',
}

export enum CostCenterType {
  NoCostCenter = 'NoCostCenter',
  GitHubEnterpriseCustomer = 'GitHubEnterpriseCustomer',
  ZuoraSubscription = 'ZuoraSubscription',
  CreditCard = 'CreditCard',
  AzureSubscription = 'AzureSubscription',
}

export enum ResourceType {
  NoTarget = 'NoTarget',
  User = 'User',
  Team = 'Team',
  Repo = 'Repo',
  Org = 'Org',
  Enterprise = 'Enterprise',
  CostCenterResource = 'CostCenterResource',
}
