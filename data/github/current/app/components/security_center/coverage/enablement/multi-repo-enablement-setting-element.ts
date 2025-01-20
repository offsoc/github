import {controller, target, targets} from '@github/catalyst'
import SettingSelectionChangeEvent from './setting-selection-change-event'

const DISABLED_OPACITY = 0.6

@controller
export default class MultiRepoEnablementSettingElement extends HTMLElement {
  @target settingSelection: HTMLSelectElement
  @target settingText: HTMLElement
  @target auxBox: HTMLElement
  @target disclosureHeader: HTMLElement
  @target disclosureHeaderText: HTMLElement
  @target disclosureIcon: HTMLElement
  @target disclosureContent: HTMLElement
  @target disclosureValue: HTMLInputElement
  @targets disclosureInputs: HTMLInputElement[]

  // Normally, `@targets` is used to target descendants.
  // However, `@targets` doesn't work when targeting descendants of the same type as this class
  // (reason: `closest` matches itself in this case - https://github.com/github/catalyst/blob/dc284dcf4f82329a9cac5c867462a8fa529b6c40/src/findtarget.ts).
  //
  // Since `childrenSettings` are other instances of this class, we can instead use a custom getter.
  get childrenSettings(): MultiRepoEnablementSettingElement[] {
    const tag = this.tagName.toLowerCase()
    const children: MultiRepoEnablementSettingElement[] = []

    for (const child of this.querySelectorAll<MultiRepoEnablementSettingElement>(
      `[data-targets~="${tag}.childrenSettings"]`,
    )) {
      if (child.parentElement === null) continue
      if (child.parentElement.closest(tag) === this) children.push(child)
    }

    return children
  }

  disable(): void {
    this.settingText.setAttribute('style', `opacity: ${DISABLED_OPACITY};`)
    this.settingSelection.disabled = true
    this.settingSelection.value = '-1'
    this.handleSelectionChange()

    for (const childSetting of this.childrenSettings) {
      childSetting.disable()
    }
  }

  enable(): void {
    this.settingText.setAttribute('style', '')
    this.settingSelection.disabled = false

    for (const childSetting of this.childrenSettings) {
      childSetting.enable()
    }
  }

  handleSelectionChange(): void {
    const selectedValue = parseInt(this.settingSelection.value, 10)

    for (const childSetting of this.childrenSettings) {
      if (selectedValue === 0) {
        childSetting.disable()
      } else {
        childSetting.enable()
      }
    }

    if (this.auxBox) {
      if (selectedValue === 1) {
        this.auxBox.setAttribute('style', 'display: block;')
        this.handleDisclosureInputChange()
      } else {
        this.auxBox.setAttribute('style', 'display: none;')
        this.disclosureValue.removeAttribute('value')
      }
    }

    this.dispatchEvent(new SettingSelectionChangeEvent())
  }

  toggleDisclosure(): void {
    if (!this.disclosureContent) return

    const expanded = this.disclosureContent.getAttribute('style') !== 'display: none;'
    if (!expanded) {
      this.disclosureHeader.setAttribute('aria-expanded', 'true')
      this.disclosureContent.setAttribute('style', 'display: block;')
      this.disclosureIcon.style.transform = 'scaleY(-1)'
    } else {
      this.disclosureHeader.setAttribute('aria-expanded', 'false')
      this.disclosureContent.setAttribute('style', 'display: none;')
      this.disclosureIcon.style.transform = ''
    }
  }

  handleDisclosureInputChange(): void {
    if (this.disclosureValue && this.disclosureInputs.length > 0) {
      const selectedInput = this.disclosureInputs.find(input => input.checked)
      const value = selectedInput?.value
      this.updateDisclosureText(selectedInput)
      if (value != null) {
        this.disclosureValue.setAttribute('value', value)
      } else {
        this.disclosureValue.removeAttribute('value')
      }
    }
  }

  updateDisclosureText(selectedInput: HTMLInputElement | null | undefined): void {
    if (this.disclosureHeaderText && selectedInput) {
      const textContent = document.querySelector(`label[for=${selectedInput.id}`)?.textContent
      this.disclosureHeaderText.textContent = textContent?.replace(' Recommended', '') || ''
    }
  }
}
