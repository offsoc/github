import {type CommandPalette, StaticItemsPage} from '@github-ui/command-palette'

import {createCommand, createCommandTree} from '../../../client/commands/command-tree'
import {MemexCommandItem} from '../../../client/commands/dotcom/memex-command-item'

const command = createCommand('Single-step command', 'column.hide', jest.fn())
const commandTree = createCommandTree('m', [
  ['1', 'Nested Command 1', 'column.hide', jest.fn()],
  [
    '2',
    'Nested Command 2',
    [
      ['1', 'Nested Command 2.1', 'column.hide', jest.fn()],
      ['2', 'Nested Command 2.2', 'column.hide', jest.fn()],
    ],
  ],
])

const autocompleteFn = jest.fn()
const dismissFn = jest.fn()
const pushPageFn = jest.fn()

const commandPalette: CommandPalette = {
  autocomplete: autocompleteFn,
  dismiss: dismissFn,
  registerProvider: jest.fn(),
  pushPage: pushPageFn,
  clearCommands: jest.fn(),
}

describe('MemexCommandItem', () => {
  beforeEach(() => {
    autocompleteFn.mockClear()
    dismissFn.mockClear()
    pushPageFn.mockClear()
  })

  it('sets title, priority, group, hint, memexKey, and memexItem', () => {
    const memexCommandItem = new MemexCommandItem('Command name', 'c', command)
    expect(memexCommandItem.title).toEqual('Command name')
    expect(memexCommandItem.priority).toEqual(1)
    expect(memexCommandItem.group).toEqual('commands')
    expect(memexCommandItem.hint).toEqual('Run command')
    expect(memexCommandItem.memexKey).toEqual('c')
    expect(memexCommandItem.memexItem).toEqual(command)
  })

  it('sets path to undefined', () => {
    const memexCommandItem = new MemexCommandItem('Command name', 'c', command)
    expect(memexCommandItem.path).toBe(undefined)
  })

  it('does not build commandItems when the memexItem is a command', () => {
    const memexCommandItem = new MemexCommandItem('Command name', 'c', command)
    expect(memexCommandItem.commandItems).toEqual([])
  })

  it('builds commandItems when the memexItem is a commandTree', () => {
    const memexCommandItem = new MemexCommandItem('Command name', 'c', commandTree)
    const commandItems = memexCommandItem.commandItems

    expect(commandItems.length).toEqual(2)
    expect(commandItems[0]).toBeInstanceOf(MemexCommandItem)
    expect(commandItems[0].title).toEqual('Nested Command 1')
    expect(commandItems[1].title).toEqual('Nested Command 2')

    const nestedCommandItems = commandItems[1].commandItems
    expect(nestedCommandItems.length).toEqual(2)
    expect(nestedCommandItems[0]).toBeInstanceOf(MemexCommandItem)
    expect(nestedCommandItems[0].title).toEqual('Nested Command 2.1')
    expect(nestedCommandItems[1].title).toEqual('Nested Command 2.2')
  })

  describe('activate', () => {
    describe('when the memexItem is a CommandTree', () => {
      it('pushes a StaticItemsPage onto the command palette with the command items', () => {
        const memexCommandItem = new MemexCommandItem('Command name', 'c', commandTree)
        const staticItemsPage = new StaticItemsPage('Command name', `memex-items-page-c`, memexCommandItem.commandItems)

        memexCommandItem.activate(commandPalette)
        expect(pushPageFn).toHaveBeenCalledWith(staticItemsPage)
      })
    })

    describe('when the memexItem is a Command', () => {
      it('runs the memexItem effect and dismisses the command palette', () => {
        const memexCommandItem = new MemexCommandItem('Command name', 'c', command)

        memexCommandItem.activate(commandPalette)
        expect(command.effect).toHaveBeenCalled()
        expect(dismissFn).toHaveBeenCalled()
      })
    })
  })

  describe('copy', () => {
    it('returns undefined', () => {
      const memexCommandItem = new MemexCommandItem('Command name', 'c', command)
      expect(memexCommandItem.copy(commandPalette)).toBe(undefined)
    })
  })

  describe('select', () => {
    describe('when the memexItem is a CommandTree', () => {
      it('pushes a StaticItemsPage onto the command palette with the command items', () => {
        const memexCommandItem = new MemexCommandItem('Command name', 'c', commandTree)
        const staticItemsPage = new StaticItemsPage('Command name', `memex-items-page-c`, memexCommandItem.commandItems)

        memexCommandItem.select(commandPalette)
        expect(pushPageFn).toHaveBeenCalledWith(staticItemsPage)
      })
    })

    describe('when the memexItem is a Command', () => {
      it('calls autocomplete on the command palette', () => {
        const memexCommandItem = new MemexCommandItem('Command name', 'c', command)

        memexCommandItem.select(commandPalette)
        expect(autocompleteFn).toHaveBeenCalledWith(memexCommandItem)
      })
    })
  })
})
