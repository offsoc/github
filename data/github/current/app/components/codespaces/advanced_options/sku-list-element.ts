import {attr, controller, targets} from '@github/catalyst'

@controller
class SkuListElement extends HTMLElement {
  @targets prebuildReadyHints: HTMLElement[]
  @targets prebuildInProgressHints: HTMLElement[]

  @attr prebuildAvailabilityUrl: string
  @attr repositoryId: string
  @attr location: string
  @attr refName: string
  @attr vscsTarget: string
  @attr devcontainerPath: string

  connectedCallback() {
    this.togglePrebuildAvailabilityHints()
  }

  async togglePrebuildAvailabilityHints() {
    if (
      !this.location ||
      !this.repositoryId ||
      !this.refName ||
      this.prebuildInProgressHints.length === 0 ||
      this.prebuildReadyHints.length === 0
    ) {
      return
    }

    const prebuildAvailabilities = await this.fetchPrebuildAvailability()

    if (!prebuildAvailabilities) {
      return
    }

    for (const [sku, prebuildAvailability] of Object.entries(prebuildAvailabilities)) {
      if (prebuildAvailability === 'ready') {
        const target = document.getElementById(`${sku}-prebuild-ready`)
        if (target) {
          target.hidden = false
        }
      } else if (prebuildAvailability === 'in_progress') {
        const target = document.getElementById(`${sku}-prebuild-in-progress`)
        if (target) {
          target.hidden = false
        }
      }
    }
  }

  // Returns sku name and prebuild availability
  // EX: { basicLinux32gb: 'ready', standardLinux32gb: 'ready', basicLinux: 'ready', premiumLinux32gb: 'in_progress', xLargePremiumLinux: 'in_progress'}
  async fetchPrebuildAvailability() {
    const query = new URLSearchParams({
      repository_id: this.repositoryId,
      location: this.location,
      ref_name: this.refName,
      vscs_target: this.vscsTarget,
      devcontainer_path: this.devcontainerPath,
    })

    const url = `${this.prebuildAvailabilityUrl}?${query.toString()}`
    const response = await fetch(`${url}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
      },
    })

    if (response.ok) {
      return response.json()
    } else {
      return null
    }
  }
}
