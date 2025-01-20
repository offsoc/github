import {
  type ActorType,
  type Collaborator,
  type Role,
  rolesMap,
  type Team,
  type User,
} from '../../client/api/common-contracts'
import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'
import {actorIdentifier} from '../../client/queries/organization-access'

export class CollaboratorsCollection {
  private map: Map<string, Collaborator>

  constructor(collaborators: Array<Collaborator> = []) {
    this.map = new Map()
    for (const collaborator of collaborators) {
      this.map.set(actorIdentifier(collaborator), collaborator)
    }
  }

  public all() {
    return this.map
  }

  public addUser(collab: User, role: Role) {
    this.map.set(`user/${collab.id}`, {
      ...collab,
      actor_type: 'user',
      role: not_typesafe_nonNullAssertion(rolesMap.get(role)),
    })
  }

  public addTeam(collab: Team, role: Role, membersCount: number) {
    this.map.set(`team/${collab.id}`, {
      ...collab,
      actor_type: 'team',
      role: not_typesafe_nonNullAssertion(rolesMap.get(role)),
      membersCount,
    })
  }

  public remove(collab: User | Team, actor_type: ActorType) {
    return this.map.delete(`${actor_type}/${collab.id}`)
  }

  public has(collab: User | Team, actor_type: ActorType) {
    return this.map.has(`${actor_type}/${collab.id}`)
  }
}
