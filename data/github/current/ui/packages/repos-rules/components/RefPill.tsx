import type {FC} from 'react'
import {BranchName, Label, Octicon, Truncate, Text} from '@primer/react'
import {GitBranchIcon, TagIcon} from '@primer/octicons-react'
import {unqualifyRef, mapRefType} from '@github-ui/ref-utils'

const RefIcon: FC<{target: string}> = ({target}) => {
  const refType = mapRefType(target)
  if (refType === 'tag') {
    return <Octicon icon={TagIcon} sx={{mr: 1}} />
  }
  if (refType === 'branch') {
    return <Octicon icon={GitBranchIcon} sx={{mr: 1}} />
  }
  return null
}

type RefPillProps = {
  param: string
  displayAsLabel?: boolean
  showIcon?: boolean
  showQualifiedRef?: boolean
  maxWidth?: number
}

export const RefPill: FC<RefPillProps> = ({
  param,
  displayAsLabel = false,
  showIcon,
  showQualifiedRef,
  maxWidth = 100,
}) => {
  if (displayAsLabel) {
    return <Label variant="secondary">{param}</Label>
  }
  if (showQualifiedRef) {
    return (
      <BranchName as="span">
        <Truncate title={param} maxWidth={maxWidth} sx={{display: 'flex'}}>
          <Text sx={{overflowX: 'hidden', textOverflow: 'ellipsis'}}>
            {showIcon ? <RefIcon target={param} /> : null}
            {param}
          </Text>
        </Truncate>
      </BranchName>
    )
  }
  return (
    <BranchName as="span">
      <Truncate title={unqualifyRef(param) || ''} maxWidth={maxWidth} sx={{display: 'flex'}}>
        <Text sx={{overflowX: 'hidden', textOverflow: 'ellipsis'}}>
          {showIcon ? <RefIcon target={param} /> : null}
          {unqualifyRef(param)}
        </Text>
      </Truncate>
    </BranchName>
  )
}
