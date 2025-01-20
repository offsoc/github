export class PrivateNetwork {
  id: string
  subscription: string
  virtualNetwork: string
  location: string
  subnet: string
  resourceGroup: string
  resourceName: string
  networkConfigurationId: string
  constructor(
    id: string,
    subscription: string,
    virtualNetwork: string,
    region: string,
    subnet: string,
    resourceGroup: string,
    resourceName: string,
    networkConfigurationId: string,
  ) {
    this.id = id
    this.subscription = subscription
    this.virtualNetwork = virtualNetwork
    this.location = region
    this.subnet = subnet
    this.resourceGroup = resourceGroup
    this.resourceName = resourceName
    this.networkConfigurationId = networkConfigurationId
  }
}
