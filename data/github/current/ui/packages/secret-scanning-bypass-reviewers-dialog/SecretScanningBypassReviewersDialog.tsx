import {BypassDialog} from '@github-ui/bypass-actors/BypassDialog'
import {verifiedFetch} from '@github-ui/verified-fetch'
import type {BypassActor} from '@github-ui/bypass-actors/types'
import {Button} from '@primer/react'
import {useState} from 'react'

export interface SecretScanningBypassReviewersDialogProps {
  baseAvatarUrl: string
  enabledBypassActors: BypassActor[]
  addBypassReviewerPath: string
  initialSuggestions: BypassActor[]
  suggestionsUrl: string
  ownerId: number
  ownerScope: string
}

const reviewerType = (type: string) => {
  switch (type) {
    case 'Team':
      return 'TEAM'
    case 'RepositoryRole':
      return 'ROLE'
    case 'OrganizationAdmin':
      return 'ORG_ADMIN'
    default:
      return 'UNKNOWN'
  }
}

export function SecretScanningBypassReviewersDialog(props: SecretScanningBypassReviewersDialogProps) {
  const [showDialog, setShowDialog] = useState(false)

  const addBypassActor = async (actorId: BypassActor['actorId'], actorType: BypassActor['actorType']) => {
    const formData = new FormData()
    formData.set('owner_id', props.ownerId.toString())
    formData.set('owner_scope', props.ownerScope)
    formData.set('reviewer_id', actorId?.toString() || '')
    formData.set('reviewer_type', reviewerType(actorType))

    const result = await verifiedFetch(props.addBypassReviewerPath, {
      method: 'post',
      body: formData,
    })

    window.location.reload()
    return result
  }

  const onClose = (): void => {
    setShowDialog(false)
  }

  return (
    <>
      <Button onClick={() => setShowDialog(true)}>Add role or team</Button>
      {showDialog && (
        <BypassDialog
          baseAvatarUrl={props.baseAvatarUrl}
          enabledBypassActors={props.enabledBypassActors}
          initialSuggestions={props.initialSuggestions}
          onClose={onClose}
          addBypassActor={addBypassActor}
          suggestionsUrl={props.suggestionsUrl}
          addReviewerSubtitle={'Choose which roles and teams can bypass this ruleset'}
        />
      )}
    </>
  )
}
