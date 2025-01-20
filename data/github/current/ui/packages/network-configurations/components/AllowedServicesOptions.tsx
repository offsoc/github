import {Box, FormControl, RadioGroup, Radio, Label} from '@primer/react'
import {PrivateNetworkConsts} from '../constants/private-network-consts'
import {ComputeService} from '../classes/network-configuration'

interface IAllowedServicesOptionsProps {
  enabledForCodespaces: boolean
  actionsSelectable: boolean
  selectedService: ComputeService
  setSelectedService: (service: ComputeService) => void
}

export function AllowedServicesOptions(props: IAllowedServicesOptionsProps) {
  // Codespaces feature flag is off -- nothing the user can change
  if (!props.enabledForCodespaces) {
    return null
  }
  return (
    <Box sx={{mt: '16px', display: 'flex', flexDirection: 'column'}}>
      <RadioGroup name={props.selectedService} onChange={s => props.setSelectedService(s as ComputeService)}>
        <RadioGroup.Label>Services</RadioGroup.Label>
        <RadioGroup.Caption>Select the GitHub service to use with the network.</RadioGroup.Caption>
        <Box
          sx={{
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'border.default',
            borderRadius: 2,
          }}
        >
          <FormControl key={ComputeService.None} sx={{margin: '16px'}}>
            <Radio value={ComputeService.None} defaultChecked={props.selectedService === ComputeService.None} />
            <FormControl.Label>{PrivateNetworkConsts.allowedServicesNoneLabel}</FormControl.Label>
            <FormControl.Caption>{PrivateNetworkConsts.allowedServicesNoneDescription}</FormControl.Caption>
          </FormControl>
          <FormControl disabled={!props.actionsSelectable} key={ComputeService.Actions} sx={{margin: '16px'}}>
            <Radio value={ComputeService.Actions} defaultChecked={props.selectedService === ComputeService.Actions} />
            <FormControl.Label>{PrivateNetworkConsts.allowedServicesActionsLabel}</FormControl.Label>
            <FormControl.Caption>{PrivateNetworkConsts.allowedServicesActionsDescription}</FormControl.Caption>
          </FormControl>
          <FormControl key={ComputeService.Codespaces} sx={{margin: '16px'}}>
            <Radio
              value={ComputeService.Codespaces}
              defaultChecked={props.selectedService === ComputeService.Codespaces}
            />
            <FormControl.Label>
              {PrivateNetworkConsts.allowedServicesCodespacesLabel} <Label variant="success">Beta</Label>
            </FormControl.Label>
            <FormControl.Caption>{PrivateNetworkConsts.allowedServicesCodespacesDescription}</FormControl.Caption>
          </FormControl>
        </Box>
      </RadioGroup>
    </Box>
  )
}
