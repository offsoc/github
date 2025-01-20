import {controller, target, targets, attr} from '@github/catalyst'
import type {ModalDialogElement} from '@primer/view-components/app/components/primer/alpha/modal_dialog'

@controller
class CoverageSettingsElement extends HTMLElement {
  // This custom element can be rendered using `<coverage-settings hidden data-show-when-ready>` to avoid
  // element pop-in/changes between being attached to the DOM and `connectedCallback` running.
  @attr showWhenReady = false

  @target parentFeatureCheckbox: HTMLInputElement
  @target subFeatureOneCheckbox: HTMLInputElement
  @target subFeatureTwoCheckbox: HTMLInputElement
  @target subFeatureTwoChildCheckbox: HTMLInputElement

  @target parentFeatureEnabled: HTMLInputElement
  @target subFeatureOneEnabled: HTMLInputElement
  @target subFeatureTwoEnabled: HTMLInputElement
  @target subFeatureTwoChildEnabled: HTMLInputElement

  @target parentFeatureTitle: HTMLElement
  @target subFeatureOneTitle: HTMLElement
  @target subFeatureTwoTitle: HTMLElement
  @target subFeatureTwoChildTitle: HTMLInputElement

  @target parentFeatureModified: HTMLElement
  @target subFeatureOneModified: HTMLElement
  @target subFeatureTwoModified: HTMLElement
  @target subFeatureTwoChildModified: HTMLInputElement

  // Disclosure elements are part of an additional dropdown radio button setting
  // that is shown only when the associated feature is enabled
  @target subFeatureOneAuxBox: HTMLElement
  @target subFeatureOneDisclosureIcon: HTMLElement
  @target subFeatureOneDisclosureHeader: HTMLElement
  @target subFeatureOneDisclosureHeaderText: HTMLElement
  @target subFeatureOneDisclosureContent: HTMLElement
  @targets subFeatureOneDisclosureInputs: HTMLInputElement[]
  @target subFeatureOneDisclosureValue: HTMLInputElement

  connectedCallback() {
    try {
      this.resetStates()
    } finally {
      if (this.showWhenReady) {
        this.removeAttribute('hidden')
      }
    }
  }

  resetStates() {
    if (this.parentFeatureCheckbox) {
      this.parentFeatureCheckbox.checked = this.parentFeatureCheckbox.getAttribute('feature-enabled') === 'true'
    }

    if (this.subFeatureOneCheckbox) {
      this.subFeatureOneCheckbox.checked = this.subFeatureOneCheckbox.getAttribute('feature-enabled') === 'true'
    }

    if (this.subFeatureTwoCheckbox) {
      this.subFeatureTwoCheckbox.checked = this.subFeatureTwoCheckbox.getAttribute('feature-enabled') === 'true'
    }

    if (this.subFeatureTwoChildCheckbox) {
      this.subFeatureTwoChildCheckbox.checked =
        this.subFeatureTwoChildCheckbox.getAttribute('feature-enabled') === 'true'
    }

    this.toggleParentFeature()
  }

  toggleParentFeature() {
    this.updateParentFeature()
    this.toggleSubFeatureOne()
    this.toggleSubFeatureTwo()
    this.toggleSubFeatureOneDisclosure()
  }

  toggleSubFeatureOne() {
    // do nothing if subfeature UI is hidden
    if (!this.subFeatureOneCheckbox) return

    this.updateSubFeature(
      this.parentFeatureCheckbox,
      this.subFeatureOneEnabled,
      this.subFeatureOneCheckbox,
      this.subFeatureOneTitle,
      this.subFeatureOneModified,
      this.subFeatureOneAuxBox,
      this.subFeatureOneDisclosureHeaderText,
      this.subFeatureOneDisclosureInputs,
      this.subFeatureOneDisclosureValue,
    )
  }

  toggleSubFeatureOneDisclosure() {
    if (!this.subFeatureOneCheckbox) return
    if (!this.subFeatureOneDisclosureContent) return

    const expanded = this.subFeatureOneDisclosureContent.getAttribute('style') !== 'display: none;'
    if (!expanded) {
      this.subFeatureOneDisclosureHeader.setAttribute('aria-expanded', 'true')
      this.subFeatureOneDisclosureContent.setAttribute('style', 'display: block;')
      this.subFeatureOneDisclosureIcon.style.transform = 'scaleY(-1)'
    } else {
      this.subFeatureOneDisclosureHeader.setAttribute('aria-expanded', 'false')
      this.subFeatureOneDisclosureContent.setAttribute('style', 'display: none;')
      this.subFeatureOneDisclosureIcon.style.transform = ''
    }
  }

  toggleSubFeatureTwo() {
    // do nothing if subfeature UI is hidden
    if (!this.subFeatureTwoCheckbox) return

    this.updateSubFeature(
      this.parentFeatureCheckbox,
      this.subFeatureTwoEnabled,
      this.subFeatureTwoCheckbox,
      this.subFeatureTwoTitle,
      this.subFeatureTwoModified,
    )

    this.toggleSubFeatureTwoChild()
  }

  toggleSubFeatureTwoChild() {
    // do nothing if subfeature UI is hidden
    if (!this.subFeatureTwoChildCheckbox) return

    this.updateSubFeature(
      this.subFeatureTwoCheckbox,
      this.subFeatureTwoChildEnabled,
      this.subFeatureTwoChildCheckbox,
      this.subFeatureTwoChildTitle,
      this.subFeatureTwoChildModified,
    )
  }

