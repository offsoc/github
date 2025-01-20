import type {DirectoryItem} from '@github-ui/code-view-types'

import {splitSimplifiedTreeItem} from '../hooks/use-fetch-folder'
import type {TreeItem} from '../types/tree-item'

it('splits a simplified path item into two items', () => {
  const payloadItem = {contentType: 'directory', hasSimplifiedPath: true, name: 'foo/bar', path: 'src/foo/bar'}
  const treeItem = {items: [], data: {...payloadItem}}
  const topTreeItem = {
    items: [treeItem],
    data: {contentType: 'directory', hasSimplifiedPath: false, name: 'foo', path: 'src/foo'},
  }
  const knownFolders = new Map()
  expect(
    splitSimplifiedTreeItem(treeItem as TreeItem<DirectoryItem>, payloadItem as DirectoryItem, knownFolders),
  ).toEqual(topTreeItem)
})

it('splits a simplified path item into many items', () => {
  const payloadItem = {
    contentType: 'directory',
    hasSimplifiedPath: true,
    name: 'foo/bar/nest/test',
    path: 'src/foo/bar/nest/test',
  }
  const testTreeItem = {items: [], data: {...payloadItem, name: 'test', hasSimplifiedPath: false}}
  const nestTreeItem = {items: [testTreeItem], data: {...payloadItem, name: 'nest', path: 'src/foo/bar/nest'}}
  const barTreeItem = {items: [nestTreeItem], data: {...payloadItem, name: 'bar', path: 'src/foo/bar'}}
  const fooTreeItem = {
    items: [barTreeItem],
    data: {contentType: 'directory', hasSimplifiedPath: false, name: 'foo', path: 'src/foo'},
  }
  const knownFolders = new Map()
  splitSimplifiedTreeItem(testTreeItem as TreeItem<DirectoryItem>, payloadItem as DirectoryItem, knownFolders)
  expect(knownFolders.get('src/foo').data).toEqual(fooTreeItem.data)
  expect(knownFolders.get('src/foo/bar').data).toEqual(barTreeItem.data)
  expect(knownFolders.get('src/foo/bar/nest').data).toEqual(nestTreeItem.data)
})
