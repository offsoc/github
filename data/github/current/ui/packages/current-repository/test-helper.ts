import type {Repository} from './CurrentRepository'

export function createRepository(overrides: Partial<Repository> = {}): Repository {
  const base: Repository = {
    id: 1,
    name: 'smile',
    ownerLogin: 'monalisa',
    defaultBranch: 'main',
    createdAt: '1/1/2022',
    currentUserCanPush: true,
    ownerAvatar: 'monalisa.png',
    public: false,
    private: true,
    isFork: false,
    isEmpty: false,
    isOrgOwned: false,
  }

  return {...base, ...overrides}
}
