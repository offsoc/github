import type {Author} from './commit-attribution-types'

export function isBotOrApp(author: Author) {
  return author.path?.startsWith('/apps/') ?? false
}
