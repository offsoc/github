import {attr, controller, target, targets} from '@github/catalyst'
import Sortable, {type SortableEvent} from '@github/sortablejs'
import {
  transformMarkdownToHTML,
  type AppendItemMDPayload,
  type ConvertToIssueMDPayload,
  type RemoveItemMDPayload,
  type RemoveTasklistBlockMDPayload,
  type UpdateItemPositionMDPayload,
  type UpdateItemTitleMDPayload,
  type UpdateItemStateMDPayload,
  type UpdateTasklistTitlePayload,
} from '@github-ui/tasklist-block-operations'

import './tracking-block-omnibar-element'
import type TrackingBlockOmnibarElement from './tracking-block-omnibar-element'
import TrackingBlockAPIComponent, {type HierarchyCompletion} from './tracking-block-api'
import {copyText} from '../../assets/modules/github/command-palette/copy'
import convert from 'color-convert'
import {sendHydroEvent} from '../../assets/modules/github/hydro-tracking'

/**
 * Custom element usage:
 * <tracking-block data-id="{trackingBlockId}" [data-readonly] [data-disabled] data-query-type="{issues-graph queryType}" data-response-source-type="{issues-graph responseSourceType}" data-completion-completed="{issues-graph completionCompleted}" data-completion-total="{issues-graph completionTotal}"">
 *  (...html content...)
 * </tracking-block>
 */

type Assignee = {
  alt: string
  src: string
}

type Label = {
  name: string
  color: string
}

const semanticAttributes = Object.freeze({
  issueType: 'data-issue',
  draftIssueType: 'data-draft-issue',
  itemUuid: 'data-item-uuid',
  itemId: 'data-item-id',
  itemTitle: 'data-item-title',
  itemState: 'data-item-state',
  itemPosition: 'data-item-position',
  displayNumber: 'data-display-number',
  repositoryId: 'data-repository-id',
  repositoryName: 'data-repository-name',
})

const selectors = Object.freeze({
  convertButton: '[data-tracking-block-convert-button]',
  removeButton: '[data-tracking-block-remove-button]',
  draftTitle: '[data-tracking-block-draft-title]',
  issue: '[data-issue]',
  draftIssue: '[data-draft-issue]',
})

type SelectorNameType = keyof typeof selectors

const MAX_LABELS_DISPLAYED = 3

// optimisticMetadata is outside the component to maintain state between
// destroy/create of the tasklist block element
let optimisticMetadata: {
  [key: string]: {
    assignees?: Assignee[]
    labels?: Label[]
  }
} = {}

@controller
export class TrackingBlockElement extends HTMLElement {
  @attr override id = ''
  @attr readonly = false
  @attr disabled = false
  @attr queryType = ''
  @attr responseSourceType = ''
  @attr completionCompleted = 0
  @attr completionTotal = 0
  @attr state = ''
  @attr precache = false

  @target list: HTMLElement | null
  @target omnibar: TrackingBlockOmnibarElement | null
  @target omnibarToggleButton: HTMLElement | null
  @target dropdownMenu: HTMLDetailsElement | null
  @target titleEditMode: HTMLElement | null
  @target titleViewMode: HTMLElement | null
  @targets inputs: NodeListOf<HTMLInputElement>
  @targets renderedTitles: NodeListOf<HTMLElement>
  @targets listItems: NodeListOf<HTMLElement>
  @target emptyItemTemplate: HTMLElement
  @target emptyIssueTemplate: HTMLElement
  @targets itemMenus: NodeListOf<HTMLElement>
  @target staleBanner: HTMLElement
  @target isSavingIcon: SVGSVGElement

  static refocusOmnibarIndex: number | null = null

  apiComponent: TrackingBlockAPIComponent | null = null
  sortable: Sortable | null = null
  // Property to lock edits to a tasklist that was created before markdown at rest and
  // is going to be converted during the current update. The lock is necessary to allow
  // the page to be refreshed properly with the new converted markdown at rest tasklist
  #isLockedForConversion = false

  //#region [ Public ]
  getAsJSON() {
    const items = []
    for (const listItem of this.listItems) {
      const state = listItem.getAttribute(semanticAttributes.itemState)
      const isClosed = state === 'closed' || state === 'draftClosed' || state === 'merged'
      const item = {
        uuid: listItem.getAttribute(semanticAttributes.itemUuid) || '',
        isClosed,
        isDraft: listItem.hasAttribute(semanticAttributes.draftIssueType),
        displayNumber: listItem.getAttribute(semanticAttributes.displayNumber) || '',
        title: listItem.getAttribute(semanticAttributes.itemTitle) || '',
        repositoryId: listItem.getAttribute(semanticAttributes.repositoryId) || '',
        repositoryName: listItem.getAttribute(semanticAttributes.repositoryName) || '',
      }
      items.push(item)
    }
    return items
  }
  //#endregion

  //#region [ Custom Element API ]
  connectedCallback() {
    if (!this.readonly) this.#createApiComponent()
    this.#updateListInteractiveStatus()
    this.#setupOmnibarListenersAndAttributes()
    this.#setupSortableItemListeners()
    this.#refocusOmnibarIfNecessary()
    this.#setupKeyboardInteractions()

    // Metadata
    this.#handleOptimisticMetadataRerender()
    this.#updateListItems()
    this.#calculateListItemAvatarStack()

    this.#attachCheckboxListeners()
    this.#setupSaveListener()
    this.#updateCompletion({dirty: false})

    this.#tryToUpdateIfDirtyState()
  }

  // Get and reset methods for testing purposes
  getOptimisticMetadata() {
    return optimisticMetadata
  }
  resetOptimisticMetadata() {
    optimisticMetadata = {}
  }

  /**
   * This handles a very specific scenario that will only be used within the memex context
   * If you're editing a tasklist block, and then before it sends the request you click to edit the markdown,
   * the implementation takes a snapshot of the current rendered HTML to capture its current state.
   * If the user cancels the edit, we reconstruct the HTML body from the snapshot, which will have the dirty state
   * and will try to send a request right way. If the user saves the markdown edits, then a new html will be used to
   * render the body, so the snapshot is ignored.
   */
  #tryToUpdateIfDirtyState() {
    if (this.readonly) return

