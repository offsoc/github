import {Factory} from 'fishery'

import type {Memex} from '../../../client/api/memex/contracts'

export const memexFactory = Factory.define<Memex>(({sequence}) => {
  const now = new Date().toISOString()
  return {
    closedAt: now,
    id: sequence,
    number: sequence,
    public: true,
    title: 'My project',
    titleHtml: 'My project with <code>code</code>',
    isTemplate: false,
  }
})

export function buildMemex() {
  return memexFactory.build()
}
