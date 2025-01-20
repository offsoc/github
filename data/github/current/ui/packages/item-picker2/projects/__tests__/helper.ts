let i = 0
export function createId() {
  return (i++).toString()
}

export function resetHelperId() {
  i = 0
}

export const MockProjectV2 = (index: number) => {
  return {
    id: createId(),
    title: `selected v2 project ${index}`,
    closed: false,
    __typename: 'ProjectV2' as 'Project' | 'ProjectV2',
  }
}

export const MockClassicProject = (index: number) => {
  return {
    id: createId(),
    title: `selected classic project ${index}`,
    closed: false,
    __typename: 'Project' as 'Project' | 'ProjectV2',
  }
}

export function mockProjectsResolvers(
  repositoryProjectsV2Count: number = 2,
  repositoryClassicProjectsCount: number = 2,
  organizationProjectsV2Count: number = 2,
  organizationClassicProjectsCount: number = 2,
  selectedProjectsV2Count: number = 1,
  selectedClassicProjectsCount: number = 0,
  totalRepositoryProjectsV2Count: number = 2,
  totalOrganizationProjectsV2Count: number = 2,
) {
  return {
    Issue() {
      return {
        projectsV2: {
          nodes: Array.from({length: selectedProjectsV2Count}, (_, index) => MockProjectV2(index)),
        },
        projectCards: {
          nodes: Array.from({length: selectedClassicProjectsCount}, (_, index) => ({
            project: MockClassicProject(index),
          })),
        },
      }
    },
    Repository() {
      return {
        projects: {
          nodes: Array.from({length: repositoryClassicProjectsCount}, (_, index) => {
            return {
              id: createId(),
              title: `repository classic project ${index}`,
              closed: false,
              columns: {
                edges: [
                  {
                    node: {
                      id: createId(),
                    },
                  },
                ],
              },
            }
          }),
        },
        projectsV2: {
          nodes: Array.from({length: repositoryProjectsV2Count}, (_, index) => {
            return {
              id: createId(),
              title: `repository project v2 ${index}`,
              closed: false,
              items: {totalCount: totalRepositoryProjectsV2Count},
            }
          }),
        },

        owner: {
          projects: {
            nodes: Array.from({length: organizationClassicProjectsCount}, (_, index) => {
              return {
                id: createId(),
                title: `org classic project ${index}`,
                closed: false,
                columns: {
                  edges: [
                    {
                      node: {
                        id: createId(),
                      },
                    },
                  ],
                },
              }
            }),
          },
          projectsV2: {
            edges: Array.from({length: organizationProjectsV2Count}, (_, index) => {
              return {
                node: {
                  id: createId(),
                  title: `org project v2 ${index}`,
                  closed: false,
                  items: {totalCount: totalOrganizationProjectsV2Count},
                },
              }
            }),
          },
        },
      }
    },
  }
}
