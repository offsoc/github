import {controller, target} from '@github/catalyst'
import {debounce} from '@github/mini-throttle/decorators'

@controller
export class ManageSubscriptionElement extends HTMLElement {
  @target view_mode_container: HTMLElement
  @target edit_mode_container: HTMLElement
  @target seats: HTMLInputElement
  @target add_seats: HTMLElement
  @target remove_seats: HTMLElement
  @target min_error: HTMLElement
  @target max_error: HTMLElement
  @target current_seats: HTMLElement

  // Target elements that re-render when we update the seats input field
  @target current_price: HTMLElement
  @target payment_increase_container: HTMLElement
  @target payment_increase: HTMLElement
  @target payment_decrease_container: HTMLElement
  @target payment_decrease: HTMLElement
  @target payment_due: HTMLElement
  @target payment_due_notice: HTMLElement
  @target sales_tax_notice: HTMLElement

  #priceAbortController: AbortController | null = null

  async fetchAndUpdateCalculatedPrice(seats: number | string = this.seats.value) {
    this.#priceAbortController?.abort()

    const {signal} = (this.#priceAbortController = new AbortController())

    const url = `${this.getAttribute('data-price-url')}?seats=${seats}`
    const response = await fetch(url, {
      signal,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
      },
    })
    if (!response.ok) {
      return
    }
    const prices = await response.json()
    const updateKeys = [
      'current_price',
      'payment_increase',
      'payment_decrease',
      'payment_due',
      'payment_due_notice',
      'sales_tax_notice',
    ]
    for (const key of updateKeys) {
      const element = this[key as keyof HTMLElement]
      const value = prices[key as keyof string]
      if (element && value) {
        this.replaceTextNode(element as HTMLElement, value)
      }
    }
    this.payment_increase_container.hidden = prices.payment_increase === null
    this.payment_decrease_container.hidden = prices.payment_decrease === null

    if (signal.aborted) {
      return
    }
  }

  replaceTextNode(element: HTMLElement, text: string) {
    element.replaceChildren(document.createTextNode(text))
  }

  @debounce(200)
  debouncedUpdatePrice() {
    this.fetchAndUpdateCalculatedPrice()
  }

  async validateAndUpdatePrice() {
    this.replaceWithValidSeats()
    await this.fetchAndUpdateCalculatedPrice()
  }

  validateSeats(seats: string): [clampedSeats: string, hasMinError: boolean, hasMaxError: boolean] {
    const value = Number(seats)
    const minimumSeats = Number(this.seats.min)
    const maximumSeats = Number(this.seats.max)
    if (!value || value < minimumSeats) {
      return [minimumSeats.toString(), true, false]
    } else if (value > maximumSeats) {
      return [maximumSeats.toString(), false, true]
    } else {
      return [seats, false, false]
    }
  }

  replaceWithValidSeats(seats = this.seats.value) {
    const [clampedSeats, hasMinError, hasMaxError] = this.validateSeats(seats)
    this.seats.value = clampedSeats
    this.min_error.hidden = !hasMinError
    this.max_error.hidden = !hasMaxError
    this.current_seats.hidden = hasMinError || hasMaxError
  }

  async addSeats() {
    const seats = Math.max(0, Number(this.seats.value) + 1)
    this.replaceWithValidSeats(seats.toString())
    await this.fetchAndUpdateCalculatedPrice()
  }

  async removeSeats() {
    const seats = Math.max(0, Number(this.seats.value) - 1)
    this.replaceWithValidSeats(seats.toString())
    await this.fetchAndUpdateCalculatedPrice()
  }

  enterEditMode() {
    this.view_mode_container.hidden = true
    this.edit_mode_container.hidden = false
  }

  enterViewMode() {
    this.view_mode_container.hidden = false
    this.edit_mode_container.hidden = true
  }
}
