import {controller, target} from '@github/catalyst'

@controller
export class TaskComponentElement extends HTMLElement {
  #completeTaskController: AbortController | null = null

  @target token: HTMLInputElement

  async completeTask() {
    const key = this.getAttribute('data-task-key') || ''
    this.#completeTaskController?.abort()

    const {signal} = (this.#completeTaskController = new AbortController())

    const url = `${this.getAttribute('data-complete-task-url')}`
    const form = new FormData()
    form.set('task', key)
    const response = await fetch(url, {
      signal,
      method: 'PATCH',
      body: form,
      headers: {
        'Scoped-CSRF-Token': this.token.value,
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
      },
    })
    if (!response.ok) {
      return
    }
    await response.json()

    if (signal.aborted) {
      return
    }
  }
}
