import type {PostStatsRequest} from '../../client/api/stats/contracts'

type StatsPayload = PostStatsRequest['payload']
export class StatsCollection {
  #stats: Array<StatsPayload> = []

  /**
   * Add a stats payload to the collection.
   */
  public add(stats: StatsPayload): void {
    this.#stats.push(stats)
  }

  /**
   *
   * @returns A read-only copy of the stats payloads
   */
  public all(): DeepReadonly<Array<StatsPayload>> {
    return this.#stats
  }

  /**
   * @returns The number of stats payloads in the collection
   */
  public get count(): number {
    return this.all().length
  }

  /**
   *
   * @returns The last stats payload in the collection
   */
  public get last(): Readonly<StatsPayload> | undefined {
    return this.all()[this.#stats.length - 1]
  }

  /**
   * Reset the stats collection
   */
  public reset(): void {
    this.#stats = []
  }
}
