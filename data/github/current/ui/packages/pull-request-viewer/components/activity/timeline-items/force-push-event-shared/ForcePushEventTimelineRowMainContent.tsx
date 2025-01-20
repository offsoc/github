import {BranchName, Link, Text} from '@primer/react'

type Props = {
  compareUrl: string
  beforeCommitUrl: string
  afterCommitUrl: string
  beforeCommitAbbreviatedOid: string
  afterCommitAbbreviatedOid: string
  refName: string
}

export function ForcePushEventTimelineRowMainContent({
  compareUrl,
  beforeCommitUrl,
  afterCommitUrl,
  beforeCommitAbbreviatedOid,
  afterCommitAbbreviatedOid,
  refName,
}: Props) {
  return (
    <Text sx={{mr: 1}}>
      &nbsp;
      <Link inline muted href={compareUrl}>
        force-pushed
      </Link>
      &nbsp; the <BranchName sx={{':hover': {textDecoration: 'none'}, color: 'fg.muted'}}>{refName}</BranchName> branch
      from{' '}
      <Link href={beforeCommitUrl} sx={{fontWeight: 'bold', color: 'fg.default'}}>
        {beforeCommitAbbreviatedOid}
      </Link>{' '}
      to{' '}
      <Link href={afterCommitUrl} sx={{fontWeight: 'bold', color: 'fg.default'}}>
        {afterCommitAbbreviatedOid}
      </Link>
    </Text>
  )
}
