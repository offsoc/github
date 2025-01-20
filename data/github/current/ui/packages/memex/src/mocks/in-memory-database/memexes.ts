import type {Memex} from '../../client/api/memex/contracts'
import {deepCopy} from './utils'

export class MemexesCollection {
  private memex: Memex

  constructor(memex: Memex = {id: -1, number: -1, public: false, closedAt: null, isTemplate: false}) {
    this.memex = deepCopy(memex)
  }

  public get() {
    return this.memex
  }

  public set(memex: Memex) {
    this.memex = memex
  }
}
