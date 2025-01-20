import {
  performTasklistBlockOperation,
  type AppendItemMDPayload,
  type ConvertToIssueMDPayload,
  type RemoveItemMDPayload,
  type RemoveTasklistBlockMDPayload,
  type AddTasklistBlockMDPayload,
  type UpdateItemPositionMDPayload,
  type UpdateItemTitleMDPayload,
  type UpdateItemStateMDPayload,
  type MDOperationPayload,
  type UpdateTasklistTitlePayload,
} from '@github-ui/tasklist-block-operations'
// eslint-disable-next-line no-restricted-imports
import {off, on} from 'delegated-events'
import {requestSubmit} from '@github-ui/form-utils'
import {morpheusEnabled} from '@github-ui/morpheus'
import type {TrackingBlockElement} from './tracking-block-element'

const formTrackingBlockUpdateSelector = '[data-form-tracking-block-update]'

export type HierarchyCompletion = {
  completed: number
  total: number
}

let lastMDAtRestPromise: Promise<unknown> = Promise.resolve()
let pendingMDAtRestTimer: number | undefined

export default class TrackingBlockAPIComponent {
  #wasInitialized = false
  #commentElement: HTMLElement
  #contextElement?: TrackingBlockElement
  #formElement: HTMLFormElement | null = null

  get canSync() {
    return this.#wasInitialized && (!this.#contextElement || !!this.#formElement)
  }

  constructor(commentElement: HTMLElement, contextElement?: TrackingBlockElement) {
    this.#commentElement = commentElement
    this.#contextElement = contextElement
  }

  init(): this {
    if (this.#wasInitialized) return this

    this.#formElement = this.#contextElement?.querySelector(formTrackingBlockUpdateSelector) ?? null
    this.#wasInitialized = true

    return this
  }

  //#region [ Tracking Block API ]
  async appendDraftItem(payload: AppendItemMDPayload) {
    return await this.#doMDAtRestOperation(payload)
  }

  async updateDraftItemTitleMD(payload: UpdateItemTitleMDPayload) {
    return await this.#doMDAtRestOperation(payload)
  }

  async updateDraftItemStateMD(payload: UpdateItemStateMDPayload) {
    return await this.#doMDAtRestOperation(payload)
  }

  async removeItemMD(payload: RemoveItemMDPayload) {
    return await this.#doMDAtRestOperation(payload)
  }

  async removeTasklistBlock(payload: RemoveTasklistBlockMDPayload) {
    return await this.#doMDAtRestOperation(payload)
  }

  async addTasklistBlock(payload: AddTasklistBlockMDPayload) {
    return await this.#doMDAtRestOperation(payload)
  }

  async convertToIssueMD(payload: ConvertToIssueMDPayload) {
    return await this.#doMDAtRestOperation(payload)
  }

  async updateTasklistTitle(payload: UpdateTasklistTitlePayload) {
    return await this.#doMDAtRestOperation(payload)
  }

  async updateItemPositionMD(payload: UpdateItemPositionMDPayload) {
    return await this.#doMDAtRestOperation(payload)
  }

  dispatchEvent(event: Event) {
    // Dispatch the event on the comment element since the tracking block might have been removed from the DOM.
    return this.#commentElement.dispatchEvent(event)
  }

  async #doMDAtRestOperation(payload: MDOperationPayload) {
    this.disableCommentElements(true)

    try {
      return await this.#dispatchMDAtRestOperation(payload)
    } finally {
      this.disableCommentElements(false)
    }
  }

  async #dispatchMDAtRestOperation(payload: MDOperationPayload) {
    const {formId, ...args} = payload
    let handled = false
    const isReact = !formId

    // Prevent live updates while edits are pending.
    this.#commentElement.classList.add('is-dirty')
    this.dispatchEvent(new CustomEvent('tracking-block:dirty-change', {bubbles: true}))

