export const makeIssueMetadataFields = () => ({
  Issue: () => ({
    assignees: {
      edges: [
        {
          node: {
            login: 'mona',
            name: 'Mona',
            avatarUrl: 'https://avatars.githubusercontent.com/mona?size=40',
          },
        },
        {
          node: {
            login: 'hubot',
            name: 'Hugh Bot',
            avatarUrl: 'https://avatars.githubusercontent.com/hubot?size=40',
          },
        },
      ],
    },
    labels: {
      edges: [
        {
          node: {
            color: '00A1F1',
            nameHTML: 'accessibility',
            description: 'An issue that impacts accessibility',
          },
        },
        {
          node: {
            color: '7CBB00',
            nameHTML: 'good first issue',
            description: 'Great for newcomers to pickup',
          },
        },
        {
          node: {
            color: 'FFBB00',
            nameHTML: 'Sev1',
            description: 'A severity 1 issue',
          },
        },
        {
          node: {
            color: 'F66314',
            nameHTML: 'bug',
            description: 'This issue is a bug in the code',
          },
        },
      ],
    },
    projectItemsNext: {
      edges: [
        {
          node: {
            project: {
              title: 'Backlog',
              field: {
                name: 'Iteration',
              },
            },
            fieldValueByName: {
              name: 'Current',
              color: 'BLUE',
            },
          },
        },
        {
          node: {
            project: {
              title: 'Fundamentals',
              template: true,
              viewerCanUpdate: true,
              field: {
                name: 'Status',
              },
            },
            fieldValueByName: {
              name: 'On track',
              color: 'GREEN',
            },
          },
        },
      ],
    },
    projectCards: {
      edges: [
        {
          node: {
            project: {
              title: 'Ancient project',
              name: 'Ancient project',
              closed: true,
            },
            column: {
              name: 'Completed',
            },
          },
        },
      ],
    },
    viewerCanSetMilestone: false,
    viewerCanUpdateNext: false,
    viewerCanAssign: false,
    viewerCanLabel: false,
  }),
  Milestone: () => ({
    title: 'Q1 2024',
    closed: false,
    dueOn: new Date(2024, 4, 1),
    progressPercentage: 21,
  }),
})

// A polyfill to support URL.canParse, until jsdom adds support
export function mockUrlCanParse() {
  global.URL.canParse = jest.fn(
    window.URL.canParse
      ? window.URL.canParse
      : url => {
          try {
            new window.URL(url)
            return true
          } catch {
            return false
          }
        },
  )
}
