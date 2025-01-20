import {controller, target, targets, attr} from '@github/catalyst'
import type {ClipboardCopyElement} from '@github/clipboard-copy-element'

@controller
export class CodespaceShareDialogElement extends HTMLElement {
  @attr baseUrlTemplate = ''
  @attr badgeUrl = ''
  @attr templateMode = false
  @attr skipTemplate = false
  @attr quickstartEnabled = false
  @attr devcontainerEnabled = false

  @target devcontainerDisabledButton: HTMLInputElement
  @target devcontainerDisabledButtonText: HTMLElement
  @target devcontainerPicker: HTMLElement
  @targets devcontainers: HTMLInputElement[]
  @target urlTextInput: HTMLInputElement
  @target urlClipboardButton: ClipboardCopyElement
  @target htmlTextInput: HTMLInputElement
  @target htmlClipboardButton: ClipboardCopyElement
  @target markdownTextInput: HTMLInputElement
  @target markdownClipboardButton: ClipboardCopyElement

  connectedCallback() {
    this.urlTextInput.value = this.baseUrlTemplate
    if (this.devcontainerDisabledButton) this.devcontainerDisabledButton.hidden = false
    if (this.devcontainerPicker) this.devcontainerPicker.hidden = true
    this.updateUrl()
  }

  toggleSkipTemplate(event: Event) {
    const element = event.currentTarget as HTMLInputElement
    this.skipTemplate = !element.checked
    this.updateUrl()
  }

  toggleQuickstart(event: Event) {
    const element = event.currentTarget as HTMLInputElement
    this.quickstartEnabled = element.checked
    this.updateUrl()
  }

  toggleDevcontainer(event: Event) {
    const element = event.currentTarget as HTMLInputElement
    this.devcontainerEnabled = element.checked
    if (this.devcontainerEnabled) {
      this.devcontainerDisabledButton.hidden = true
      this.devcontainerPicker.hidden = false
    } else {
      this.devcontainerDisabledButton.hidden = false
      this.devcontainerPicker.hidden = true
    }
    this.updateUrl()
  }

  updateUrl() {
    const url = new URL(this.baseUrlTemplate, window.location.origin)
    const params = new URLSearchParams(url.search.slice(1))
    if (this.templateMode && this.skipTemplate) params.append('template', 'false')
    if (this.quickstartEnabled) params.append('quickstart', '1')
    if (this.devcontainerEnabled) {
      const selectedDevcontainer = this.devcontainers.find(el => el.checked)
      if (selectedDevcontainer) {
        this.devcontainerDisabledButtonText.textContent = selectedDevcontainer.getAttribute('data-display-name')
        params.append('devcontainer_path', selectedDevcontainer.value)
      }
    }
    url.search = params.toString()
    const newUrl = url.toString()
    // This is used in text input and clipboard copy values so we need a raw string
    // eslint-disable-next-line github/unescaped-html-literal
    const htmlText = `<a href='${newUrl}'><img src='${this.badgeUrl}' alt='Open in GitHub Codespaces' style='max-width: 100%;'></a>`
    const markdownText = `[![Open in GitHub Codespaces](${this.badgeUrl})](${newUrl})`

    this.urlTextInput.value = newUrl
    this.urlClipboardButton.value = newUrl
    this.htmlTextInput.value = htmlText
    this.htmlClipboardButton.value = htmlText
    this.markdownTextInput.value = markdownText
    this.markdownClipboardButton.value = markdownText
  }
}
