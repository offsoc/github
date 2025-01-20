import {ready} from '@github-ui/document-ready'
import {type CacheNode, getDocumentAttributes, getTurboCacheNodes} from './utils'

const turboPageNodes: Map<string, CacheNode> = new Map()
const turboDocumentAttributes: Map<string, Attr[]> = new Map()

export const getCachedNode = () => turboPageNodes.get(document.location.href)
export const setCachedNode = (url: string, node: CacheNode) => turboPageNodes.set(url, node)
export const setDocumentAttributesCache = () =>
  turboDocumentAttributes.set(document.location.href, getDocumentAttributes())
export const getCachedAttributes = () => turboDocumentAttributes.get(document.location.href)
;(async () => {
  await ready
  setCachedNode(document.location.href, getTurboCacheNodes(document))
  setDocumentAttributesCache()
})()