  updateParentFeature() {
    if (!this.parentFeatureCheckbox) return

    const settingDisabled = this.parentFeatureCheckbox.getAttribute('setting-disabled') === 'true'
    if (settingDisabled) {
      this.parentFeatureCheckbox.setAttribute('disabled', 'true')
      this.parentFeatureTitle.setAttribute('style', 'opacity: 0.6;')
    }

    const featureEnabled = this.parentFeatureCheckbox.checked ? '1' : '0'
    this.parentFeatureEnabled.setAttribute('value', featureEnabled)

    this.toggleModifiedLabel(this.featureHasBeenModified(this.parentFeatureCheckbox), this.parentFeatureModified)
  }

  updateSubFeature(
    parentFeatureCheckbox: HTMLInputElement,
    featureEnabledInput: HTMLInputElement,
    featureCheckbox: HTMLInputElement,
    featureTitle: HTMLElement,
    featureModifiedLabel: HTMLElement,
    featureAuxBox?: HTMLElement,
    featureDisclosureHeaderText?: HTMLElement,
    featureDisclosureInputs?: HTMLInputElement[],
    featureDisclosureValue?: HTMLInputElement,
  ) {
    const settingDisabled = featureCheckbox.getAttribute('setting-disabled') === 'true'
    const parentChecked = !parentFeatureCheckbox || parentFeatureCheckbox.checked

    if (parentChecked && !settingDisabled) {
      featureCheckbox.removeAttribute('disabled')
      featureTitle.setAttribute('style', '')
    } else {
      featureCheckbox.setAttribute('disabled', 'true')
      featureTitle.setAttribute('style', 'opacity: 0.6;')
      if (!settingDisabled) {
        featureCheckbox.checked = false
      }
    }

    const featureEnabled = featureCheckbox.checked ? '1' : '0'
    featureEnabledInput.setAttribute('value', featureEnabled)

    if (featureAuxBox) {
      if (featureEnabled === '1') {
        featureAuxBox.setAttribute('style', 'display: block;')
      } else {
        featureAuxBox.setAttribute('style', 'display: none;')
      }
    }

    let disclosureModified = false
    if (featureDisclosureInputs && featureDisclosureInputs.length > 0 && featureDisclosureValue) {
      const selectedInput = featureDisclosureInputs.find(input => input.checked)
      if (selectedInput && featureCheckbox.checked) {
        disclosureModified = selectedInput.value !== featureDisclosureValue.getAttribute('data-initial-value')
        featureDisclosureValue.setAttribute('value', selectedInput.value)
        if (featureDisclosureHeaderText) {
          const textContent = document.querySelector(`label[for=${selectedInput.id}`)?.textContent
          featureDisclosureHeaderText.textContent = textContent?.replace(' Recommended', '') || ''
        }
      } else {
        featureDisclosureValue.removeAttribute('value')
      }

      for (const input of featureDisclosureInputs) {
        if (settingDisabled || !featureCheckbox.checked) {
          input.setAttribute('disabled', 'true')
        } else {
          input.removeAttribute('disabled')
        }
      }
    }

    const featureModified = this.featureHasBeenModified(featureCheckbox)
    this.toggleModifiedLabel(featureModified || disclosureModified, featureModifiedLabel)
  }

  toggleModifiedLabel(modified: boolean, labelElement: HTMLElement) {
    if (!labelElement) return

    if (modified) {
      if (labelElement.getAttribute('hidden') === 'hidden') {
        this.dispatchEvent(new CustomEvent('increment'))
      }

      labelElement.removeAttribute('hidden')
    } else {
      if (labelElement.getAttribute('hidden') !== 'hidden') {
        this.dispatchEvent(new CustomEvent('decrement'))
      }

      labelElement.setAttribute('hidden', 'hidden')
    }
  }

  featureHasBeenModified(element: HTMLInputElement): boolean {
    return (element.getAttribute('feature-enabled') === 'true') !== element.checked
  }
}

@controller
class EnablementDialogElement extends HTMLElement {
  @target dialog: ModalDialogElement
  @targets coverageSettings: CoverageSettingsElement[]

  @target counter: HTMLElement

  resetStates() {
    for (const coverageSetting of this.coverageSettings) {
      coverageSetting.resetStates()
    }
  }

  incrementCounter() {
    if (this.counter) {
      const incrCount: number = +(this.counter.textContent || 0) + 1
      const incrCountStr: string = incrCount.toString()
      let ariaLabelStr: string = incrCountStr.concat(' features modified')
      if (incrCount === 1) {
        ariaLabelStr = incrCountStr.concat(' feature modified')
      }

      this.counter.textContent = incrCountStr
      this.counter.setAttribute('aria-label', ariaLabelStr)
    }
  }

  decrementCounter() {
    if (this.counter) {
      const decrCount: number = +(this.counter.textContent || 0) - 1
      const decrCountStr: string = decrCount.toString()
      let ariaLabelStr: string = decrCountStr.concat(' features modified')
      if (decrCount === 1) {
        ariaLabelStr = decrCountStr.concat(' feature modified')
      }

      this.counter.textContent = decrCountStr
      this.counter.setAttribute('aria-label', ariaLabelStr)
    }
  }
}
