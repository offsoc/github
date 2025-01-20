import {controller, target} from '@github/catalyst'
import type {ModalDialogElement} from '@primer/view-components/app/components/primer/alpha/modal_dialog'

@controller
class CreateRepoFromSelectorElement extends HTMLElement {
  @target refName: HTMLInputElement
  @target checkTagNameExistsPathCsrf: HTMLInputElement
  creating = false

  async createBranch(event: Event) {
    event.preventDefault()

    if ((await this.tagExistsMessage()) && this.warnDialog) {
      this.setUpDialog()
      if (this.warnDialog instanceof HTMLDialogElement) {
        this.warnDialog.showModal()
      } else {
        this.warnDialog.show()
      }
      return
    }

    if (!this.creating) {
      this.creating = true
      this.submitCreateBranch()
    }
  }

  async tagExistsMessage() {
    try {
      const checkTagNameExistsPath = this.getAttribute('check-tag-name-exists-path')!
      const formData = new FormData()
      formData.append('value', this.refName.value)

      formData.append(
        // eslint-disable-next-line github/authenticity-token
        'authenticity_token',
        this.checkTagNameExistsPathCsrf.value,
      )
      const response = await fetch(checkTagNameExistsPath, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        return false
      }
      return await response.text()
    } catch {
      // Don't want to block users from creating branches if something goes wrong
      return false
    }
  }

  submitCreateBranch() {
    const form = this.querySelector('form')
    form?.submit()
  }

  private get warnDialog(): ModalDialogElement | HTMLDialogElement {
    return document.querySelector<ModalDialogElement | HTMLDialogElement>('#warn-tag-match-create-branch-dialog')!
  }

  private setUpDialog() {
    const warnDialog = this.warnDialog
    warnDialog.addEventListener('close', () => this.handleDialogClose())
    warnDialog.addEventListener('cancel', () => this.handleDialogCancel())
  }

  private removeDialogEventListeners() {
    const warnDialog = this.warnDialog
    warnDialog.removeEventListener('close', () => this.handleDialogClose())
    warnDialog.removeEventListener('cancel', () => this.handleDialogCancel())
  }

  private handleDialogCancel() {
    this.removeDialogEventListeners()
  }

  private handleDialogClose() {
    this.submitCreateBranch()
    this.removeDialogEventListeners()
  }
}
