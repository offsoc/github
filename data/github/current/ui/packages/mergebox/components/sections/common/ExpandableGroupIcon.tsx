import {ChevronRightIcon} from '@primer/octicons-react'

export const ExpandableGroupIcon = ({isExpanded}: {isExpanded: boolean}) => {
  return (
    <div style={{transform: isExpanded ? 'rotate(90deg)' : ''}}>
      <ChevronRightIcon size={12} />
    </div>
  )
}
