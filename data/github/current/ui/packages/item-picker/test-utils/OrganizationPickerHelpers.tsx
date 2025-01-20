import type {OrganizationPickerOrganization$data} from '../components/__generated__/OrganizationPickerOrganization.graphql'

export function buildOrganization({id, name}: {id: string; name: string}): OrganizationPickerOrganization$data {
  return {
    avatarUrl: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
    id,
    name,
    ' $fragmentType': 'OrganizationPickerOrganization',
  }
}
