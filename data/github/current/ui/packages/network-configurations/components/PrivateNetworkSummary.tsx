import {Box, FormControl, TextInput} from '@primer/react'
import {PrivateNetworkConsts} from '../constants/private-network-consts'
import type {PrivateNetwork} from '../classes/private-network'

interface IPrivateNetworkSummaryProps {
  privateNetwork: PrivateNetwork | null
}

export function PrivateNetworkSummary(props: IPrivateNetworkSummaryProps) {
  return (
    <>
      <FormControl>
        <FormControl.Label>{PrivateNetworkConsts.resourceNameLabel}</FormControl.Label>
        <TextInput readOnly contrast sx={{width: '100%'}} value={props.privateNetwork?.resourceName ?? ''} />
      </FormControl>
      <FormControl>
        <FormControl.Label>{PrivateNetworkConsts.azureSubscriptionIdLabel}</FormControl.Label>
        <TextInput readOnly contrast sx={{width: '100%'}} value={props.privateNetwork?.subscription ?? ''} />
      </FormControl>
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 2, rowGap: 3}}>
        <FormControl>
          <FormControl.Label>{PrivateNetworkConsts.virtualNetworkLabel}</FormControl.Label>
          <TextInput readOnly contrast sx={{width: '100%'}} value={props.privateNetwork?.virtualNetwork ?? ''} />
        </FormControl>
        <FormControl>
          <FormControl.Label>{PrivateNetworkConsts.subnetLabel}</FormControl.Label>
          <TextInput readOnly contrast sx={{width: '100%'}} value={props.privateNetwork?.subnet ?? ''} />
        </FormControl>
        <FormControl>
          <FormControl.Label>{PrivateNetworkConsts.resourceGroupLabel}</FormControl.Label>
          <TextInput readOnly contrast sx={{width: '100%'}} value={props.privateNetwork?.resourceGroup ?? ''} />
        </FormControl>
        <FormControl>
          <FormControl.Label>{PrivateNetworkConsts.azureRegionLabel}</FormControl.Label>
          <TextInput readOnly contrast sx={{width: '100%'}} value={props.privateNetwork?.location ?? ''} />
        </FormControl>
      </Box>
    </>
  )
}
