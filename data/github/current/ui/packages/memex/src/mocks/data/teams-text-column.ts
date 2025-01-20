import type {EnrichedText} from '../../client/api/columns/contracts/text'

const mockTeams = new Array<EnrichedText & {id: number}>(
  {
    id: 1,
    raw: 'Novelty Aardvarks',
    html: 'Novelty Aardvarks',
  },
  {
    id: 2,
    raw: 'Design Systems',
    html: 'Design Systems',
  },
)

export const getTeamById = (id: number): EnrichedText => {
  const team = mockTeams.find(t => t.id === id)
  if (!team) {
    throw Error(`Unable to find team with id ${id} - please check the mock data`)
  }

  return team
}
