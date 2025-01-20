import {useState} from 'react'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {createRequest, deleteRequest} from '../services/api'

export interface FeatureRequestState {
  inProgress: boolean
  requested: boolean
  dismissed: boolean
  dismissedAt: string
  toggleFeatureRequest: () => void
}

export interface FeatureRequestInfo {
  alreadyRequested: boolean
  featureName: string
  requestPath: string
  dismissed: boolean
  dismissedAt?: string
}

export function useFeatureRequest(featureRequestInfo?: FeatureRequestInfo): FeatureRequestState {
  const {
    alreadyRequested = false,
    dismissed = false,
    dismissedAt = '',
    featureName = '',
    requestPath = '',
  } = featureRequestInfo ?? {}
  const [inProgress, setInProgress] = useState(false)
  const [requested, setRequested] = useState(alreadyRequested)
  const {addToast} = useToastContext()

  const toggleFeatureRequest = async () => {
    setInProgress(true)
    const request = requested ? deleteRequest : createRequest
    const success = await request(requestPath, featureName)
    if (success) {
      setRequested(!requested)
    } else {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({type: 'error', message: 'Something went wrong. Please try again later.'})
    }
    setInProgress(false)
  }

  return {
    inProgress,
    requested,
    dismissed,
    dismissedAt,
    toggleFeatureRequest,
  }
}
