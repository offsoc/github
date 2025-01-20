import {Box} from '@primer/react'
import {Datum} from './Datum'
import {useCreatedAgo} from './use-created-ago'
import {DatumText} from './DatumText'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {usePipelineDetails} from '../PipelineDetails'

export function CreatorDatum() {
  const {
    cardPipeline: {actorAvatarUrl, actorLogin, createdAt},
  } = usePipelineDetails()
  const createdAgo = useCreatedAgo(createdAt)

  const creator = actorLogin || 'unknown'

  const renderCreator = actorAvatarUrl ? (
    <Box sx={{alignItems: 'center', display: 'flex', gap: '8px'}}>
      <GitHubAvatar src={actorAvatarUrl} size={16} />
      <DatumText sx={{fontSize: '14px'}}>{creator}</DatumText>
    </Box>
  ) : (
    <DatumText>{creator}</DatumText>
  )

  return <Datum name={createdAgo} value={renderCreator} />
}
