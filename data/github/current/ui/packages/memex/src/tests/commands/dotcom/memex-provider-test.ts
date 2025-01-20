import type {Query} from '@github-ui/command-palette'

import {createCommandTree} from '../../../client/commands/command-tree'
import {MemexCommandItem} from '../../../client/commands/dotcom/memex-command-item'
import {MemexProvider} from '../../../client/commands/dotcom/memex-provider'

const commandTree = createCommandTree('root', [
  ['a', 'Top-level Command A', 'column.hide', jest.fn()],
  [
    'b',
    'Top-level Command B',
    [
      ['1', 'Nested Command B-1', 'column.hide', jest.fn()],
      ['2', 'Nested Command B-2', 'column.hide', jest.fn()],
    ],
  ],
])

function mockQuery(mode: string, text = '', type = 'memex_project'): Query {
  return {
    mode,
    text,
    path: '',
    scope: {
      text: '',
      type,
      id: 'memex-project-1',
    },
    params: jest.fn(),
    isBlank: jest.fn().mockReturnValue(false),
    hasScope: jest.fn().mockReturnValue(true),
    immutableCopy: jest.fn(),
  }
}

describe('MemexProvider', () => {
  it('sets id, hasCommands, and debounce', () => {
    const memexProvider = new MemexProvider(commandTree)
    expect(memexProvider.id).toBe('memex-provider')
    expect(memexProvider.hasCommands).toBe(true)
    expect(memexProvider.debounce).toBe(0)
  })

  it('builds commandItems from the commandTree', () => {
    const memexProvider = new MemexProvider(commandTree)
    const commandItems = memexProvider.commandItems

    expect(commandItems.length).toEqual(2)
    expect(commandItems[0]).toBeInstanceOf(MemexCommandItem)
    expect(commandItems[0].title).toEqual('Top-level Command A')
    expect(commandItems[1].title).toEqual('Top-level Command B')

    const nestedCommandItems = commandItems[1].commandItems
    expect(nestedCommandItems.length).toEqual(2)
    expect(nestedCommandItems[0]).toBeInstanceOf(MemexCommandItem)
    expect(nestedCommandItems[0].title).toEqual('Nested Command B-1')
    expect(nestedCommandItems[1].title).toEqual('Nested Command B-2')
  })

  describe('enabledFor', () => {
    describe('when in a memex_project scope type', () => {
      it('returns true when in commands mode', () => {
        const memexProvider = new MemexProvider(commandTree)
        expect(memexProvider.enabledFor(mockQuery('>'))).toBe(true)
      })

      it('returns true when not in commands mode', () => {
        const memexProvider = new MemexProvider(commandTree)
        expect(memexProvider.enabledFor(mockQuery(''))).toBe(true)
      })
    })

    it('returns false when in commands mode', () => {
      const memexProvider = new MemexProvider(commandTree)
      expect(memexProvider.enabledFor(mockQuery('>', '', 'project'))).toBe(false)
    })

    it('returns false when not in commands mode', () => {
      const memexProvider = new MemexProvider(commandTree)
      expect(memexProvider.enabledFor(mockQuery('', '', 'project'))).toBe(false)
    })
  })

  describe('fetch', () => {
    it('command mode query returns top level commandItems', async () => {
      const memexProvider = new MemexProvider(commandTree)

      const data = await memexProvider.fetch(mockQuery('>'), false)
      expect(data.results).toEqual(memexProvider.commandItems)
    })

    it('empty query returns top level commandItems', async () => {
      const memexProvider = new MemexProvider(commandTree)

      const data = await memexProvider.fetch(mockQuery(''), false)
      expect(data.results).toEqual(memexProvider.commandItems)
    })

    it('specified query returns leaf level commandItems', async () => {
      const memexProvider = new MemexProvider(commandTree)

      const data = await memexProvider.fetch(mockQuery('', 'Nested'), false)
      expect(data.results.length).toEqual(2)
    })

    it('specified query returns matching commandItems including leaf level commands', async () => {
      const memexProvider = new MemexProvider(commandTree)

      const data = await memexProvider.fetch(mockQuery('', 'Command B'), false)
      expect(data.results.length).toEqual(3)
    })
  })
})
