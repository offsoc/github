import {controller} from '@github/catalyst'

@controller
export class TeamSyncOktaConfigFormElement extends HTMLElement {
  // rails puts the data-target on the label and the input so we have to attach to the input ourselves
  editOrCancelClicked() {
    document
      .querySelector('input[data-target*="team-sync-okta-config-form.sswsTokenInput"]')
      ?.toggleAttribute('disabled')
  }
}
