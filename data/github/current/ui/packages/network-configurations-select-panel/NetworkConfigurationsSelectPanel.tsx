import {Heading, Link, FormControl, ActionList} from '@primer/react'
import {useState, useEffect} from 'react'
import {TriangleDownIcon} from '@primer/octicons-react'
import {NetworkConfigurationConsts} from './constants/network-configurations-consts'
import {SelectPanel} from '@primer/react/drafts'
import {requestSubmit} from '@github-ui/form-utils'
import {NetworkConfiguration, ComputeService} from '@github-ui/network-configurations'

export interface NetworkConfigurationsSelectPanelProps {
  networkConfigurations: NetworkConfiguration[]
  selectedNetworkConfig?: NetworkConfiguration | undefined
  isReadonly: boolean
  isUpdate: boolean
  formId: string
}

export function NetworkConfigurationsSelectPanel({
  networkConfigurations,
  selectedNetworkConfig,
  isReadonly,
  isUpdate,
  formId,
}: NetworkConfigurationsSelectPanelProps) {
  networkConfigurations = networkConfigurations ?? []
  const noNetworkConfig = new NetworkConfiguration('-1', 'No configuration', '', ComputeService.Actions, '', [])
  networkConfigurations = [noNetworkConfig, ...networkConfigurations]
  const currentNetworkConfig = isUpdate && selectedNetworkConfig ? selectedNetworkConfig : noNetworkConfig
  const [selected, setSelected] = useState(currentNetworkConfig)
  const currentNetworkConfigIsDisabled = isUpdate && currentNetworkConfig.computeService !== ComputeService.Actions
  const [shouldSubmit, setShouldSubmit] = useState(false)
  const [searchText, setSearchText] = useState('')
  const filtered_networks = networkConfigurations.filter(
    item => !searchText || (item?.name ?? '').toLowerCase().includes(searchText.toLowerCase()),
  )

  const onSelectChange = (item: NetworkConfiguration) => {
    setSelected(item)
    const inputElement = document.querySelector('.js-network-configuration-selector') as HTMLInputElement
    if (inputElement) {
      inputElement.value = item.id
      const event = new Event('change', {bubbles: true})
      inputElement.dispatchEvent(event)
    }
    if (item === currentNetworkConfig) return
    if (isUpdate) setShouldSubmit(true)
  }

  useEffect(() => {
    if (typeof document === 'undefined') {
      // Bail during server-side rendering since none of this is used then.
      return
    }
    if (isUpdate && shouldSubmit) {
      const form = document.getElementById(formId) as HTMLFormElement
      requestSubmit(form)
      setShouldSubmit(false)
    }
  }, [formId, isUpdate, shouldSubmit])

  return (
    <article>
      <Heading as="h3" sx={{fontSize: 3, fontWeight: 'normal'}}>
        {NetworkConfigurationConsts.networkConfigurations}
      </Heading>
      <p className="color-fg-muted mb-2">
        {NetworkConfigurationConsts.networkConfigurationsDescription}{' '}
        <Link inline href={NetworkConfigurationConsts.learnMoreLink}>
          {NetworkConfigurationConsts.learnMore}
        </Link>
      </p>
      <FormControl id="network-configuration-select-panel">
        <FormControl.Label visuallyHidden>Network Configurations Select Panel</FormControl.Label>
        <SelectPanel title="Select network configuration" selectionVariant="instant">
          <SelectPanel.Button disabled={isReadonly} trailingVisual={TriangleDownIcon}>
            {selected.name}
          </SelectPanel.Button>
          <SelectPanel.Header>
            <SelectPanel.SearchInput onChange={e => setSearchText(e.target.value)} />
          </SelectPanel.Header>
          {filtered_networks.length === 0 ? (
            <SelectPanel.Message variant="empty" title={`No network configuration found`}>
              <span>Try a different search term</span>
            </SelectPanel.Message>
          ) : (
            <ActionList selectionVariant="single">
              {filtered_networks
                .filter(item => item.computeService === ComputeService.Actions)
                .map(item => (
                  <ActionList.Item
                    key={item.id}
                    role="menuitemradio"
                    selected={item.id === selected.id}
                    aria-checked={item.id === selected.id}
                    onSelect={() => onSelectChange(item)}
                  >
                    {item.name}
                  </ActionList.Item>
                ))}
              {currentNetworkConfigIsDisabled && (
                <>
                  <ActionList.Divider />
                  <ActionList.Group>
                    <ActionList.GroupHeading>Disabled configuration</ActionList.GroupHeading>
                    <ActionList.Item
                      role="menuitemradio"
                      selected={currentNetworkConfig.id === selected.id}
                      aria-checked={currentNetworkConfig.id === selected.id}
                    >
                      {currentNetworkConfig.name}
                    </ActionList.Item>
                  </ActionList.Group>
                </>
              )}
            </ActionList>
          )}
        </SelectPanel>
        {currentNetworkConfigIsDisabled && (
          <FormControl.Validation variant="error">This network configuration is disabled</FormControl.Validation>
        )}
      </FormControl>
      <input
        type="text"
        name="network_config_id"
        className="js-network-configuration-selector"
        value={selected.id}
        hidden
        readOnly
      />
    </article>
  )
}
