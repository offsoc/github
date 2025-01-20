import {Fragment} from 'react'
import {ActionList, Text} from '@primer/react'

import {SUBSCRIPTION_TYPES} from '../utils/subscriptions'

interface SubscriptionListProps {
  selected: string
  onSelect: (value: string) => void
}

function SubscriptionList(props: SubscriptionListProps) {
  return (
    <ActionList selectionVariant="single">
      {SUBSCRIPTION_TYPES.map((item, index) => (
        <Fragment key={index}>
          <ActionList.Item
            selected={item.subscriptionType === props.selected}
            onSelect={() => props.onSelect(item.subscriptionType)}
          >
            <Text sx={{fontWeight: 'bold'}}>{item.name}</Text>
            <ActionList.Description variant="block">{item.description}</ActionList.Description>
            {item.trailingIcon ? <ActionList.TrailingVisual>{item.trailingIcon}</ActionList.TrailingVisual> : null}
          </ActionList.Item>
          {index !== SUBSCRIPTION_TYPES.length - 1 ? <ActionList.Divider /> : ''}
        </Fragment>
      ))}
    </ActionList>
  )
}

export default SubscriptionList
