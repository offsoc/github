import {attr, controller, target} from '@github/catalyst'
import type {FrameElement} from '@github/turbo'
import type MultiRepoEnablementSettingElement from './multi-repo-enablement-setting-element'

@controller
export default class MultiRepoEnablementElement extends HTMLElement {
  @attr selectedReposCount = 0
  @attr contentUrl = ''
  @target changedSettingsCountElement: HTMLElement
  @target form: HTMLFormElement
  @target selectedReposCountElement: HTMLElement
  @target showButton: HTMLButtonElement
  @target submitErrorMessage: HTMLElement
  @target submitButton: HTMLButtonElement
  @target dialogContentElement: FrameElement

  selectedReposChangedSinceLastFetch: boolean

  attributeChangedCallback(name: string): void {
    if (name === 'data-selected-repos-count') {
      this.selectedReposCountChanged()
    }
  }

  get changedSettingsCount(): number {
    let changedSettingsCount = 0
    for (const setting of this.form.querySelectorAll<MultiRepoEnablementSettingElement>(
      'multi-repo-enablement-setting',
    )) {
      if (parseInt(setting?.settingSelection?.value, 10) >= 0) {
        changedSettingsCount++
      }
    }

    return changedSettingsCount
  }

  handleSettingSelectionChange(): void {
    if (this.submitErrorMessage) {
      this.submitErrorMessage.hidden = true
    }

    if (this.changedSettingsCountElement) {
      this.changedSettingsCountElement.textContent = String(this.changedSettingsCount)
    }
  }

  reset(): void {
    this.form.reset()

    for (const setting of this.form.querySelectorAll<MultiRepoEnablementSettingElement>(
      'multi-repo-enablement-setting',
    )) {
      // If you rapidly open and close the dialog, it can produce the error:
      //   TypeError e.handleSelectionChange is not a function
      // So we're adding a guard here.
      if (typeof setting?.handleSelectionChange === 'function') {
        setting.handleSelectionChange()
      }
    }

    this.handleSettingSelectionChange()
  }

  selectedReposCountChanged(): void {
    const repositoryText = this.selectedReposCount === 1 ? 'repository' : 'repositories'

    if (this.selectedReposCountElement) {
      this.selectedReposCountElement.textContent = `${this.selectedReposCount} ${repositoryText} selected`
    }
    this.selectedReposChangedSinceLastFetch = true
  }

  showDialog(): void {
    // Force the async dialog content to reload on each open when the selected repos have changed
    if (this.selectedReposChangedSinceLastFetch) {
      this.reloadDialogContent()
      this.selectedReposChangedSinceLastFetch = false
    }
  }

  submit(evt: SubmitEvent): void {
    evt.preventDefault()
    this.submitButton.disabled = this.changedSettingsCount !== 0

    if (this.changedSettingsCount === 0) {
      this.submitErrorMessage.hidden = false
      this.submitErrorMessage.focus()
      return
    }

    this.submitButton.textContent = 'Submitting…'
    this.form.submit()
  }

  private reloadDialogContent(): void {
    const contentUrl = new URL(this.contentUrl, window.location.origin)

    if (this.form['use_query'].value === 'true') {
      contentUrl.searchParams.set('use_query', 'true')
      contentUrl.searchParams.set('query', this.form['query'].value)
    } else {
      contentUrl.searchParams.set('selected_repo_ids', this.form['selected_repo_ids'].value)
    }

    if (this.dialogContentElement) {
      this.dialogContentElement.src = contentUrl.toString()
    }
  }
}
