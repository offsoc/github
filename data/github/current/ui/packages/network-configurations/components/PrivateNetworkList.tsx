import {Box, Button} from '@primer/react'
import {ListView} from '@github-ui/list-view'
import type {PrivateNetwork} from '../classes/private-network'
import {PrivateNetworkConsts} from '../constants/private-network-consts'
import {PrivateNetworkItem} from './PrivateNetworkItem'

interface ICommonProps {
  ariaLabelledBy?: string
  ariaDescribedBy?: string
  validationStatus?: 'error' | 'success'
}
export interface IEmptyStateCardProps extends ICommonProps {
  privateNetworks: []
  enabledForCodespaces: boolean
  onShowNewDialog: () => void
}
export interface IPopulatedListProps extends ICommonProps {
  privateNetworks: PrivateNetwork[]
  onRemove?: (removedPrivateNetwork: PrivateNetwork) => void
}
export type IPrivateNetworkListProps = IEmptyStateCardProps | IPopulatedListProps

export function PrivateNetworkList(props: IPrivateNetworkListProps) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: props.validationStatus === 'error' ? 'danger.emphasis' : 'border.default',
        borderRadius: '6px',
        width: '100%',
      }}
    >
      {props.privateNetworks.length === 0 ? (
        <EmptyStateCard {...(props as IEmptyStateCardProps)} />
      ) : (
        <ListView title="Private Network List" variant="default" ariaLabelledBy={props.ariaLabelledBy}>
          {props.privateNetworks.map(network => {
            return (
              <PrivateNetworkItem
                key={network.id}
                privateNetwork={network}
                onRemove={(props as IPopulatedListProps).onRemove}
              />
            )
          })}
        </ListView>
      )}
    </Box>
  )
}

function EmptyStateCard(cardProps: IEmptyStateCardProps) {
  return (
    <Box
      sx={{
        padding: 48,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Box sx={{fontSize: '16px', color: 'fg.default', fontWeight: 'bold'}}>
        {PrivateNetworkConsts.noAzurePrivateNetworksAdded}
      </Box>
      {!cardProps.enabledForCodespaces && (
        <Button
          onClick={() => cardProps.onShowNewDialog()}
          aria-labelledby={cardProps.ariaLabelledBy}
          aria-describedby={cardProps.ariaDescribedBy}
          sx={{marginTop: 3}}
        >
          {PrivateNetworkConsts.addAzureVirtualNetwork}
        </Button>
      )}
    </Box>
  )
}
