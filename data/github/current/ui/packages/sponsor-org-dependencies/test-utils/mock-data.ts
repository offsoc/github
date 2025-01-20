import type {SponsorOrgDependenciesProps} from '../SponsorOrgDependencies'

export function getSponsorOrgDependenciesProps(pageSize: number = 10): SponsorOrgDependenciesProps {
  return {
    pageSize,
    orgName: 'org-name',
    viewerPrimaryEmail: 'monalisa@github.com',
    sponsorableDependencies: [
      {
        id: 1,
        sponsorableName: 'maintainer-1',
        dependenciesArray: [
          {
            name: 'dependency-1',
            fullRepoName: 'org-name/dependency-1',
          },
        ],
        dependencyCount: 1,
        sponsorableAvatarUrl: 'https://avatars.githubusercontent.com/u/2',
        sponsorableIsOrg: true,
        recentActivity: 'July 24, 2024',
        viewerIsSponsor: true,
      },
      {
        id: 2,
        sponsorableName: 'maintainer-2',
        dependenciesArray: [
          {
            name: 'dependency-2',
            fullRepoName: 'org-name/dependency-2',
          },
          {
            name: 'dependency-3',
            fullRepoName: 'org-name/dependency-3',
          },
        ],
        dependencyCount: 2,
        sponsorableAvatarUrl: 'https://avatars.githubusercontent.com/u/1',
        sponsorableIsOrg: false,
        recentActivity: 'July 23, 2024',
        viewerIsSponsor: false,
      },
      {
        id: 3,
        sponsorableName: 'maintainer-3',
        dependenciesArray: [
          {
            name: 'dependency-4',
            fullRepoName: 'org-name/dependency-4',
          },
          {
            name: 'dependency-5',
            fullRepoName: 'org-name/dependency-5',
          },
          {
            name: 'dependency-6',
            fullRepoName: 'org-name/dependency-6',
          },
          {
            name: 'dependency-7',
            fullRepoName: 'org-name/dependency-7',
          },
          {
            name: 'dependency-8',
            fullRepoName: 'org-name/dependency-8',
          },
          {
            name: 'dependency-9',
            fullRepoName: 'org-name/dependency-9',
          },
        ],
        dependencyCount: 6,
        sponsorableAvatarUrl: 'https://avatars.githubusercontent.com/u/3',
        sponsorableIsOrg: false,
        recentActivity: null,
        viewerIsSponsor: false,
      },
    ],
  }
}

export function getSponsorOrgDependenciesSearchProps(pageSize: number = 10): SponsorOrgDependenciesProps {
  return {
    pageSize,
    orgName: 'org-name',
    viewerPrimaryEmail: 'monalisa@github.com',
    sponsorableDependencies: [
      {
        id: 1,
        sponsorableName: 'monalisa',
        dependenciesArray: [
          {
            name: 'brew',
            fullRepoName: 'org-name/dependency-1',
          },
        ],
        dependencyCount: 1,
        sponsorableAvatarUrl: 'https://avatars.githubusercontent.com/u/2',
        sponsorableIsOrg: true,
        recentActivity: 'July 24, 2024',
        viewerIsSponsor: false,
      },
      {
        id: 2,
        sponsorableName: 'maintainer-2',
        dependenciesArray: [
          {
            name: 'mona',
            fullRepoName: 'org-name/mona',
          },
          {
            name: 'dependency-1',
            fullRepoName: 'org-name/dependency-1',
          },
        ],
        dependencyCount: 2,
        sponsorableAvatarUrl: 'https://avatars.githubusercontent.com/u/1',
        sponsorableIsOrg: false,
        recentActivity: 'July 23, 2024',
        viewerIsSponsor: false,
      },
    ],
  }
}
