export function mockRepositoriesResolvers(itemsCount: number = 3) {
  return {
    RepositoryConnection() {
      return {
        edges: Array.from({length: itemsCount}, (_, index) => {
          return {
            node: {
              id: `${index}`,
              name: `repository ${index}`,
              nameWithOwner: `owner-${index}/repository-${index}`,
              owner: {
                avatarUrl: `https://avatars.githubusercontent.com/u/1?v=4`,
              },
            },
          }
        }),
      }
    },
  }
}
