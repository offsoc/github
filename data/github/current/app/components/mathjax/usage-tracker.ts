/**
 * UsageTracker is a thin wrapper around the Map class
 * suitable for keeping count of numerical values across
 * catlyst component instances.
 *
 * We are using this alongside the math-render-element as a static
 * way of tracking overall macro counts for a single pipeline run.
 *
 * Because this is a long-lived object, values associated with a pipeline
 * id must be cleared when the component is unmounted from the DOM.
 */
class UsageTracker {
  private usage: Map<string, number>
  constructor() {
    this.usage = new Map()
  }

  get(key: string) {
    return this.usage.get(key) ?? 0
  }

  update(key: string, value = 0) {
    const currentValue = this.get(key)
    this.usage.set(key, value + (currentValue ?? 0))
  }

  clear(key: string) {
    this.usage.delete(key)
  }

  // total provides a count of all instances of math usage across all pipeline
  // runs we've registered with the tracker.
  total() {
    return Array.from(this.usage.entries()).reduce((sum, [, time]) => {
      sum += time
      return sum
    }, 0)
  }
}

export default UsageTracker
