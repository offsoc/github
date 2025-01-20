import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {Model} from '../../types'
import type {FeedbackState} from '../routes/playground/components/GettingStartedDialog/types'

export async function sendFeedback({model, feedback}: {model: Model; feedback: FeedbackState}): Promise<Response> {
  const response = await verifiedFetchJSON(`/marketplace/models/${model.registry}/${model.name}/feedback`, {
    method: 'POST',
    body: {
      feedback,
    },
  })
  if (response.ok) {
    return response
  } else {
    throw new Error('Failed to submit feedback')
  }
}
