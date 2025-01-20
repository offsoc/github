import {ActorBypassMode, type BypassActor} from '../bypass-actors-types'

export const ORGANIZATION_ADMIN_ROLE: BypassActor = {
  actorId: 1,
  actorType: 'OrganizationAdmin',
  name: 'Organization admin',
  _dirty: true,
  _enabled: true,
  bypassMode: ActorBypassMode.ALWAYS,
}

export const DEPLOY_KEY_BYPASS_ACTOR: BypassActor = {
  actorId: null,
  actorType: 'DeployKey',
  name: 'Deploy keys',
  _dirty: true,
  _enabled: true,
  bypassMode: ActorBypassMode.ALWAYS,
}

export const LOCKED_BYPASS_MODE_ACTOR_TYPES = ['DeployKey']
