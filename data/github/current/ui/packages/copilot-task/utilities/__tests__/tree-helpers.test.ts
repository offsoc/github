import type {ReposFileTreeData} from '@github-ui/code-view-types'

import {addPathToTree} from '../tree-helpers'

const fileTreeData: ReposFileTreeData = {
  '': {
    items: [
      {
        contentType: 'directory',
        name: 'public',
        path: 'public',
      },
      {
        contentType: 'directory',
        name: 'src',
        path: 'src',
      },
      {contentType: 'file', name: 'readme.md', path: 'readme.md'},
    ],
    totalCount: 3,
  },
  public: {
    items: [
      {
        contentType: 'file',
        name: 'favicon.ico',
        path: 'public/favicon.ico',
      },
    ],
    totalCount: 1,
  },
  src: {
    items: [
      {
        contentType: 'directory',
        name: 'components',
        path: 'src/components',
      },
    ],
    totalCount: 1,
  },
  'src/components': {
    items: [
      {
        contentType: 'file',
        name: 'button.ts',
        path: 'src/components/button.ts',
      },
    ],
    totalCount: 1,
  },
}

describe('addPathToTree', () => {
  test('adds file to existing directory in correct order', () => {
    const data = {...fileTreeData}
    addPathToTree(data, 'src/index.js')
    expect(data['src']!.items.length).toBe(2)
    expect(data['src']!.totalCount).toBe(2)
    expect(data['src']!.items[1]!.name).toBe('index.js')
    expect(data['src']!.items[1]!.path).toBe('src/index.js')
  })

  test('adds file to base directory in correct order', () => {
    const data = {...fileTreeData}
    addPathToTree(data, 'index.js')
    expect(data['']!.items.length).toBe(4)
    expect(data['']!.totalCount).toBe(4)
    expect(data['']!.items[2]!.name).toBe('index.js')
    expect(data['']!.items[2]!.path).toBe('index.js')
  })

  test('adds directory to existing directory in correct', () => {
    const data = {...fileTreeData}
    addPathToTree(data, 'src/path/index.js')
    expect(data['']!.items.length).toBe(3)
    expect(data['src']!.items.length).toBe(2)
    expect(data['src']!.totalCount).toBe(2)
    expect(data['src']!.items[1]!.name).toBe('path')
    expect(data['src']!.items[1]!.name).toBe('path')
    expect(data['src']!.items[1]!.path).toBe('src/path')
  })

  test('adds directory to base directory in correct order', () => {
    const data = {...fileTreeData}
    addPathToTree(data, 'new/path/index.js')
    expect(data['']!.items.length).toBe(4)
    expect(data['']!.items[0]!.name).toBe('new')
    expect(data['']!.items[0]!.path).toBe('new')
    expect(data['new']).toBeUndefined()
    expect(data['new/path']).toBeUndefined()
  })

  test('adds full path to existing directory in correct order', () => {
    const data = {...fileTreeData}
    addPathToTree(data, 'src/components/new/button.ts', true)
    expect(data['']!.items.length).toBe(3)
    expect(data['']!.totalCount).toBe(3)
    expect(data['src/components']!.items.length).toBe(2)
    expect(data['src/components']!.totalCount).toBe(2)
    expect(data['src/components']!.items[0]!.name).toBe('new')
    expect(data['src/components']!.items[0]!.path).toBe('src/components/new')
    expect(data['src/components/new']!.items.length).toBe(1)
    expect(data['src/components/new']!.totalCount).toBe(1)
    expect(data['src/components/new']!.items[0]!.name).toBe('button.ts')
    expect(data['src/components/new']!.items[0]!.path).toBe('src/components/new/button.ts')
  })

  test('adds full path to base directory in correct order', () => {
    const data = {...fileTreeData}
    addPathToTree(data, 'path/to/new/button.ts', true)
    expect(data['']!.items.length).toBe(4)
    expect(data['']!.totalCount).toBe(4)
    expect(data['']!.items[0]!.name).toBe('path/to/new')
    expect(data['']!.items[0]!.path).toBe('path/to/new')
    expect(data['path']).toBeUndefined()
    expect(data['path/to']).toBeUndefined()
    expect(data['path/to/new']!.items.length).toBe(1)
    expect(data['path/to/new']!.totalCount).toBe(1)
    expect(data['path/to/new']!.items[0]!.name).toBe('button.ts')
    expect(data['path/to/new']!.items[0]!.path).toBe('path/to/new/button.ts')
  })
})
