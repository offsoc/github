import {CollaboratorRole} from '../../client/api/common-contracts'

export class OrganizationAccessCollection {
  #organizationAccessRole: CollaboratorRole = CollaboratorRole.Reader

  get() {
    return this.#organizationAccessRole
  }

  update(organizationAccessRole: CollaboratorRole) {
    this.#organizationAccessRole = organizationAccessRole
  }
}
