import {controller, target, targets} from '@github/catalyst'
import {remoteForm} from '@github/remote-form'
import type {IncludeFragmentElement} from '@github/include-fragment-element'
import {ModalDialogElement} from '@primer/view-components/app/components/primer/alpha/modal_dialog'
import {requestSubmit} from '@github-ui/form-utils'

@controller
export class DowngradeDialogElement extends ModalDialogElement {
  @target content: HTMLElement
  @target featuresCount: HTMLFormElement
  @targets features: HTMLSpanElement[]
  @target dialog: ModalDialogElement
  @target hiddenCloseInformation: HTMLElement
  #eventAbortController: AbortController | null = null

  get includeFragment(): IncludeFragmentElement | null {
    return this.querySelector<IncludeFragmentElement>(`[data-target~="modal-dialog.include-fragment"]`)
  }

  override connectedCallback() {
    if (!this.includeFragment) return
    const {signal} = (this.#eventAbortController = new AbortController())
    // see docs at https://github.github.io/include-fragment-element/
    this.includeFragment.addEventListener('include-fragment-replaced', this, {signal})

    this?.dialog?.addEventListener('cancel', this, {signal})

    if (this.featuresCount && this.featuresCount.id) {
      remoteForm(`#${this.featuresCount.id}`, async (form, wants) => {
        const result = await wants.json()
        const data = result.json
        for (const feature of this.features) {
          const featureName = feature.getAttribute('data-downgrade-feature')!
          this.setDowngradeFeatureCount(feature, data.counts[featureName])
        }
      })
    }
  }

  disconnectedCallback() {
    this.#eventAbortController?.abort()
  }

  handleEvent(event: Event) {
    // HTML Fragment successfully loaded
    if (event.type === 'include-fragment-replaced') {
      // updates control content with feature counts (how many repositories use wiki, drafts, protected branches, pages)
      requestSubmit(this.featuresCount)
    } else if (event.type === 'cancel') {
      // Listen to dialog close events. This can be a click outside, or the x button.
      this.hiddenCloseInformation.click()
    }
  }

  setDowngradeFeatureCount(el: Element, count: string) {
    if (count && count !== '0') {
      el.textContent = `(using ${count})`
    } else {
      el.remove()
    }
  }
}
