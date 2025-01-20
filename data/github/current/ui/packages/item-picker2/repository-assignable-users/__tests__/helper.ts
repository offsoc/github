export const MockUser = (index: number) => {
  return {
    id: `assignable-user-${index}`,
    name: `assignable user ${index}`,
    login: `assignable-user-${index}`,
    avatarUrl: `https://avatars.githubusercontent.com/u/${index + 1}?size=64`,
  }
}

export const mockRepositoryAssignableUsersResolvers = (itemsCount: number = 4, selectedCount: number = 1) => ({
  Repository() {
    return {
      assignableUsers: {
        // used in root to find pre-selected assignees
        nodes: Array.from({length: selectedCount}, (_, index) => MockUser(index)),
        // used for lazyloaded assignable users
        edges: Array.from({length: itemsCount}, (_, index) => MockUser(index)).map(node => ({
          node,
        })),
      },
    }
  },
})