    if (!this.classList.contains('is-dirty')) return
    this.apiComponent?.queueMDAtRestRequest('')
  }

  #setupSaveListener() {
    const {form} = this.findFormAndCommentElements()

    if (!form) return

    const callback = (event: Event) => {
      const customEvent = event as CustomEvent
      const error = customEvent.detail.error

      if (error) {
        const isStale = JSON.parse(error.response?.text)?.stale
        if (isStale) {
          this.staleBanner.hidden = false
        }
      }
    }
    form.addEventListener('submit:complete', callback, {once: true})
  }

  #setupKeyboardInteractions() {
    /**
     * List item keyboard behavior
     * 1. Users can tab to the TLB items
     * 2. Once in the items the user can use the up/down key arrows to navigate
     * 3. User's can press enter to begin tabbing to secondary items.
     * 4. Esc key returns the user to the top level list items
     */
    const listItems = Array.from(this.querySelectorAll<HTMLElement>('ol .TrackingBlock-item')).filter(element => {
      return !element.classList.contains('js-template')
    })

    for (const item of listItems) {
      const itemEventHandler = (event: KeyboardEvent) => {
        if (event.target === null) return
        const isActionListContent = (event.target as HTMLElement)?.classList.contains('ActionListContent')

        const currentIndex = Array.from(listItems).indexOf(event.target as HTMLElement)
        let nextIndex

        /**
         * We're not going to implement the data-/hotkeys attribute model. That doesn't seem
         * to really fit our use case.
         */

        /* eslint eslint-comments/no-use: off */
        /* eslint-disable @github-ui/ui-commands/no-manual-shortcut-logic */
        switch (event.code) {
          case 'ArrowUp':
            if (event.target === item) {
              event.preventDefault()
              nextIndex = currentIndex > 0 ? currentIndex - 1 : listItems.length - 1
              listItems[nextIndex]!.focus()
            }
            break
          case 'ArrowDown':
            if (event.target === item) {
              event.preventDefault()
              nextIndex = (currentIndex + 1) % listItems.length
              listItems[nextIndex]!.focus()
            }
            break
          case 'Escape':
            // In memex, stop the Esc key from closing the side panel when the user is editing a draft title
            // or has the draft item menu open.
            if (isActionListContent || event.target !== item) {
              event.stopPropagation()
            }

            // want default primer behavior when the user has keyboard focus inside the metadata menu
            if (event.target !== item && !isActionListContent) {
              item.focus()
            }
            break
          case 'Enter':
            if (!event.altKey) break
            if (event.target === item && this.#isListItemDraftIssue(item)) {
              event.preventDefault()
              const checkBox = item.querySelector<HTMLInputElement>('[data-targets="tracking-block.inputs"]')
              checkBox!.checked = !checkBox!.checked
              checkBox!.dispatchEvent(new Event('change'))
            } else if (event.target === item && this.#isListItemIssue(item)) {
              event.preventDefault()
              window.open(item.getElementsByTagName('a')[0]?.href, '_blank')
            }
            break
          case 'KeyC':
            if (
              event.altKey &&
              (event.target === item || this.#isActionMenuActive(event.target)) &&
              this.#isListItemDraftIssue(item)
            ) {
              event.preventDefault()
              this.convertTaskItemMD(item)
            }
            break
          case 'KeyA':
            if (
              event.altKey &&
              (event.target === item || this.#isActionMenuActive(event.target)) &&
              this.#isListItemIssue(item)
            ) {
              event.preventDefault()
              this.handleEditAssignees(event)
            }
            break
          case 'KeyL':
            if (
              event.altKey &&
              (event.target === item || this.#isActionMenuActive(event.target)) &&
              this.#isListItemIssue(item)
            ) {
              event.preventDefault()
              this.handleEditLabels(event)
            }
            break
          case 'KeyP':
            if (
              event.altKey &&
              (event.target === item || this.#isActionMenuActive(event.target)) &&
              this.#isListItemIssue(item)
            ) {
              event.preventDefault()
              this.handleEditProject(event)
            }
            break
          case 'KeyR':
            if (
              event.altKey &&
              (event.target === item || this.#isActionMenuActive(event.target)) &&
              this.#isListItemDraftIssue(item)
            ) {
              event.preventDefault()
              this.handleRename(event, true)
            }
            break
          case 'Home':
            if (event.target === item) {
              event.preventDefault()
              listItems[0]!.focus()
            }
            break
          case 'End':
            if (event.target === item) {
              event.preventDefault()
              listItems[listItems.length - 1]!.focus()
            }
            break
          case 'Tab':
            if (event.target === item) {
              if (event.shiftKey) {
                if (currentIndex !== 0) {
                  event.preventDefault()
                  // Shift+Tab: move focus to the dropdown menu
                  item.querySelector<HTMLElement>('[data-targets="tracking-block.dropdownMenu"]')?.focus()
                  nextIndex = currentIndex > 0 ? currentIndex - 1 : listItems.length - 1
                  listItems[nextIndex]!.querySelector<HTMLElement>(
                    '[data-targets="tracking-block.dropdownMenu"]',
                  )?.focus()
                }
              } else {
                event.preventDefault()
                item.querySelector<HTMLElement>('[data-targets="tracking-block.dropdownMenu"]')?.focus()
              }
            } else {
              if (event.shiftKey) {
                event.preventDefault()
                item.focus()
              } else {
                // only go to next item if there is one
                const parentIndex = Array.from(listItems).indexOf(item)
                if (parentIndex !== listItems.length - 1) {
                  event.preventDefault()
                  listItems[parentIndex + 1]!.focus()
                }
              }
            }
            break
          case 'Backspace':
            if (event.altKey && (event.target === item || this.#isActionMenuActive(event.target))) {
              event.preventDefault()
              this.handleRemoveItem(event)
            }
            break
        }
      }

      item.removeEventListener('keydown', itemEventHandler)
      item.addEventListener('keydown', itemEventHandler)
    }

    // The top level tasklist menu should not close the memex side panel when the user has the menu open and focus
    // is on the contents
    const tasklistMenuHandler = (event: KeyboardEvent) => {
      if (event.target === null) return
      const isActionListContent = (event.target as HTMLElement)?.classList.contains('ActionListContent')
      switch (event.code) {
        case 'Escape':
          // In memex, stop the Esc key from closing the side panel when the user is inside the main tasklist menu
          if (isActionListContent) {
            event.stopPropagation()
          }
      }
    }

    const tasklistMenu = this.querySelector<HTMLElement>('.tracking-block-list-item-dropdown-menu')

    tasklistMenu?.removeEventListener('keydown', tasklistMenuHandler)
    tasklistMenu?.addEventListener('keydown', tasklistMenuHandler)
  }

  disconnectedCallback() {
    this.#removeOmnibarListeners()
    this.#removeSortableItemListeners()
  }

  /*
   * Calls to transformMarkdownToHTML can cause flaky timeouts in CI. Moving those calls behind this
   * function gives us a way to mock those calls in tests and avoid the timeouts.
   */
  async transformMarkdownToHTML(body: string) {
    return await transformMarkdownToHTML(body)
  }

  /**
   * If you're editing a tasklist block, then before it sends the request you click to edit the markdown,
   * the implementation takes a snapshot of the current rendered HTML to capture its current state. When we do this
   * we want to make sure that the checkboxes are in the correct state so that the UI will not flicker unexpectedly
   * for the user when the tasklist re-renders from the HTML snapshot
   */
  #attachCheckboxListeners() {
    this.addEventListener('change', e => {
      const eventTarget = e.target ? (e.target as HTMLInputElement) : null
      if (!eventTarget?.matches('[type="checkbox"]')) return

      if (eventTarget.checked) {
        eventTarget.setAttribute('checked', 'checked')
      } else {
        eventTarget.removeAttribute('checked')
      }
    })
  }

  // Metadata editing
  handleEditLabels(evt: Event) {
    this.#handleEditMetadata(evt, 'labels')
  }

  handleEditAssignees(evt: Event) {
    this.#handleEditMetadata(evt, 'assignees')
  }

  handleEditProject(evt: Event) {
    this.#handleEditMetadata(evt, 'project')
  }

  handleMarkAsDone(evt: Event) {
    if (evt instanceof KeyboardEvent && evt.code !== 'Enter') return
    const listItem = this.#getTargetBySelector(evt.target as HTMLElement, 'draftIssue')
    const checkBox = listItem?.querySelector<HTMLInputElement>('[data-targets="tracking-block.inputs"]')
    if (!listItem || !checkBox) return
    this.#closeMenuPopover(listItem)
    checkBox.checked = !checkBox.checked
    checkBox.dispatchEvent(new Event('change'))
  }

  handleStateChange(state: 'unsaved-changes' | 'saving' | 'successful-save' | 'failed-save') {
    this.state = state

    this.isSavingIcon.toggleAttribute('hidden', state !== 'saving')
    const addTasklistButton = document.querySelector('.js-add-tasklist-button')
    addTasklistButton?.toggleAttribute('disabled', state === 'saving')
  }

  #handleEditMetadata(evt: Event, menuType: string) {
    const listItem = this.#getTargetBySelector(evt.target as HTMLElement, 'issue')
    const itemId = listItem?.getAttribute(semanticAttributes.itemId)
    if (!listItem || !itemId) return

    evt.preventDefault()
    evt.stopPropagation()

    this.#closeMenuPopover(listItem)

    const container = listItem.querySelector<HTMLElement>(
      `.js-edit-metadata-popover-container[data-menu-type=${menuType}]`,
    )
    const turboFrame = container?.querySelector<HTMLElement>('turbo-frame')
    if (!container || !turboFrame) return

    container.hidden = false
    turboFrame.hidden = false

    const openDetails = () => {
      const details = container.querySelector('details')
      if (!details) return

      // Ensure a toggle event is fired when opening.
      details.open = false
      details.open = true

      details.addEventListener(
        'toggle',
        e => {
          if (!details.open) this.handleClosePopover(e, menuType)
        },
        {once: true},
      )
      details.addEventListener('keydown', e => {
        const {key} = e
        if (key === 'Escape' && !details.open) {
          this.handleClosePopover(e, menuType)
        }
      })

      const filterableField = details.querySelector<HTMLInputElement>('.js-filterable-field')
      filterableField?.focus()
    }

    if (turboFrame.hasAttribute('complete')) {
      openDetails()
    } else {
      // Bail forced page routing if the source turbo-frame was removed from the page.
      // https://github.com/github/github/blob/master/ui/packages/turbo/frame.ts#L110
      document.addEventListener(
        'turbo:before-frame-render',
        e => {
          const event = e as CustomEvent
          if (event.target === document.documentElement && event.detail.newFrame?.id === turboFrame.id) {
            event.stopPropagation()
          }
        },
        {capture: true, once: true},
      )
      turboFrame.addEventListener('turbo:frame-load', openDetails, {once: true})
    }
  }

  #calculateListItemAvatarStack() {
    for (const listItem of this.listItems) {
      const avatarStack = listItem.querySelector<HTMLElement>('.js-item-avatar-stack')
      const avatars = listItem.querySelectorAll('.avatar:not(.avatar-template)')
      if (!avatarStack) continue

      switch (avatars.length) {
        case 1:
          avatarStack.classList.remove('AvatarStack--two', 'AvatarStack--three-plus')
          break
        case 2:
          avatarStack.classList.add('AvatarStack--two')
          break
        case 3:
          avatarStack.classList.add('AvatarStack--three-plus')
          break
      }
    }
  }

  #handleOptimisticMetadataRerender() {
    for (const uuid in optimisticMetadata) {
      const listItem = this.querySelector<HTMLElement>(`[data-item-uuid="${uuid}"]`)
      if (!uuid || !listItem || !optimisticMetadata[uuid]) return

      const {assignees, labels} = optimisticMetadata[uuid]
      if (assignees) this.#handleAssigneeOptimisticMetadata(listItem, assignees)
      if (labels) this.#handleLabelsOptimisticMetadata(listItem, labels)
    }
  }

  handleClosePopover(evt: Event, menuType?: string) {
    const overlay = evt.target as HTMLElement | null
    if (!overlay) return

    const listItem = this.#getTargetBySelector(overlay, 'issue')
    // There is no item uuid when rendering a tasklist precache, so we can use itemId instead
    const listItemId =
      listItem?.getAttribute(semanticAttributes.itemUuid) || listItem?.getAttribute(semanticAttributes.itemId)
    const container = overlay?.closest<HTMLElement>('.js-edit-metadata-popover-container')
    if (!container || !listItemId || !listItem) return

    menuType ||= container.getAttribute('data-menu-type') || ''
    if (!menuType) return

    container.hidden = true

    const details = container.querySelector('details')
    if (!details) return
    details.open = false

    // Ensure the metadata list has loaded before optimistically updating
    if (!details.querySelector('.select-menu-list')) return

    if (!(`${listItemId}` in optimisticMetadata)) optimisticMetadata[listItemId] = {}

    // Optimistically update the item
    // Store assignee and labels changes, in alphabetical order
    if (menuType === 'assignees') {
      const checkedAvatars = container.querySelectorAll('input:checked')
      const avatars = Array.from(checkedAvatars)
        .map(input => input.closest('label') as HTMLElement | null)
        .filter((input): input is HTMLElement => input !== null)
        .sort((a: Element, b: Element) => {
          const nameA = a.querySelector('.js-username')?.innerHTML
          const nameB = b.querySelector('.js-username')?.innerHTML
          if (!nameA || !nameB) return 0
          if (nameA < nameB) return -1
          if (nameA > nameB) return 1
          return 0
        })

      const assignees = []
      for (const avatar of avatars) {
        const alt = avatar.querySelector('.js-username')?.innerHTML || ''
        const src = avatar.querySelector('.js-avatar')?.getAttribute('src') || ''
        assignees.push({alt, src})
      }

      optimisticMetadata[listItemId]![menuType] = assignees
      this.#handleAssigneeOptimisticMetadata(listItem, assignees)
    } else if (menuType === 'labels') {
      const checkedInputs = container.querySelectorAll('input:checked')
      const checkedLabels = Array.from(checkedInputs)
        .sort((a: Element, b: Element) => {
          const labelNameA = a.getAttribute('data-label-name')
          const labelNameB = b.getAttribute('data-label-name')
          if (!labelNameA || !labelNameB) return 0
          if (labelNameA < labelNameB) return -1
          if (labelNameA > labelNameB) return 1
          return 0
        })
        .map(input => input.closest('label') as HTMLElement | null)
        .filter((input): input is HTMLElement => input !== null)

      const labels = []
      for (const label of checkedLabels) {
        const name = label.querySelector('.js-label-name-html')?.innerHTML || ''
        const badge = label.querySelector('.js-label-color')
        const color = badge?.getAttribute('label-color') || ''
        labels.push({name, color})
      }

      optimisticMetadata[listItemId]![menuType] = labels
      this.#handleLabelsOptimisticMetadata(listItem, labels)
    } else if (menuType === 'project') {
      this.#showProjectUpdateToast(container)
    }
  }

  #showProjectUpdateToast(container: HTMLElement) {
    const sideBarForm = container.querySelector('form')
    if (!sideBarForm) return

    const callback = (event: Event) => {
      const {detail} = event as CustomEvent
      const toast = this.querySelector<HTMLElement>(
        detail?.error ? '.js-edit-metadata-error-toast' : '.js-edit-metadata-success-toast',
      )
      if (!toast) return

      toast.addEventListener(
        'animationend',
        () => {
          toast.hidden = true
        },
        {once: true},
      )
      toast.hidden = false
    }

    sideBarForm.addEventListener('submit:complete', callback, {once: true})
  }

  toggleLabelCountPopover(evt: Event) {
    const popover = this.#getSiblingTargetBySelector(
      evt.target as HTMLElement,
      'issue',
      '.js-label-count-popover-container',
    )
    if (!popover) return

    evt.preventDefault()
    evt.stopPropagation()

    popover.hidden = !popover.hidden
  }

  hideLabelCountPopover(evt: Event) {
    const popover = this.#getSiblingTargetBySelector(
      evt.target as HTMLElement | null,
      'issue',
      '.js-label-count-popover-container',
    )
    if (!popover) return

    evt.preventDefault()
    evt.stopPropagation()

    popover.hidden = true
  }

  #handleAssigneeOptimisticMetadata(listItem: HTMLElement, checkedAvatars: Assignee[]) {
    const emptyIcon = listItem?.querySelector('.empty-avatar-icon')
    const assignees = listItem?.querySelector<HTMLElement>('.js-item-avatar-stack')
    const template = listItem?.querySelector('.avatar-template')
    if (!emptyIcon || !assignees || !checkedAvatars || !template) return

    emptyIcon.toggleAttribute('hidden', checkedAvatars.length > 0)

    for (const assignee of assignees.querySelectorAll('.avatar')) {
      if (assignee !== template) assignee.remove()
    }

    // Handle optimistic update styling
    // remove all avatar style classes
    assignees.classList.remove('AvatarStack--two', 'AvatarStack--three-plus')
    switch (checkedAvatars.length) {
      case 0:
        assignees.hidden = true
        break
      case 1:
        assignees.hidden = false
        break
      case 2:
        assignees.hidden = false
        assignees.classList.add('AvatarStack--two')
        break
      default:
        assignees.hidden = false
        assignees.classList.add('AvatarStack--three-plus')
    }

    for (const avatar of checkedAvatars) {
      const clone = template.cloneNode(true) as HTMLElement
      const img = clone.querySelector<HTMLImageElement>('img')
      const {alt, src} = avatar
      clone.classList.remove('avatar-template')
      if (img) {
        img.setAttribute('data-hovercard-url', `/users/${alt}/hovercard`)
        img.alt = alt
        img.src = src
      }
      template.before(clone)
    }
  }

  #handleLabelsOptimisticMetadata(listItem: HTMLElement, checkedLabels: Label[]) {
    const labelsGroup = listItem?.querySelector('.js-label-assignee-container')
    const template = labelsGroup?.querySelector('.label-template')
    const popoverTemplate = labelsGroup?.querySelector('.label-popover-template')
    if (!listItem || !labelsGroup || !checkedLabels || !template || !popoverTemplate) return

    for (const label of labelsGroup.querySelectorAll('.js-item-label:not(.label-template)')) {
      label.remove()
    }
    for (const label of labelsGroup.querySelectorAll('.js-item-label-in-popover:not(.label-popover-template)')) {
      label.remove()
    }

    for (const label of checkedLabels) {
      // Create label in list item
      const clone = template.cloneNode(true) as HTMLElement
      const span = clone.querySelector<HTMLSpanElement>('span')
      const {name, color} = label
      if (color) this.#setColorSwatch(clone, color)
      if (name) {
        clone.setAttribute('data-name', name)
        if (span) span.innerHTML = name
      }
      clone.classList.remove('label-template')

      template.before(clone)

      // Create popover label
      const clonePopover = popoverTemplate.cloneNode(true) as HTMLElement
      const spanPopover = clonePopover.querySelector<HTMLSpanElement>('span')
      if (color) this.#setColorSwatch(clonePopover, color)
      if (name) {
        clonePopover.setAttribute('data-name', name)
        if (spanPopover) spanPopover.innerHTML = name
      }
      clonePopover.classList.remove('label-popover-template')
      popoverTemplate.before(clonePopover)
    }

    this.#handleLabelOverflow(listItem)
  }

  #setColorSwatch(element: HTMLElement, color: string) {
    const rgb = convert.hex.rgb(color)
    element.style.setProperty('--label-r', rgb[0].toString())
    element.style.setProperty('--label-g', rgb[1].toString())
    element.style.setProperty('--label-b', rgb[2].toString())

    const hsl = convert.rgb.hsl(rgb)
    element.style.setProperty('--label-h', hsl[0].toString())
    element.style.setProperty('--label-s', hsl[1].toString())
    element.style.setProperty('--label-l', hsl[2].toString())
  }

  handleRename(evt: Event, isHotkey: boolean) {
    if (evt instanceof KeyboardEvent && !isHotkey && evt.code !== 'Enter') return
    const listItem = this.#getTargetBySelector(evt.target as HTMLElement, 'draftIssue')

    const targetElement = listItem?.querySelector<HTMLInputElement>('[data-tracking-block-draft-title]')

    if (!listItem || !targetElement) return
    this.#closeMenuPopover(listItem)
    this.#showDraftTitleInput(targetElement)
  }

  handleDraftTitleClick(evt: Event) {
    // Check if the evt.target is a link and prevent the draft title click behavior
    if (evt.target instanceof HTMLAnchorElement) return

    const targetElement = this.#getTargetBySelector(evt.target as HTMLElement | null, 'draftTitle')
    if (!targetElement) return

    this.#showDraftTitleInput(targetElement)
  }

  #showDraftTitleInput(titleElement: HTMLElement) {
    const titleFormControl = titleElement?.querySelector<HTMLElement>('.js-title-text-field-wrapper')
    const titleInput = titleElement.querySelector('textarea')
    const titleMDDisplay = titleElement.querySelector<HTMLElement>('.js-draft-title')

    if (!titleFormControl || !titleInput || !titleMDDisplay) return

    titleFormControl.hidden = false
    titleMDDisplay.hidden = true

    const end = titleInput.value.length
    titleInput.setSelectionRange(end, end)

    // This is needed because of the default behavior of the ActionMenu focus, remove this once a fix is published
    // to the primer library
    setTimeout(() => {
      titleInput.focus()

      // Force the autosize to update
      titleInput.dispatchEvent(new Event('input'))
    }, 10)
  }

  draftTitleInputOutFocus() {
    this.#hideAllTitleInputs()
  }

  activateOmnibar() {
    this.#focusOmnibarInput()
  }

  #hideAllTitleInputs() {
    const {list} = this
    if (!list) return

    for (const listItem of this.listItems) {
      const titleFormControl = listItem.querySelector<HTMLElement>('.js-title-text-field-wrapper')
      const titleMDDisplay = listItem.querySelector<HTMLElement>('.js-draft-title')

      if (titleFormControl) {
        titleFormControl.hidden = true
      }

      if (titleMDDisplay) {
        titleMDDisplay.hidden = false
      }
    }
  }

  disableTasklistListener(event: Event) {
    const customEvent = event as CustomEvent
    const isDisabled = customEvent.detail
    this.apiComponent?.disableCommentElements(isDisabled)
  }

  #setupSortableItemListeners() {
    const {list} = this
    if (this.sortable || !list) return

    this.sortable = Sortable.create(list, {
      group: 'tracking-block',
      animation: 150,
      chosenClass: 'tasklist-issue-chosen-item',
      item: '.js-tasklist-draggable-issue',
      handle: '.js-tasklist-drag-handle',
      onStart: () => list.classList.add('js-tasklist-dragging'),
      onEnd: (event: SortableEvent) => {
        this.#handleItemMove(event)
        list.classList.remove('js-tasklist-dragging')
      },
      ghostClass: 'tasklist-issue-ghost-item',
    })
  }

  #removeSortableItemListeners() {
    if (!this.sortable)
      return // Workaround: the destroy method does not remove the dragend listener
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(this.sortable as any)._onDrop = () => {}

    this.sortable.destroy()
    this.sortable = null
  }

  #setupOmnibarListenersAndAttributes() {
    const omnibarInput = this.omnibar?.querySelector('input')
    omnibarInput?.addEventListener('focus', this, true)
    omnibarInput?.addEventListener('blur', this)
    omnibarInput?.addEventListener('keydown', this)

    // Occasionally the primer autocomplete component will set a default value of '#'
    // this triggers a dirty field check and blocks live updates to the tracking block
    omnibarInput?.setAttribute('data-default-value', '')
  }

  #removeOmnibarListeners() {
    const omnibarInput = this.omnibar?.querySelector('input')
    omnibarInput?.removeEventListener('focus', this, true)
    omnibarInput?.removeEventListener('blur', this)
    omnibarInput?.removeEventListener('keydown', this)
  }

  /**
   * Check the labels associated with the list item to see if they overflow into the title or assignee elements
   * of the list item.
   */
  #updateListItems() {
    for (const listItem of this.listItems) {
      this.#handleLabelOverflow(listItem)
    }
  }

  #toggleLoadingSkeletons(listItem: HTMLElement, show: boolean) {
    const labelContainer = listItem.querySelector('.js-label-assignee-container')
    const loadingContainer = listItem.querySelector<HTMLElement>('.js-label-loading-container')
    if (labelContainer) {
      labelContainer.classList.toggle('hide-labels', show)
    }
    if (loadingContainer) {
      loadingContainer.hidden = !show
    }
  }

  #handleLabelOverflow(listItem: HTMLElement) {
    const countPill = listItem.querySelector<HTMLElement>('.js-hidden-label-counter')
    const labelsInPopover = Array.from(
      listItem.querySelectorAll<HTMLElement>('.js-item-label-in-popover:not(.label-popover-template)'),
    )
    if (!countPill) return

    // Always start calculating the overflow with the counter label and skeletons shown
    this.#toggleLoadingSkeletons(listItem, true)
    countPill.hidden = false

    // Remove labels from the list item until labels are no longer overflowing
    const overflowedLabels = this.#calculateLabelOverflow(listItem)
    const shownLabelsInPopover = []
    for (const label of overflowedLabels) {
      label.hidden = true
      const labelName = label.textContent?.trim()
      // Display in popover
      if (labelName) {
        const labelIndex = labelsInPopover.findIndex(l => l.textContent?.trim() === labelName)
        const labelInPopover = labelsInPopover[labelIndex]
        if (labelIndex > -1 && labelInPopover) {
          labelInPopover.hidden = false
          shownLabelsInPopover.push(labelName)
        }
      }
    }

    // If there are hidden labels, add their names to the tooltip and display the hidden label count to the user
    const hiddenCount = shownLabelsInPopover.length
    if (hiddenCount > 0) {
      countPill.textContent = `+${hiddenCount}`
      countPill.setAttribute('aria-label', shownLabelsInPopover.join(', '))
      countPill.hidden = false
    } else {
      countPill.hidden = true
    }

    this.#toggleLoadingSkeletons(listItem, false)
  }

  // Returns a list of label elements that are overflowing and should be hidden
  #calculateLabelOverflow(listItem: HTMLElement): HTMLElement[] {
    const labels = Array.from(listItem.querySelectorAll<HTMLElement>('.js-item-label:not(.label-template)'))
    const assignees = listItem.querySelector('.js-item-avatar-stack')
    const title = listItem.querySelector('.js-item-title')
    const countPill = listItem.querySelector('.js-hidden-label-counter')
    const dropdownMenu = listItem.querySelector('.js-item-dropdown')

    const listItemWidth = listItem.clientWidth
    const [titleWidth, countPillWidth, assigneesWidth, dropdownMenuWidth] = [
      title,
      countPill,
      assignees,
      dropdownMenu,
    ].map(item => {
      if (!item) return 0
      const width = (item as HTMLElement).offsetWidth // width of element + padding + border
      const marginLeft = parseInt(window.getComputedStyle(item).marginLeft, 10)
      const marginRight = parseInt(window.getComputedStyle(item).marginRight, 10)
      return width + marginLeft + marginRight || 0
    })

    // Calculate the width of all the other elements in the list item container and subtract it from the list item width
    // to calculate the space available for labels
    const containerWidth = listItemWidth - assigneesWidth! - titleWidth! - countPillWidth! - dropdownMenuWidth!

    // If the total width of the labels, assignees, and count pill is greater than the width of the list item, then the list item is overflowing
    let totalLabelOffset = 0
    const hiddenLabels = [] as HTMLElement[]
    // Max of 3 labels showing, but must have at least one label showing
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i]
      totalLabelOffset += label?.offsetWidth || 0

      // Always show at least one label
      if (i === 0) {
        continue
      }
      if (label && (i >= MAX_LABELS_DISPLAYED || totalLabelOffset > containerWidth)) {
        hiddenLabels.push(label)
      }
    }

    return hiddenLabels
  }

  attributeChangedCallback(name: string) {
    if (name === 'data-readonly' || name === 'data-disabled') {
      this.#updateListInteractiveStatus()
      return
    }
  }
  //#endregion

  //#region [ Events ]
  handleEvent(event: Event) {
    switch (event.type) {
      case 'tracking-block-omnibar-append':
        this.#handleOmnibarAppend(event as CustomEvent)
        break
      case 'tasklist-block-title-update':
        this.#handleTasklistTitleUpdate(event as CustomEvent)
        break
      case 'click':
        this.handleConvertItem(event as MouseEvent)
        this.handleRemoveItem(event as MouseEvent)
        break
      case 'change': {
        const input = event.currentTarget as HTMLInputElement

        if (input.type === 'checkbox') {
          this.updateTaskItemStateMD(event)
        } else {
          this.updateTaskItemTitleMD(event)
        }
        break
      }
      case 'focus':
        this.handleOmnibarFocus()
        break
      case 'blur':
        this.handleOmnibarBlur()
        break
      case 'keydown':
        if (event.currentTarget === this.omnibar?.input) {
          this.#handleOmnibarKeydown(event as KeyboardEvent)
        } else if (Array.from(this.inputs).includes(event.currentTarget as HTMLInputElement)) {
          this.#handleDraftKeydown(event as KeyboardEvent)
        }
        break
    }
  }

  #handleOmnibarAppend(event: CustomEvent) {
    this.appendTaskItem(event.detail)
  }

  #handleTasklistTitleUpdate(event: CustomEvent) {
    this.updateTasklistTitle(event.detail)
  }

  handleOmnibarFocus() {
    const omnibarInput = this.omnibar?.input
    if (!omnibarInput || omnibarInput.value) return

    // Trigger autocomplete to display the fetched results
    omnibarInput.value = '#'

    // Use to hide the # from the user just before rendering
    queueMicrotask(() => {
      // The defaultValue may have been inadvertently changed by the form submission.
      omnibarInput.defaultValue = omnibarInput.value = ''
    })
  }

  handleOmnibarBlur() {
    // If the omnibar loses focus while there are unsaved changed, then don't automatically refocus it.
    if (this.state === 'unsaved-changes' || this.state === 'saving') {
      TrackingBlockElement.refocusOmnibarIndex = null
      return
    }

    // Don't hide the omnibar if user is typing, submitting, or interacting with the autocomplete menu
    if (this.omnibar?.disabled || this.omnibar?.input?.value || this.omnibar?.autocomplete?.open) return

    this.omnibar?.toggleAttribute('hidden', true)
    this.omnibarToggleButton?.toggleAttribute('hidden', false)
  }

  #handleOmnibarKeydown(event: KeyboardEvent) {
    // Ignore the lint rule regarding using data-/hotkey because it's not applicable to this

    if (event.key === 'Escape' && this.omnibar) {
      event.stopPropagation()

      this.omnibar.toggleAttribute('hidden', true)
      this.omnibarToggleButton?.toggleAttribute('hidden', false)
      this.omnibarToggleButton?.focus()
    }
  }

  handleOmnibarToggleButtonClick() {
    this.omnibarToggleButton?.toggleAttribute('hidden', true)
    this.omnibar?.toggleAttribute('hidden', false)
    this.omnibar?.focus()
  }

  #handleItemMove(event: SortableEvent) {
    if (event.from === event.to && event.newIndex === event.oldIndex) return

    this.updateItemPosition(event)
  }

  handleConvertItem(e: Event) {
    const targetElement = this.#getTargetBySelector(e.target as HTMLElement | null, 'convertButton')
    if (!targetElement || (targetElement as HTMLButtonElement).disabled) return

    const listItem = targetElement.closest('li.TrackingBlock-item') as HTMLLIElement
    if (!listItem) return

    this.convertTaskItemMD(listItem)
  }

  #handleDraftKeydown(event: KeyboardEvent) {
    const input = event.currentTarget as HTMLInputElement | null

    // Ignore bubbled events
    if (event.target !== input) return

    if (event.key === 'Enter') {
      // Prevent the default behavior of inserting a new line
      event.preventDefault()

      // eslint-disable-next-line github/no-blur
      input?.blur() // Blur the input to trigger the change event
    }
  }

  copyBlockMarkdown() {
    const totalMarkdown = this.getAsJSON()
      .map((item, index) => {
        const listPrefix = `- [${item.isClosed ? 'x' : ' '}]`
        if (item.isDraft) {
          return `${listPrefix} ${item.title}`
        } else {
          return `${listPrefix} [${item.title} | ${item.repositoryName}#${item.displayNumber}](${this.listItems[
            index
          ]!.querySelector('a')?.href})`
        }
      })
      .join('\n')
    copyText(totalMarkdown)
    const buttonEl = this.querySelector('.copy-markdown-button')
    if (buttonEl) {
      sendHydroEvent(buttonEl as HTMLElement)
    }
    this.dropdownMenu?.toggleAttribute('open')
  }

  showTitleEditMode() {
    this.dropdownMenu?.toggleAttribute('open', false)
    this.titleEditMode?.toggleAttribute('hidden', false)
    this.titleViewMode?.toggleAttribute('hidden', true)
    const titleInput = this.titleEditMode?.querySelector<HTMLInputElement>('.js-tasklist-title-input')
    titleInput?.focus()
    titleInput?.select()
  }

  hideTitleEditMode() {
    this.titleEditMode?.toggleAttribute('hidden', true)
    this.titleViewMode?.toggleAttribute('hidden', false)
  }

  handleRemoveItem(e: Event) {
    let targetElement
    if (e instanceof MouseEvent) {
      targetElement = this.#getTargetBySelector(e.target as HTMLElement | null, 'removeButton')
    }
    if (e instanceof KeyboardEvent) {
      targetElement =
        this.#getTargetBySelector(e.target as HTMLElement | null, 'issue') ||
        this.#getTargetBySelector(e.target as HTMLElement | null, 'draftIssue')
    }
    if (!targetElement) return
    const listItem = targetElement.closest('li.TrackingBlock-item') as HTMLLIElement
    if (!listItem) return

    const {form, comment} = this.findFormAndCommentElements()
    const trackingBlock = targetElement.closest<HTMLDivElement>('tracking-block')!
    const trackingBlocks = Array.from(comment.querySelectorAll('tracking-block'))
    const blockPosition = trackingBlocks.findIndex(block => block === trackingBlock)
    // find the ol closest to the targetElement then find the li's position inside it
    const listItemPosition = Array.from(listItem.parentElement?.children as HTMLCollectionOf<HTMLLIElement>).findIndex(
      item => item === listItem,
    )
    if (listItemPosition === -1) return // item position not found in list

    const payload: RemoveItemMDPayload = {
      operation: 'remove_item',
      position: [blockPosition, listItemPosition],
      formId: form?.id || '',
    }

    this.removeTaskItemMD(listItem, payload)
  }

  findFormAndCommentElements(): {form: HTMLElement | null; comment: HTMLElement} {
    let comment = this.closest<HTMLDivElement>('.js-comment')!
    let form = null

    // The js-comment class is a dotcom convention that is used to determine whether the call
    // is occuring in issues#show or in a react view.
    const isReact = !comment
    if (!isReact) {
      form = comment.querySelector<HTMLFormElement>('.js-comment-update')!
    } else {
      comment = this.closest<HTMLDivElement>('.markdown-body')!
    }

    return {form, comment}
  }
  //#endregion

  //#region [ List Actions ]
  async updateTasklistTitle(payload: UpdateTasklistTitlePayload) {
    if (!this.#canSync()) return

    const omnibarPlaceholderText = this.omnibarToggleButton?.querySelector('.js-tracking-block-omnibar-title')
    const currentOmnibarPlaceholder = omnibarPlaceholderText?.innerHTML
    if (omnibarPlaceholderText && omnibarPlaceholderText.innerHTML) {
      omnibarPlaceholderText.innerHTML = await this.transformMarkdownToHTML(payload.name)
    }

    try {
      await this.apiComponent!.updateTasklistTitle(payload)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('updateTasklistTitle: Error occurred', error)
      if (omnibarPlaceholderText && omnibarPlaceholderText.innerHTML) {
        omnibarPlaceholderText.innerHTML = currentOmnibarPlaceholder || 'Tasks'
      }
    }
  }

  async appendTaskItem(payload: AppendItemMDPayload) {
    if (!this.#canSync()) return

    // Keep track of which omnibar we're refocusing after the append operation completes.
    TrackingBlockElement.refocusOmnibarIndex = payload.position

    const issueNode = /^https?:\/\//.test(payload.value)
      ? this.omnibar?.querySelector(`[data-autocomplete-value='${payload.value}'] .ActionListItem-label`)
      : null

    let newItem: HTMLElement

    if (issueNode) {
      newItem = this.emptyIssueTemplate.cloneNode(true) as HTMLElement

      // Make sure issues being added wrap and are styled correctly.
      issueNode
        .querySelector('.truncated-autocomplete-suggestion-title')
        ?.classList.remove('truncated-autocomplete-suggestion-title')

      const content = newItem.querySelector<HTMLElement>('.js-issue-template-content')
      if (content) {
        content.appendChild(issueNode.cloneNode(true))
        content.setAttribute('data-hovercard-type', 'issue')
        content.setAttribute('data-hovercard-url', `${payload.value}/hovercard`)
      }
    } else {
      // Find hidden draft item template, clone it, and update its text contents for our optimistic update.
      newItem = this.emptyItemTemplate.cloneNode(true) as HTMLElement

      // newItem.classList.add('TrackingBlock-item')
      const newTitle = newItem.querySelector('.empty-template-title span')!
      newTitle.innerHTML = await this.transformMarkdownToHTML(payload.value)

      const newTextarea = newItem.querySelector('textarea')
      newTextarea!.defaultValue = payload.value
    }

    newItem.hidden = false
    newItem.classList.remove('js-template')
    newItem.removeAttribute('data-target')
    newItem.setAttribute('data-targets', 'tracking-block.listItems')

    for (const input of newItem.querySelectorAll('input, textarea')) {
      input.setAttribute('data-targets', 'tracking-block.inputs')
    }

    this.emptyItemTemplate.before(newItem)

    // Optimistically update the progress pill based on the event type
    this.#updateCompletion({
      dirty: true,
      completed: this.completionCompleted,
      total: this.completionTotal + 1,
    })

    try {
      await this.apiComponent!.appendDraftItem(payload)
      this.#setupKeyboardInteractions()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)

      this.#updateCompletion({
        dirty: false,
        completed: this.completionCompleted,
        total: this.completionTotal - 1,
      })
    }

    // If the omnibar was focused before the append operation, refocus it.
    // setTimeout is used as a workaround for a race condition in Memex
    setTimeout(() => this.#focusOmnibarInput(), 0)
  }

  async updateTaskItemTitleMD(event: Event) {
    if (!this.#canSync()) return

    const input = event.currentTarget as HTMLInputElement | null
    if (!input || !input.value) return

    // Ignore bubbled events
    if (event.target !== input) return

    const targetElement = event.target as HTMLElement | null
    if (!targetElement) return

    const {form, comment} = this.findFormAndCommentElements()
    const listItem = targetElement.closest<HTMLLIElement>('li')
    const trackingBlock = targetElement.closest('tracking-block')!
    const trackingBlocks = Array.from(comment.querySelectorAll('tracking-block'))
    const blockPosition = trackingBlocks.findIndex(block => block === trackingBlock)
    // find the ol closest to the targetElement then find the li's position inside it
    const listItemPosition = Array.from(listItem?.parentElement?.children as HTMLCollectionOf<HTMLLIElement>).findIndex(
      item => item === listItem,
    )

    const payload: UpdateItemTitleMDPayload = {
      operation: 'update_item_title',
      position: [blockPosition, listItemPosition],
      value: input.value,
      formId: form?.id || '',
    }

    const renderedTitle = Array.from(this.renderedTitles).find(node => listItem?.contains(node))
    const oldRenderedHTML = renderedTitle?.innerHTML

    if (renderedTitle) {
      const html = await this.transformMarkdownToHTML(input.value)
      // eslint-disable-next-line github/unescaped-html-literal
      renderedTitle.innerHTML = `<span class="wb-break-word">${html}</span>`
    }

    try {
      await this.apiComponent?.updateDraftItemTitleMD(payload)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)

      if (renderedTitle) renderedTitle.innerHTML = oldRenderedHTML || ''
    }
  }

  async updateTaskItemStateMD(event: Event) {
    if (!this.#canSync()) return

    const input = event.currentTarget as HTMLInputElement | null

    // Ignore bubbled events
    if (event.target !== input) return

    const targetElement = event.target as HTMLElement | null
    if (!targetElement) return

    const {form, comment} = this.findFormAndCommentElements()
    const listItem = targetElement.closest<HTMLLIElement>('li')
    const trackingBlock = targetElement.closest('tracking-block')!
    const trackingBlocks = Array.from(comment.querySelectorAll('tracking-block'))
    const blockPosition = trackingBlocks.findIndex(block => block === trackingBlock)
    // find the ol closest to the targetElement then find the li's position inside it
    const listItemPosition = Array.from(listItem?.parentElement?.children as HTMLCollectionOf<HTMLLIElement>).findIndex(
      item => item === listItem,
    )

    if (!input || input.type !== 'checkbox') return

    // Optimistically update item state
    if (listItem) listItem.setAttribute(semanticAttributes.itemState, input.checked ? 'draftClosed' : 'draft')

    // Optimistically update the progress pill based on the event type
    this.#updateCompletion({
      dirty: true,
      completed: this.completionCompleted + (input.checked ? 1 : -1),
    })

    const payload: UpdateItemStateMDPayload = {
      operation: 'update_item_state',
      position: [blockPosition, listItemPosition],
      closed: input.checked,
      formId: form?.id || '',
    }

    try {
      await this.apiComponent?.updateDraftItemStateMD(payload)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)

      // If the request fails, revert the optimistic update to completion
      this.#updateCompletion({
        dirty: false,
        completed: this.completionCompleted + (input.checked ? -1 : 1),
      })
    }
  }

  async removeTasklistBlock(event: Event) {
    if (!this.#canSync()) return

    const trigger = event.target as HTMLElement | null
    if (!trigger) return

    const {form, comment} = this.findFormAndCommentElements()
    const trackingBlock = trigger.closest('tracking-block')!
    const trackingBlocks = Array.from(comment.querySelectorAll('tracking-block'))
    const position = trackingBlocks.findIndex(block => block === trackingBlock)

    const payload: RemoveTasklistBlockMDPayload = {
      operation: 'remove_tasklist_block',
      formId: form?.id || '',
      position,
    }

    // Optimistically hide the tasklist block
    this.hidden = true

    try {
      await this.apiComponent!.removeTasklistBlock(payload)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)

      // If the request fails, revert the optimistic update
      this.hidden = false
    }

    const menu = trigger.closest<HTMLElement>('details-menu')
    if (!menu) return
    menu.style.display = 'none'
  }

  async updateItemPosition(event: SortableEvent) {
    if (!this.#canSync()) return

    const {oldIndex, newIndex} = event

    const {form, comment} = this.findFormAndCommentElements()
    const trackingBlocks = Array.from(comment.querySelectorAll('tracking-block'))
    const srcTrackingBlock = event.from!.closest('tracking-block')!
    const dstTrackingBlock = event.to!.closest('tracking-block')!
    const srcTrackingBlockPosition = trackingBlocks.findIndex(block => block === srcTrackingBlock)
    const dstTrackingBlockPosition = trackingBlocks.findIndex(block => block === dstTrackingBlock)

    if (srcTrackingBlockPosition === -1) return
    if (dstTrackingBlockPosition === -1) return
    if (oldIndex == null) return
    if (newIndex == null) return

    const payload: UpdateItemPositionMDPayload = {
      operation: 'update_item_position',
      src: [srcTrackingBlockPosition, oldIndex],
      dst: [dstTrackingBlockPosition, newIndex],
      formId: form?.id || '',
    }

    try {
      await this.apiComponent!.updateItemPositionMD(payload)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  async convertTaskItemMD(listItem: HTMLElement) {
    if (!this.#canSync() || !this.#isListItemDraftIssue(listItem)) return

    const {form, comment} = this.findFormAndCommentElements()
    const trackingBlock = listItem.closest<HTMLDivElement>('tracking-block')!
    const trackingBlocks = Array.from(comment.querySelectorAll('tracking-block'))
    const blockPosition = trackingBlocks.findIndex(block => block === trackingBlock)
    // find the ol closest to the listItem then find the li's position inside it
    const listItemPosition = Array.from(listItem.parentElement?.children as HTMLCollectionOf<HTMLLIElement>).findIndex(
      item => item === listItem,
    )
    if (listItemPosition === -1) return // item position not found in list

    const payload: ConvertToIssueMDPayload = {
      operation: 'convert_to_issue',
      position: [blockPosition, listItemPosition],
      formId: form?.id || '',
    }

    try {
      await this.apiComponent!.convertToIssueMD(payload)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  async removeTaskItemMD(listItem: HTMLElement, payload: RemoveItemMDPayload) {
    if (!this.#canSync()) return

    const itemState = listItem.getAttribute(semanticAttributes.itemState)!
    const closed = itemState === 'closed' || itemState === 'draftClosed' || itemState === 'merged'

    // Optimistically hide the item
    listItem.hidden = true

    // Optimistically update the progress pill based on the state of the deleted item
    this.#updateCompletion({
      dirty: true,
      completed: this.completionCompleted + (closed ? -1 : 0),
      total: this.completionTotal - 1,
    })

    // Optimistically hide the item
    listItem.hidden = true

    try {
      await this.apiComponent!.removeItemMD(payload)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)

      // If the request fails, revert the optimistic update
      listItem.hidden = false
      this.#updateCompletion({
        dirty: false,
        completed: this.completionCompleted + (closed ? 1 : 0),
        total: this.completionTotal + 1,
      })
    }

    // the updateCompletion method needs the list items to be current to be accurate
    listItem.parentElement?.removeChild(listItem)
  }
  //#endregion

  #focusOmnibarInput() {
    if (!this.omnibar) return

    this.omnibarToggleButton?.toggleAttribute('hidden', true)
    this.omnibar.toggleAttribute('hidden', false)
    this.omnibar.focus()
  }

  #refocusOmnibarIfNecessary() {
    if (TrackingBlockElement.refocusOmnibarIndex == null) return
    // TODO: The refocus prevents metadata from rendering for precache tasklist blocks for some reason
    // Is there some way to make this work?
    if (this.hasAttribute('data-precache')) return

    const {comment} = this.findFormAndCommentElements()
    const trackingBlocks = comment.querySelectorAll<TrackingBlockElement>('tracking-block')
    const index = Array.from(trackingBlocks).indexOf(this)
    if (index !== TrackingBlockElement.refocusOmnibarIndex) return

    TrackingBlockElement.refocusOmnibarIndex = null

    // setTimeout is used as a workaround for a race condition in Memex
    setTimeout(() => this.#focusOmnibarInput(), 0)
  }

  lockForConversion(locked: boolean) {
    const interactiveElements = this.querySelectorAll(
      `input:not([name="_method"]), textarea, ${selectors.convertButton}`,
    )
    this.disabled = locked
    for (const [, element] of interactiveElements.entries()) {
      locked ? element.setAttribute('disabled', 'disabled') : element.removeAttribute('disabled')
    }
    this.apiComponent?.disableCommentElements(locked)
    this.#isLockedForConversion = locked
  }

  //#region [ Render ]
  #replaceListItems(listItemsFragment: DocumentFragment | null) {
    if (!this.list) return
    if (!listItemsFragment) return

    const replacements = listItemsFragment.querySelectorAll<HTMLElement>('li')
    if (!replacements) return

    this.list.replaceChildren(...replacements)
  }
  //#endregion

  //#region [ Helpers ]
  #isListItemDraftIssue(listItem: HTMLElement) {
    return listItem.hasAttribute(semanticAttributes.draftIssueType)
  }

  #isListItemIssue(listItem: HTMLElement) {
    return listItem.hasAttribute(semanticAttributes.issueType)
  }

  #isActionMenuActive(eventTarget: EventTarget) {
    if (!(eventTarget instanceof HTMLElement)) return false
    return eventTarget.getAttribute('role') === 'menuitem'
  }

  #closeMenuPopover(listItem: HTMLElement) {
    if (document.activeElement === listItem) return
    // Need to close the current popover while the new one is opening, otherwise there is an obvious flicker
    // presented to the user.
    for (const anchoredPosition of listItem.querySelectorAll<HTMLElement>('anchored-position')) {
      anchoredPosition?.hidePopover()
    }

    const actionMenuBtn = listItem.querySelector<HTMLElement>('.tracking-block-item-menu-btn')
    actionMenuBtn?.setAttribute('aria-expanded', 'false')
  }

  #updateCompletion(completion: Partial<HierarchyCompletion & {dirty: boolean}> | null) {
    if (!completion) return

    this.completionCompleted = completion.completed ?? this.completionCompleted
    this.completionTotal = completion.total ?? this.completionTotal

    // TODO: This is possible because the completion is inclusive of all tracking blocks in the issue.
    const progressComponents = document.querySelectorAll('tracked-issues-progress[data-type=tasklist_block]')
    for (const progress of progressComponents) {
      progress.setAttribute('data-completed', String(this.completionCompleted))
      progress.setAttribute('data-total', String(this.completionTotal))

      if (completion.dirty != null) {
        progress.classList.toggle('is-dirty', completion.dirty)
      }
    }

    this.#updateTasklistIconState()
  }

  // Determine whether to indicate to the user whether the task list is complete or not based on
  // each list item's state
  #updateTasklistIconState() {
    const trackingBlockIcon = this.querySelector<HTMLElement>('.js-tracking-block-completion-icon')
    const trackingBlockIconWrapper = trackingBlockIcon?.parentElement
    if (!trackingBlockIcon || !trackingBlockIconWrapper) return

    let isCompleted = this.listItems.length === 0 ? false : true
    for (const listItem of this.listItems) {
      const state = listItem.getAttribute(semanticAttributes.itemState)
      if (state !== 'closed' && state !== 'draftClosed' && state !== 'merged') {
        isCompleted = false
        break
      }
    }

    if (isCompleted) {
      trackingBlockIconWrapper.classList.remove('color-bg-open', 'color-fg-open')
      trackingBlockIconWrapper.classList.add('color-bg-done', 'color-fg-done')

      trackingBlockIcon.classList.remove('color-fg-open')
      trackingBlockIcon.classList.add('color-fg-done')
    } else {
      trackingBlockIconWrapper.classList.remove('color-bg-done', 'color-fg-done')
      trackingBlockIconWrapper.classList.add('color-bg-open', 'color-fg-open')

      trackingBlockIcon.classList.remove('color-fg-done')
      trackingBlockIcon.classList.add('color-fg-open')
    }
  }

  #updateListInteractiveStatus() {
    const isInteractive = this.#isInteractive()

    for (const input of this.inputs) {
      input.disabled = !isInteractive
    }

    for (const itemMenu of this.itemMenus) {
      itemMenu.style.display = isInteractive ? '' : 'none'
    }

    this.#updateOmnibarInteractiveStatus()
  }

  #updateOmnibarInteractiveStatus() {
    if (!this.omnibar) return

    if (this.#isInteractive()) {
      this.omnibar.style.display = ''
      this.omnibar.disabled = false
    } else if (this.readonly || !this.#canSync()) {
      this.omnibar.style.display = 'none'
    } else {
      this.omnibar.disabled = true
    }
  }

  #getSelectorByName(name: SelectorNameType) {
    return selectors[name]
  }

  #getTargetBySelector(element: HTMLElement | null, selectorName: SelectorNameType): HTMLElement | null {
    if (!element) return null

    const selector = this.#getSelectorByName(selectorName)
    if (element.matches(selector)) return element

    return element.closest(selector)
  }

  #getSiblingTargetBySelector(
    element: HTMLElement | null,
    selectorName: SelectorNameType,
    siblingSelectorName: string,
  ): HTMLElement | null {
    if (!element) return null

    const container = this.#getTargetBySelector(element, selectorName)
    if (!container) return null

    return container.querySelector<HTMLElement>(siblingSelectorName)
  }

  #isInteractive() {
    return !this.readonly && !this.disabled
  }

  #canSync() {
    return this.apiComponent?.canSync ?? false
  }

  #createApiComponent() {
    const {comment} = this.findFormAndCommentElements()

    this.apiComponent = new TrackingBlockAPIComponent(comment, this).init()
    if (!this.apiComponent.canSync) {
      this.readonly = true
    }
  }
  //#endregion
}
