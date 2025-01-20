import type {
  CreateMemexChartRequest,
  DeleteMemexChartRequest,
  UpdateMemexChartRequest,
} from '../../client/api/charts/contracts/api'
import {delete_destroyChart, post_createChart, put_updateChart} from '../msw-responders/charts'
import {BaseController} from './base-controller'

export class ChartsController extends BaseController {
  get() {
    return this.db.charts.all()
  }

  async createChart(request: CreateMemexChartRequest) {
    this.server.sleep()
    return this.db.charts.create(request.chart)
  }

  async updateChart(request: UpdateMemexChartRequest) {
    this.server.sleep()
    return this.db.charts.update(request.chartNumber, request.chart)
  }

  async destroyChart(request: DeleteMemexChartRequest) {
    this.server.sleep()
    return this.db.charts.delete(request.chartNumber)
  }

  public override handlers = [
    post_createChart(async body => {
      return this.createChart(body)
    }),
    put_updateChart(async body => {
      return this.updateChart(body)
    }),
    delete_destroyChart(async body => {
      return this.destroyChart(body)
    }),
  ]
}
