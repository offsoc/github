export const NetworkConfigurationConsts = {
  hostedComputeNetworkingTitle: 'Hosted compute networking',
  networkConfigurationsDescription:
    'Set up the required network settings for your GitHub-hosted compute with network configurations.',
  learnMoreLink: 'https://github.co/actions-azure-vnet',
  learnMore: 'Learn more about network configurations.',
  runnerGroupNetworkingLink: 'https://github.co/runner-group-networking',
  createNetworkConfiguration: 'Create configuration',
  searchBoxPlaceholder: 'Search network configurations',
  comingSoonLink: 'https://github.com/github/roadmap/issues/821',
  runnerGroupItemUrl: (path: string, runnerGroupId: string) => `${path}/${runnerGroupId}`,
  noNetworkConfigurationsAdded: 'No network configurations added',
  noNetworkConfigurationsAddedDescriptionBusiness:
    'Network configurations associated with your GitHub Enterprise account will be listed here.',
  noNetworkConfigurationsAddedDescriptionOrg:
    'Network configurations created in your organization will be listed here.',
  azurePrivateNetwork: 'Azure private network',
  azurePrivateNetworkDescription:
    'Connect your Azure Virtual Network to align hosted runners with your network policies.',
  azurePrivateNetworkDescriptionServiceAgnostic:
    'Connect your Azure Virtual Network to align hosted compute services with your network policies.',
  githubHostedPrivateNetwork: 'GitHub-hosted private network',
  githubHostedPrivateNetworkDescription:
    'Control outbound communication and monitor network logs for GitHub-hosted runners.',
  backToNetworkingLabel: 'Back to Hosted compute networking',
  nameLabel: 'Configuration name',
  networkSettingsUrl: (path: string, networkId: string) => `${path}/${networkId}`,
  editNetworkConfigurationPath: (path: string, configurationId: string) => `${path}/${configurationId}/edit`,
  newNetworkConfiguration: 'New network configuration',
  disableNetworkConfiguration: 'Disable',
  deleteNetworkConfiguration: 'Delete configuration',
  formLink: 'https://github.co/vnet-region-form',
  docLink:
    'https://docs.github.com/en/enterprise-cloud@latest/admin/configuration/configuring-private-networking-for-hosted-compute-products/troubleshooting-azure-private-network-configurations-for-github-hosted-runners-in-your-enterprise#supported-regions',
  errorDisplayNameInUse: 'A network configuration with this name already exists. Please choose a different name.',
  errorNetworkResourceInUse:
    'A network configuration using this private network already exists. Please choose a different private network.',
  errorUnsupportedResourceLocation: (location: string): string =>
    `The private network's location '${location}' is not currently supported.`,
  errorDuplicateLocation: (location: string): string =>
    `This configuration already includes a network in '${location}'.`,
  statusConfigBannerMessage:
    'We are investigating issues with the network configuration setup process. ' +
    'Operations on network configurations may be slow or fail. ' +
    'Downstream services (Actions and Codespaces) that use network configurations should continue to function normally.',
  statusAllVNetBannerMessage:
    'We are investigating issues with the network configurations. ' +
    'Operations on network configurations may be slow or fail. ' +
    'Actions and Codespaces functionality using network configuratons may also be impacted.',
  orgDisabledEmptyStateCardTitle: 'No network configurations available',
  orgDisabledEmptyStateCardDescription: 'This setting has been disabled by enterprise administrators.',
}
