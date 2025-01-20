import {controller, target, targets} from '@github/catalyst'

@controller
/**
 * This class contains a subset of the ActionMenuElement created for the
 * Primer::Experimental::ActionMenuElement ViewComponent.
 *
 * It only contains the logic for the keyboard navigation, as the reactions
 * menu is currently used within a <details> element and doesn't need to manage
 * an overlay itself.
 */
export default class ReactionsMenuElement extends HTMLElement {
  @targets menuItems: HTMLElement[]
  @target details: HTMLDetailsElement
  @target summary: HTMLElement

  #firstMenuItem: HTMLElement
  #lastMenuItem: HTMLElement
  #abortController: AbortController

  #addEventsToMenuItems(signal: AbortSignal) {
    if (!this.menuItems) return

    for (const menuItem of this.menuItems) {
      menuItem.addEventListener('keydown', this.menuItemKeydown.bind(this), {signal})
      menuItem.addEventListener('mouseover', this.menuItemMouseover.bind(this), {signal})

      if (!this.#firstMenuItem) {
        this.#firstMenuItem = menuItem
      }
      this.#lastMenuItem = menuItem
    }
  }

  focusFirstItem() {
    if (!this.details.open || !this.#firstMenuItem) return
    this.#firstMenuItem.focus()
  }

  connectedCallback() {
    this.#abortController = new AbortController()
    this.#addEventsToMenuItems(this.#abortController.signal)
  }

  menuItemMouseover(event: MouseEvent) {
    ;(event.currentTarget as HTMLButtonElement).focus()
  }

  setFocusToMenuItem(newMenuItem: HTMLElement | undefined) {
    if (!this.menuItems) return
    if (!newMenuItem) return

    for (const item of this.menuItems) {
      if (item === newMenuItem) {
        item.tabIndex = 0
        newMenuItem.focus()
      } else {
        item.tabIndex = -1
      }
    }
  }

  setFocusToPreviousMenuItem(currentMenuItem: HTMLElement) {
    if (!this.menuItems) return

    let newMenuItem = null
    let index = null

    if (currentMenuItem === this.#firstMenuItem) {
      newMenuItem = this.#lastMenuItem
    } else {
      index = this.menuItems.indexOf(currentMenuItem)
      newMenuItem = this.menuItems[index - 1]
    }

    this.setFocusToMenuItem(newMenuItem)

    return newMenuItem
  }

  setFocusToNextMenuItem(currentMenuItem: HTMLElement) {
    if (!this.menuItems) return

    let newMenuItem = null
    let index = null

    if (currentMenuItem === this.#lastMenuItem) {
      newMenuItem = this.#firstMenuItem
    } else {
      index = this.menuItems.indexOf(currentMenuItem)
      newMenuItem = this.menuItems[index + 1]
    }
    this.setFocusToMenuItem(newMenuItem)

    return newMenuItem
  }

  hide() {
    this.details.open = false
    this.summary.focus()
  }

  /**
   * Fire a click event on the selected menu item.
   * Note there's code in [reactions.ts](https://github.com/github/github/blob/951125a5f9b3276e1b28542e9b06ef55993958ae/app/assets/modules/github/behaviors/reactions.ts#L139-L141)
   * that will close the reactions menu as part of this.
   */
  selectMenuItem(selectedItem: HTMLElement) {
    selectedItem.click()
  }

  menuItemKeydown(event: KeyboardEvent) {
    const currentTarget = event.currentTarget
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    const key = event.key
    let flag = false

    if (event.shiftKey) {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (event.key === 'Tab') {
        this.hide()
        flag = true
      }
    } else {
      switch (key) {
        case 'Enter':
          this.selectMenuItem(currentTarget as HTMLElement)
          flag = true
          break

        case 'Esc':
        case 'Escape':
          this.hide()
          flag = true
          break

        case 'Up':
        case 'ArrowUp':
        case 'Left':
        case 'ArrowLeft':
          this.setFocusToPreviousMenuItem(currentTarget as HTMLElement)
          flag = true
          break

        case 'ArrowDown':
        case 'Down':
        case 'Right':
        case 'ArrowRight':
          this.setFocusToNextMenuItem(currentTarget as HTMLElement)
          flag = true
          break

        case 'Home':
        case 'PageUp':
          this.setFocusToMenuItem(this.#firstMenuItem)
          flag = true
          break

        case 'End':
        case 'PageDown':
          this.setFocusToMenuItem(this.#lastMenuItem)
          flag = true
          break

        case 'Tab':
          this.hide()
          break

        default:
          break
      }
    }

    if (flag) {
      event.stopPropagation()
      event.preventDefault()
    }
  }
}
