import type {CreateMemexChartRequest, MemexChart, UpdateMemexChartRequest} from '../../client/api/charts/contracts/api'

let lastNumber = 0
export class ChartsCollection {
  #map = new Map<number, MemexChart>()

  constructor(charts: Array<MemexChart> = []) {
    for (const chart of charts) {
      this.#map.set(chart.number, chart)
      lastNumber = Math.max(lastNumber, chart.number)
    }
  }

  public all(): Array<MemexChart> {
    return Array.from(this.#map.values())
  }

  public byNumber(chartNumber: number): MemexChart | undefined {
    return this.#map.get(chartNumber)
  }

  public create(chart: CreateMemexChartRequest['chart']) {
    const number = ++lastNumber
    const newChart = {...chart, number, name: chart.name || `Chart: ${number}`}
    this.#map.set(newChart.number, newChart)
    return {chart: newChart}
  }

  public update(chartNumber: number, chart: UpdateMemexChartRequest['chart']) {
    const existingChart = this.byNumber(chartNumber)
    if (!existingChart) {
      throw new Error(`No chart exists for chartNumber: ${chartNumber}`)
    }
    const updatedChart: MemexChart = {
      ...existingChart,
      ...chart,
    }
    this.#map.set(chartNumber, updatedChart)
    return {chart: updatedChart}
  }

  public delete(chartNumber: number) {
    this.#map.delete(chartNumber)
  }
}
