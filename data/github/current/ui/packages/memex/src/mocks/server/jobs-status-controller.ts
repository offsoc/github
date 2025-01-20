import {http, HttpResponse} from 'msw'

import {createBaseRoute} from '../../client/routes'
import {JobState} from '../jobs/job'
import {BaseController} from './base-controller'

const {baseRoute: jobRouteBase} = createBaseRoute('/job-status')
export const JOB_STATUS_ROUTE_PATH = jobRouteBase.childRoute('/:jobId')

export class JobStatusController extends BaseController {
  public get(jobId: string) {
    const {state, ttl} = this.db.jobs.get(jobId)

    return {
      job: {
        id: jobId,
        state,
        ttl,
      },
    }
  }

  public override handlers = [
    http.get(JOB_STATUS_ROUTE_PATH.fullPath, async ({params}) => {
      if (typeof params.jobId !== 'string') throw new Error(`${params.jobId} is not a string`)
      const jobStatus = this.get(params.jobId)
      const HTTP_ACCEPTED_STATUS_CODE = 202
      const HTTP_OK_STATUS_CODE = 200
      return HttpResponse.json(jobStatus, {
        status: jobStatus.job.state === JobState.SUCCESS ? HTTP_OK_STATUS_CODE : HTTP_ACCEPTED_STATUS_CODE,
      })
    }),
  ]
}
