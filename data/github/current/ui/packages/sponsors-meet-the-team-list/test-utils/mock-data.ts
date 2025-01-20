import type {SponsorsMeetTheTeamListProps} from '../SponsorsMeetTheTeamList'

export function getSponsorsMeetTheTeamListProps(): SponsorsMeetTheTeamListProps {
  return {
    featuredItems: [
      {
        id: '1',
        featureableId: '1',
        profileName: 'Mona Lisa',
        title: 'monalisa',
        description: '',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
      },
      {
        id: '2',
        featureableId: '2',
        profileName: 'Sponsorable User',
        title: 'sponsorable-user',
        description: '',
        avatarUrl: 'https://avatars.githubusercontent.com/u/2?v=4',
      },
    ],
  }
}
