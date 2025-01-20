import {
  ActionMenu,
  ActionList,
  Box,
  Flash,
  Heading,
  Link,
  Octicon,
  PageLayout,
  Pagination,
  TextInput,
} from '@primer/react'
import {SearchIcon, MarkGithubIcon, LinkExternalIcon, AlertIcon, ShieldLockIcon} from '@primer/octicons-react'
import {useNavigate} from '@github-ui/use-navigate'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useEffect, useState} from 'react'
import type {NetworkConfiguration} from '../classes/network-configuration'
import {NetworkConfigurationConsts} from '../constants/network-configuration-consts'
import {AzureIcon} from '../components/AzureIcon'
import {ListView} from '@github-ui/list-view'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import {announce} from '@github-ui/aria-live'
import {NetworkConfigurationListItem} from '../components/NetworkConfigurationListItem'

export interface NetworkConfigurationsPayload {
  networks: NetworkConfiguration[]
  removeNetworkConfigurationPath: string
  updateNetworkConfigurationPath: string
  newPrivateNetworkPath: string
  networkConfigurationsPath: string
  enabledForCodespaces: boolean
  displayConfigStatusBanner: boolean
  displayAllVNetStatusBanner: boolean
  canEditNetworkConfiguration: boolean
  isBusiness: boolean
}

let removeNetworkConfigurationPath = ''
export function NetworkConfigurations() {
  const payload = useRoutePayload<NetworkConfigurationsPayload>()
  const [networkConfigurations, setNetworkConfigurations] = useState<NetworkConfiguration[]>(payload.networks ?? [])
  const [searchText, setSearchText] = useState('')
  const defaultNetworkConfigurationPerPage = 25

  removeNetworkConfigurationPath = payload.removeNetworkConfigurationPath

  const removeNetworkConfiguration = async (networkId: string) => {
    setNetworkConfigurations(networkConfigurations.filter(item => item.id !== networkId))
  }

  const serviceAgnostic = payload.enabledForCodespaces
  const [totalNetworkConfigurations, setTotalNetworkConfigurations] = useState(networkConfigurations.length)
  const pageCount = Math.ceil(totalNetworkConfigurations / defaultNetworkConfigurationPerPage)
  const [currentPage, setCurrentPage] = useState(1)
  //Set the message to the higher impact text, AllVNet, if both flags are set.
  const statusBannerMessage = payload.displayAllVNetStatusBanner
    ? NetworkConfigurationConsts.statusAllVNetBannerMessage
    : NetworkConfigurationConsts.statusConfigBannerMessage
  return (
    <PageLayout containerWidth="full" padding="none" sx={{p: 0}}>
      <PageLayout.Header>
        {(payload.displayConfigStatusBanner || payload.displayAllVNetStatusBanner) && (
          <Flash variant="warning" sx={{alignItems: 'center', display: 'flex', mb: 4}}>
            <Octicon icon={AlertIcon} />
            <div>
              <p>
                <b>Warning:</b> {statusBannerMessage}
              </p>
            </div>
          </Flash>
        )}
        <div className="border-bottom">
          <Heading as="h2" className="h2 text-normal">
            {NetworkConfigurationConsts.hostedComputeNetworkingTitle}
          </Heading>
          <p className="color-fg-muted mb-2">
            {NetworkConfigurationConsts.networkConfigurationsDescription}{' '}
            <Link inline href={NetworkConfigurationConsts.learnMoreLink}>
              {NetworkConfigurationConsts.learnMore}
            </Link>
          </p>
        </div>
      </PageLayout.Header>
      <PageLayout.Content as="div">
        {networkConfigurations.length === 0 && (
          <EmptyStateCard
            newPrivateNetworkPath={payload.newPrivateNetworkPath}
            serviceAgnostic={serviceAgnostic}
            isBusiness={payload.isBusiness}
            canEditNetworkConfiguration={payload.canEditNetworkConfiguration}
          />
        )}
        {networkConfigurations.length > 0 && (
          <div>
            <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'end', pb: '17px'}}>
              <TextInput
                block
                leadingVisual={SearchIcon}
                aria-label={NetworkConfigurationConsts.searchBoxPlaceholder}
                name="privateNetwork"
                placeholder={NetworkConfigurationConsts.searchBoxPlaceholder}
                onChange={e => setSearchText(e.target.value)}
              />
              {payload.canEditNetworkConfiguration && (
                <Box sx={{ml: 2}}>
                  <NetworkConfigurationActionMenu
                    newPrivateNetworkPath={payload.newPrivateNetworkPath}
                    serviceAgnostic={serviceAgnostic}
                  />
                </Box>
              )}
            </Box>
            <NetworkConfigurationList
              networkConfigurationsPath={payload.networkConfigurationsPath}
              searchText={searchText}
              networks={networkConfigurations}
              updateNetworkConfigurationPath={payload.updateNetworkConfigurationPath}
              removeNetworkConfigurationFunction={removeNetworkConfiguration}
              enabledForCodespaces={payload.enabledForCodespaces}
              pageNumber={currentPage}
              setTotalNetworkConfigurations={setTotalNetworkConfigurations}
              defaultNetworkConfigurationPerPage={defaultNetworkConfigurationPerPage}
              canEditNetworkConfiguration={payload.canEditNetworkConfiguration}
            />
          </div>
        )}
      </PageLayout.Content>
      <PageLayout.Footer>
        {pageCount > 1 && (
          <Pagination
            pageCount={pageCount}
            currentPage={currentPage}
            onPageChange={(e, newPage) => {
              e.preventDefault()
              if (currentPage !== newPage) {
                setCurrentPage(newPage)
              }
            }}
            showPages={{narrow: false}}
          />
        )}
      </PageLayout.Footer>
    </PageLayout>
  )
}

