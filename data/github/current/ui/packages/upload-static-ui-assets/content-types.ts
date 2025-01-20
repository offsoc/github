import {getType} from 'mime'

export function getContentType(asset: string) {
  return getType(asset) ?? 'application/octet-stream'
}
