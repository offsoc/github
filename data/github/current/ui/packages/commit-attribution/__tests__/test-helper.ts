import type {Author} from '../commit-attribution-types'

export function createAuthor(overrides: Partial<Author> = {}): Author {
  const base: Author = {
    displayName: 'Mona Lisa',
    login: 'monalisa',
    path: '/monalisa',
    avatarUrl: '/avatars/monalisa.png',
  }

  return {...base, ...overrides}
}
