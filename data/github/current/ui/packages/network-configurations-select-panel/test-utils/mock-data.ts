import type {NetworkConfigurationsSelectPanelProps} from '../NetworkConfigurationsSelectPanel'

export function getNetworkConfigurationsSelectPanelProps(): NetworkConfigurationsSelectPanelProps {
  return {
    networkConfigurations: [],
    selectedNetworkConfig: undefined,
    isReadonly: false,
    isUpdate: false,
    formId: '',
  }
}