    if (!isReact) {
      const form = document.querySelector<HTMLFormElement>(`form#${formId}`)
      const field = form?.querySelector<HTMLTextAreaElement>('.js-comment-field')
      const body = field?.value

      if (body) {
        const newBody = await performTasklistBlockOperation(body, payload)
        if (newBody != null) {
          field.value = newBody
          handled = true
        }
      }

      if (form) {
        const staleOperationTrackerInput = form.querySelector('input[name="tasklist_blocks_operation_tracker"]')
        const trackingArgs: {name: string; value?: string} = {name: args.operation}
        if (args.operation === 'append_item') {
          trackingArgs.value = args.value
        }
        if (!staleOperationTrackerInput) {
          const input = document.createElement('input')
          input.setAttribute('type', 'hidden')
          input.setAttribute('name', 'tasklist_blocks_operation_tracker')
          input.setAttribute('value', JSON.stringify([trackingArgs]))
          form.appendChild(input)
        } else {
          const value = staleOperationTrackerInput.getAttribute('value')
          try {
            const parsedTrackingArgs = JSON.parse(value!)
            parsedTrackingArgs.push(trackingArgs)
            staleOperationTrackerInput.setAttribute('value', JSON.stringify(parsedTrackingArgs))
          } catch (e) {
            // do nothing
          }
        }
      }
    } else {
      handled = await new Promise((resolve, reject) => {
        const detail = {payload, resolve, reject}
        const event = new CustomEvent('tracking-block:operation', {bubbles: true, detail})
        this.dispatchEvent(event)
      })
    }

    this.#contextElement?.handleStateChange('unsaved-changes')
    if (!handled) return await this.queueMDAtRestRequest(formId, JSON.stringify(args))

    const handler = async () => {
      const {activeElement} = document
      const comment = this.#commentElement

      // Check if the active element is the omnibar input or the omnibar toggle button.
      const omnibarActive = activeElement?.closest('.js-tracking-block-omnibar-container') != null

      // Hold off if something is currently being dragged or is focused, not including the empty omnibar or toggle button.
      if (
        comment?.querySelector('.js-tasklist-dragging') ||
        comment?.querySelector('.js-edit-metadata-popover-container:not([hidden])') ||
        (!morpheusEnabled(comment) &&
          (omnibarActive ? (activeElement as HTMLInputElement).value : comment?.contains(activeElement)))
      ) {
        pendingMDAtRestTimer = window.setTimeout(handler, 200)
        return
      }

      await send()
    }