function EmptyStateCard({
  newPrivateNetworkPath,
  serviceAgnostic,
  isBusiness,
  canEditNetworkConfiguration,
}: {
  newPrivateNetworkPath: string
  serviceAgnostic: boolean
  isBusiness: boolean
  canEditNetworkConfiguration: boolean
}) {
  return (
    <Box
      sx={{
        border: '1px solid var(--borderColor-default, var(--color-border-default))',
        borderRadius: '6px',
        p: 132,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      {canEditNetworkConfiguration ? (
        <>
          <Box sx={{gap: 1, textAlign: 'center'}}>
            <Box sx={{fontSize: 3, color: 'fg.default', fontWeight: 'bold'}}>
              {NetworkConfigurationConsts.noNetworkConfigurationsAdded}
            </Box>
            <Box sx={{color: 'fg.muted', flexWrap: 'wrap', fontSize: '14px'}}>
              {isBusiness
                ? NetworkConfigurationConsts.noNetworkConfigurationsAddedDescriptionBusiness
                : NetworkConfigurationConsts.noNetworkConfigurationsAddedDescriptionOrg}
            </Box>
          </Box>
          <Box sx={{p: 5}}>
            <NetworkConfigurationActionMenu
              newPrivateNetworkPath={newPrivateNetworkPath}
              serviceAgnostic={serviceAgnostic}
            />
          </Box>
        </>
      ) : (
        <OrgDisabledEmptyStateCard />
      )}
    </Box>
  )
}

function NetworkConfigurationActionMenu({
  newPrivateNetworkPath,
  serviceAgnostic,
}: {
  newPrivateNetworkPath: string
  serviceAgnostic: boolean
}) {
  const navigate = useNavigate()
  return (
    <ActionMenu>
      <ActionMenu.Button variant="primary">{NetworkConfigurationConsts.newNetworkConfiguration}</ActionMenu.Button>
      <ActionMenu.Overlay width="medium">
        <ActionList>
          <ActionList.LinkItem onClick={() => navigate(newPrivateNetworkPath)}>
            {NetworkConfigurationConsts.azurePrivateNetwork}
            <ActionList.LeadingVisual>
              <AzureIcon />
            </ActionList.LeadingVisual>
            <ActionList.Description variant="block">
              {serviceAgnostic
                ? NetworkConfigurationConsts.azurePrivateNetworkDescriptionServiceAgnostic
                : NetworkConfigurationConsts.azurePrivateNetworkDescription}
            </ActionList.Description>
          </ActionList.LinkItem>
          <ActionList.Divider />
          <ActionList.Group>
            <ActionList.GroupHeading>Available in 2024</ActionList.GroupHeading>
            <ActionList.LinkItem onClick={() => navigate(NetworkConfigurationConsts.comingSoonLink)}>
              <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <span>{NetworkConfigurationConsts.githubHostedPrivateNetwork}</span>
                <Octicon icon={LinkExternalIcon} size={16} sx={{color: 'fg.subtle'}} />
              </Box>
              <ActionList.LeadingVisual>
                <MarkGithubIcon size={16} />
              </ActionList.LeadingVisual>
              <ActionList.Description variant="block">
                {NetworkConfigurationConsts.githubHostedPrivateNetworkDescription}
              </ActionList.Description>
            </ActionList.LinkItem>
          </ActionList.Group>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

function NetworkConfigurationList({
  networkConfigurationsPath,
  searchText,
  networks,
  updateNetworkConfigurationPath,
  removeNetworkConfigurationFunction,
  enabledForCodespaces,
  pageNumber,
  setTotalNetworkConfigurations,
  defaultNetworkConfigurationPerPage,
  canEditNetworkConfiguration,
}: {
  networkConfigurationsPath: string
  searchText: string
  networks: NetworkConfiguration[]
  updateNetworkConfigurationPath: string
  removeNetworkConfigurationFunction: (networkId: string) => void
  enabledForCodespaces: boolean
  pageNumber: number
  setTotalNetworkConfigurations: (page: number) => void
  defaultNetworkConfigurationPerPage: number
  canEditNetworkConfiguration: boolean
}) {
  const filteredNetworks = networks.filter(
    item => !searchText || item.name.toLowerCase().includes(searchText.toLowerCase()),
  )
  const itemCount = filteredNetworks.length
  const title = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`
  announce(title)
  const page = itemCount > 0 && !searchText ? pageNumber : 1
  const filteredNetworksSlice = getNetworkConfigurationsChunk(
    filteredNetworks,
    defaultNetworkConfigurationPerPage,
    page,
  )

  useEffect(() => {
    setTotalNetworkConfigurations(itemCount)
  }, [setTotalNetworkConfigurations, itemCount])

  return (
    <Box sx={{border: '1px solid', borderColor: 'border.muted', borderRadius: 2}}>
      <ListView metadata={<ListViewMetadata title={title} assistiveAnnouncement={title} />} title={title}>
        {filteredNetworksSlice.map(item => (
          <NetworkConfigurationListItem
            networkConfigurationsPath={networkConfigurationsPath}
            key={item.id}
            networkConfig={item}
            updateNetworkConfigurationPath={updateNetworkConfigurationPath}
            removeNetworkConfigurationPath={removeNetworkConfigurationPath}
            removeNetworkConfigurationFunction={removeNetworkConfigurationFunction}
            enabledForCodespaces={enabledForCodespaces}
            canEditNetworkConfiguration={canEditNetworkConfiguration}
          />
        ))}
      </ListView>
    </Box>
  )
}

function getNetworkConfigurationsChunk(
  networkConfigurations: NetworkConfiguration[],
  itemsPerPage: number,
  pageNumber: number,
) {
  const start = (pageNumber - 1) * itemsPerPage
  return networkConfigurations.slice(start, start + itemsPerPage)
}

function OrgDisabledEmptyStateCard() {
  return (
    <Box sx={{gap: 1, textAlign: 'center'}}>
      <Box sx={{fontSize: 3, color: 'fg.default', fontWeight: 'bold'}}>
        {NetworkConfigurationConsts.orgDisabledEmptyStateCardTitle}
      </Box>
      <Box sx={{color: 'fg.muted', flexWrap: 'wrap', fontSize: '14px'}}>
        <Octicon icon={ShieldLockIcon} sx={{pr: 1}} />
        {NetworkConfigurationConsts.orgDisabledEmptyStateCardDescription}
      </Box>
    </Box>
  )
}
