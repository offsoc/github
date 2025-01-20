import {pluralize} from '../../helpers/text'
import {currency} from '@github-ui/formatters'
import {Text} from '@primer/react'

type Props = {
  seatCount: number
  seatCost: number
}

export function NewAssignmentsEstimatedCost(props: Props) {
  return (
    <section aria-label="New assignments estimated cost">
      <span>
        <Text sx={{fontWeight: 600, mb: 0, fontSize: 12}} as="p">
          {pluralize(props.seatCount, 'unique seat', 's')} with an approximate cost of{' '}
          {currency(props.seatCost * props.seatCount)} will be added.
        </Text>
        <Text sx={{color: 'fg.muted', fontSize: 12}}>
          You will not be charged twice for members across multiple teams.{' '}
        </Text>
      </span>
    </section>
  )
}
