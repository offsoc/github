import {ChevronUpIcon} from '@primer/octicons-react'

export const ExpandableSectionIcon = ({isExpanded}: {isExpanded: boolean}) => {
  return (
    <div style={{transition: 'transform 0.15s ease-in-out', transform: isExpanded ? '' : 'rotate(180deg)'}}>
      <ChevronUpIcon />
    </div>
  )
}