    const send = async () => {
      off('click', 'a[href], .js-comment-edit-button', send)

      window.clearTimeout(pendingMDAtRestTimer)

      // Coalesce multiple event listeners into a single request.
      pendingMDAtRestTimer = window.setTimeout(async () => {
        try {
          await this.queueMDAtRestRequest(formId)
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error)
        } finally {
          window.removeEventListener('beforeunload', beforeunload)
        }
      }, 0)
    }

    const beforeunload = (event: BeforeUnloadEvent) => {
      if (!pendingMDAtRestTimer) return

      // Send the request immediately when the user attempts to navigate away from the page.
      send()

      event.preventDefault()
      // This message is ignored by most browsers.
      // eslint-disable-next-line i18n-text/no-en
      event.returnValue = 'Please wait a second while we save your changes.'
    }

    window.addEventListener('beforeunload', beforeunload, {once: true})

    // Send the request immediately when the edit button is clicked.
    // eslint-disable-next-line delegated-events/global-on
    on('click', 'a[href], .js-comment-edit-button', send)

    // Debounce requests for edits we were able to handle on the frontend.
    window.clearTimeout(pendingMDAtRestTimer)
    pendingMDAtRestTimer = window.setTimeout(handler, 2000)

    // Disable turbo navigation while a request is pending in order for beforeunload to fire.
    document.body.setAttribute('data-turbo', 'false')
  }

  async refreshTasklistBlocks(formId: string) {
    // Prevent updates while refreshing.
    this.#commentElement.classList.add('is-dirty')
    this.dispatchEvent(new CustomEvent('tracking-block:dirty-change', {bubbles: true}))

    await this.queueMDAtRestRequest(formId)
  }

  async queueMDAtRestRequest(formId: string, payload?: string) {
    document.body.removeAttribute('data-turbo')
    window.clearTimeout(pendingMDAtRestTimer)
    pendingMDAtRestTimer = undefined

    // Queue up the requests so we don't send them out of order.
    const callback = () => this.#makeRequestMDAtRest(formId, payload)

    // eslint-disable-next-line github/no-then
    lastMDAtRestPromise = lastMDAtRestPromise.then(callback, callback)
    return lastMDAtRestPromise
  }

  async #makeRequestMDAtRest(formId: string, payload?: string) {
    if (!this.canSync) return null

    this.#contextElement?.handleStateChange('saving')
    this.#commentElement.classList.remove('is-dirty')

    try {
      // if there's no formId that indicates that we're in the memex view
      if (!formId) {
        // Fire a custom event for Memex to handle the tracking block update in React.
        await new Promise<void>((resolve, reject) => {
          const detail = {payload, resolve, reject}
          const event = new CustomEvent('tracking-block:update', {bubbles: true, cancelable: true, detail})
          const ignored = this.dispatchEvent(event)

          // If the event was not ignored, we know that Memex handled the update and will resolve this promise.
          if (ignored) resolve()
        })
      } else {
        const form = document.querySelector(`form#${formId}`) as HTMLFormElement
        if (!form) return null
        // remove operation inputs from previous form calls
        const staleOperationsInput = form.querySelectorAll('input[name="tasklist_blocks_operation"]')
        const staleOperationTrackerInputs = form.querySelectorAll('input[name="tasklist_blocks_operation_tracker"]')
        for (const element of staleOperationsInput) element.remove()

        if (payload) {
          const input = document.createElement('input')
          input.setAttribute('type', 'hidden')
          input.setAttribute('name', 'tasklist_blocks_operation')
          input.setAttribute('value', payload)
          form.appendChild(input)
        }

        // Prevent the editor from closing if the user has opened it.
        form.setAttribute('data-submitting-tracking-block-update', payload ? 'sync' : 'async')

        await new Promise<void>((resolve, reject) => {
          const callback = (event: Event) => {
            form.removeAttribute('data-submitting-tracking-block-update')

            const {detail} = event as CustomEvent
            if (detail.error) {
              reject(detail.error)
            } else {
              resolve()
            }
          }

          form.addEventListener('submit:complete', callback, {once: true})

          try {
            requestSubmit(form)
            for (const element of staleOperationTrackerInputs) element.remove()
          } catch (e) {
            form.removeEventListener('submit:complete', callback)
            reject(e)
          }
        })
      }
    } catch (err) {
      this.#contextElement?.handleStateChange('failed-save')
      throw err
    }

    // Update the dirty state for Memex after the request has completed.
    this.dispatchEvent(new CustomEvent('tracking-block:dirty-change', {bubbles: true}))

    this.#contextElement?.handleStateChange('successful-save')
  }

  disableCommentElements(disabled: boolean) {
    this.#disableCommentButtons(disabled)
    this.#disableTasklistItemInputs(disabled)
    this.#disableTasklistSortables(disabled)
  }

  #disableCommentButtons(disabled: boolean) {
    const buttons = this.#commentElement.querySelectorAll(
      'button, details.dropdown, .js-item-avatar-stack, .js-label-assignee-container',
    )

    for (const button of buttons) {
      button.toggleAttribute('disabled', disabled)
    }
  }

  #disableTasklistItemInputs(disabled: boolean) {
    const inputs = this.#commentElement.querySelectorAll<HTMLInputElement>(
      'tracking-block-omnibar, [data-targets="tracking-block.inputs"]',
    )

    for (const input of inputs) {
      input.disabled = disabled
    }
  }

  #disableTasklistSortables(disabled: boolean) {
    const tasklists = this.#commentElement.querySelectorAll<TrackingBlockElement>('tracking-block')

    for (const tasklist of tasklists) {
      tasklist.sortable?.option('disabled', disabled)
    }
  }
}
