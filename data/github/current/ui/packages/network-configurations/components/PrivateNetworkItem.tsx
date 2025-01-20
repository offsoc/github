import {Box, Button, FormControl, IconButton, TextInput} from '@primer/react'
import {PackageIcon, TrashIcon} from '@primer/octicons-react'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItem} from '@github-ui/list-view/ListItem'
import type {PrivateNetwork} from '../classes/private-network'
import {Dialog} from '@primer/react/experimental'
import {useCallback, useState} from 'react'
import {PrivateNetworkConsts} from '../constants/private-network-consts'
import {PrivateNetworkSummary} from './PrivateNetworkSummary'

interface IPrivateNetworkItemProps {
  privateNetwork: PrivateNetwork
  onRemove?: (removedPrivateNetwork: PrivateNetwork) => void
}

const formBoxStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  borderColor: 'border.default',
  rowGap: 3,
}

export function PrivateNetworkItem(props: IPrivateNetworkItemProps) {
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false)
  const onEditDialogClose = useCallback(() => {
    setShowEditDialog(false)
  }, [])
  const renderFooter = () => {
    if (props.onRemove) {
      return (
        <Dialog.Footer
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Button variant="danger" onClick={() => props.onRemove && props.onRemove(props.privateNetwork)}>
            Remove network
          </Button>
          <Button onClick={() => setShowEditDialog(false)}>Close</Button>
        </Dialog.Footer>
      )
    }
    return null
  }
  return (
    <>
      {showEditDialog && (
        <Dialog
          title={props.privateNetwork.resourceName}
          onClose={onEditDialogClose}
          renderFooter={renderFooter}
          width="large"
        >
          <Box sx={formBoxStyle}>
            <FormControl>
              <FormControl.Label>{PrivateNetworkConsts.azureNetworkResourceIdLabel}</FormControl.Label>
              <TextInput type="text" readOnly contrast sx={{width: '100%'}} value={props.privateNetwork.id} />
            </FormControl>
            <PrivateNetworkSummary privateNetwork={props.privateNetwork} />
          </Box>
        </Dialog>
      )}
      <ListItem
        title={
          <ListItemTitle
            value={props.privateNetwork.resourceName}
            onClick={() => setShowEditDialog(true)}
            containerSx={{display: 'flex', flexDirection: 'row'}}
            anchorSx={{flexGrow: 1}}
          />
        }
        metadata={
          <ListItemMetadata alignment="right">
            {props.onRemove && (
              // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
              <IconButton
                unsafeDisableTooltip={true}
                icon={TrashIcon}
                aria-label="Delete icon"
                size="medium"
                variant="invisible"
                onClick={() => props.onRemove && props.onRemove(props.privateNetwork)}
                sx={{color: 'fg.muted'}}
              />
            )}
          </ListItemMetadata>
        }
      >
        <ListItemLeadingContent>
          <ListItemLeadingVisual icon={PackageIcon} description="Private Network Icon" />
        </ListItemLeadingContent>
        <ListItemMainContent>
          <ListItemDescription>
            Subscription: {props.privateNetwork.subscription} · Region: {props.privateNetwork.location} · Subnet:{' '}
            {props.privateNetwork.subnet}
          </ListItemDescription>
        </ListItemMainContent>
      </ListItem>
    </>
  )
}
