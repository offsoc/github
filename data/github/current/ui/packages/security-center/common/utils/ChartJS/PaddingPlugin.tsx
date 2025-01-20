export const paddingPlugin = {
  id: 'paddingBelowLegends',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeInit: (chart: any): void => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalFit = chart.legend.fit

    chart.legend.fit = function (): void {
      originalFit.bind(chart.legend)()
      this.height += 20
    }
  },
}
