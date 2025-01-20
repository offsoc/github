import {delete_cancelMigration, post_retryMigration} from '../msw-responders/migration'
import {BaseController} from './base-controller'

export class MigrationController extends BaseController {
  async retry() {
    this.server.sleep()
    throw new Error('Doot')
  }

  async cancel() {
    this.server.sleep()
    throw new Error('Doot')
  }

  public override handlers = [
    post_retryMigration(async () => {
      const project = this.db.memexes.get()
      const nextId = project.id + 1
      return {
        redirectUrl: `/orgs/app/projects/${nextId}/views/1`,
      }
    }),
    delete_cancelMigration(async () => {
      const project = this.db.memexes.get()
      const nextId = project.id + 1
      // TODO: this endpoint is meant to route to a legacy project
      // but we don't support this with mock data currently so I'm just
      // going to redirect to a different project for now to emulate this.
      return {
        redirectUrl: `/orgs/app/projects/${nextId}/views/1`,
      }
    }),
  ]
}
