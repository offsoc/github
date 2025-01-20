import {InteractionCountObserver} from './interaction-count'
import {InteractionList, type Interaction} from './interaction-list'
import {INPMetric} from './metric'

const MAX_INTERACTION_ENTRIES = 10
/*
 * The InteractionProcessor is responsible for processing PerformanceEventTiming entries and keeping track of the current INP.
 */
export class InteractionProcessor {
  interactions: InteractionList = new InteractionList(MAX_INTERACTION_ENTRIES)
  interactionCountObserver: InteractionCountObserver

  constructor() {
    this.interactionCountObserver = new InteractionCountObserver()
    this.interactionCountObserver.observe()
  }

  get inp() {
    const interaction = this.interactions.estimateP98(this.interactionCountObserver.interactionCount)

    // Pages without interactions report INP = 0
    if (!interaction) {
      return new INPMetric(0, [])
    }

    return new INPMetric(interaction.latency, interaction.entries)
  }

  teardown() {
    this.interactionCountObserver.teardown()
  }

  processEntries(entries: PerformanceEventTiming[]) {
    for (const entry of entries) {
      // This is a `event` type entry
      if (entry.interactionId) {
        this.processEntry(entry)
        continue
      }

      // see https://github.com/GoogleChrome/web-vitals/blob/7b44bea0d5ba6629c5fd34c3a09cc683077871d0/src/onINP.ts#L169-L189
      if (entry.entryType === 'first-input') {
        if (!this.interactions.findEntry(entry)) {
          this.processEntry(entry)
        }
      }
    }
  }

  processEntry(entry: PerformanceEventTiming) {
    const existingInteraction = this.interactions.get(String(entry.interactionId))

    // multiple events may be fired for the same interaction, so we'll only keep
    // the longest duration.
    if (existingInteraction) {
      return this.interactions.update(existingInteraction, entry)
    }

    const interaction: Interaction = {
      id: String(entry.interactionId),
      latency: entry.duration,
      entries: [entry],
    }

    this.interactions.add(interaction)
  }
}
