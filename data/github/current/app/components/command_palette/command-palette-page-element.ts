import type {Item, Octicon, Page, Provider, ProviderResponse} from '@github-ui/command-palette'
import {attr, controller} from '@github/catalyst'
import {CommandPaletteItemElement} from '../../assets/modules/github/command-palette/command-palette-item-element'
import {CommandPaletteItemGroupElement} from '../../assets/modules/github/command-palette/command-palette-item-group-element'
import {GlobalProvidersPage} from '../../assets/modules/github/command-palette/pages/global-providers-page'
import type {OcticonSvgs} from './command-palette-page-stack-element'
import {Query} from '../../assets/modules/github/command-palette/query'
import type {Scope} from '../../assets/modules/github/command-palette/command-palette-scope-element'
import {debounce} from '@github/mini-throttle/decorators'
import {ServerDefinedProvider} from '../../assets/modules/github/command-palette/providers/server-defined-provider'

type PageProps = {
  page?: Page
  hidden?: boolean
  defaultScopeId?: string
  defaultScopeType?: string
}

@controller
export class CommandPalettePageElement extends HTMLElement {
  static TopResultThreshold = 6.5

  @attr isRoot = false
  @attr pageTitle = ''
  @attr scopeId = ''
  @attr scopeType = ''
  @attr hasVisibleTip = false

  currentHeight = 0
  octicons: OcticonSvgs = {}
  #query: Query
  requestsInProgress: Array<Array<Promise<void>>> = []
  #page: Page | undefined

  /*
    This constructor should only used for attribute setting.
    Other setup should be performed in `connectedCallback`.
    See https://github.github.io/catalyst/guide/anti-patterns/
  */
  /* eslint-disable-next-line custom-elements/no-constructor */
  constructor(props: PageProps = {}) {
    super()

    this.hidden = props.hidden ?? true
    this.page = props.page

    this.#query = new Query('', '', {
      scope: this.scope,
      subjectId: props.defaultScopeId,
      subjectType: props.defaultScopeType,
    })
  }

  tryDefaultSelection = true

  // a cache of Items organized by query path
  items: {
    [queryPath: string]: Item[]
  } = {}

  get providers(): Provider[] {
    return this.page?.providers || []
  }

  get query(): Query {
    return this.#query
  }

  set query(newQuery: Query) {
    // Take any existing items that we know about and add them to the new query's cache immediately
    // This prevents items from briefly disappearing between each keystroke
    if (!this.items[newQuery.path]) {
      this.items[newQuery.path] = this.currentItems.filter(item => {
        return item.calculateScore(newQuery.text) > 0
      })
    }

    this.#query = newQuery
  }

  get scope(): Scope {
    return {
      text: this.pageTitle,
      type: this.scopeType,
      id: this.scopeId,
      tokens: [],
    }
  }

  get selectedItem(): CommandPaletteItemElement | undefined {
    return this.findSelectedElement()
  }

  set selectedItem(newSelection: CommandPaletteItemElement | undefined) {
    const currentlySelected = this.findSelectedElement()

    if (currentlySelected) {
      currentlySelected.selected = false
    }

    if (newSelection) {
      newSelection.selected = true
      this.selectedItemChanged(newSelection.item)
    }
  }

  get page(): Page | undefined {
    return this.#page
  }

  set page(page: Page | undefined) {
    if (!page) return

    this.#page = page
    this.pageTitle = page.title
    this.scopeId = page.scopeId
    this.scopeType = page.scopeType
  }

  // We're unable to use Catalyst targets here since the groups get rebuilt as new results come in
  get groups(): CommandPaletteItemGroupElement[] {
    return Array.from(this.querySelectorAll<CommandPaletteItemGroupElement>('command-palette-item-group'))
  }

  get visibleGroups(): CommandPaletteItemGroupElement[] {
    return this.groups.filter(g => !g.hidden)
  }

  get currentItems(): Item[] {
    const items = this.items[this.query.path]

    if (!items) return []

    if (this.query.isBlank()) {
      // use default sort order returned from server when no query is present
      return items.sort((a, b) => b.priority - a.priority)
    } else {
      return items.sort((a, b) => {
        const aScore = a.calculateScore(this.query.text)
        const bScore = b.calculateScore(this.query.text)

        // sort by score and then use priority as a tie-breaker
        return bScore - aScore || b.priority - a.priority
      })
    }
  }

  get firstItem(): CommandPaletteItemElement | undefined {
    const visibleGroups = this.visibleGroups

    if (visibleGroups.length > 0) {
      return visibleGroups[0]!.querySelector<CommandPaletteItemElement>('command-palette-item')!
    }
  }

  get shouldSetDefaultSelection(): boolean {
    return this.tryDefaultSelection && this.query.isPresent()
  }

  get isSelectedItemInvalid() {
    return !this.currentItems.some(item => item.id === this.selectedItem?.itemId)
  }

  updateSelectedItem() {
    // Reset selected item if it is no longer in the list
    if (this.isSelectedItemInvalid) {
      this.clearSelection()
    }

    if (this.setDefaultSelection()) {
      this.selectedItem = this.firstItem
    }
  }

  setDefaultSelection() {
    const inScopeOrSearch = this.query.hasScope() || this.query.isPresent()
    return this.tryDefaultSelection && inScopeOrSearch
  }

  clearSelection() {
    this.selectedItem = undefined
  }

  findSelectedElement(): CommandPaletteItemElement | undefined {
    return this.querySelector<CommandPaletteItemElement>('command-palette-item[data-selected]')!
  }

  findGroup(groupId: string): CommandPaletteItemGroupElement {
    return this.groups.find(g => g.groupId === groupId)!
  }

  navigate(indexDiff: number) {
    this.tryDefaultSelection = false

    const movingDownward = indexDiff > 0

    const scrollOptions = {
      behavior: 'smooth',
      block: 'nearest',
    } as ScrollIntoViewOptions

    if (this.selectedItem) {
      let next

      if (movingDownward) {
        next = this.selectedItem?.nextElementSibling as CommandPaletteItemElement
      } else {
        next = this.selectedItem?.previousElementSibling as CommandPaletteItemElement
      }

      if (next) {
        this.selectedItem = next
        this.selectedItem.scrollIntoView(scrollOptions)
      } else if (this.selectedItem) {
        // move to next/previous visible group
        const nextGroup = this.visibleGroups[this.calculateIndex(indexDiff)]!
        nextGroup.scrollIntoView(scrollOptions)

        if (movingDownward) {
          this.selectedItem = nextGroup.firstItem
        } else {
          this.selectedItem = nextGroup.lastItem
        }
      }
    } else {
      this.selectedItem = this.firstItem
    }
  }

  /**
   * Calculate a valid index by adding a number (positive or negative). If the
   * index goes out of bounds, it is moved into bounds again.
   *
   * For example, if you have 3 items and the current index is 1.
   * - When you pass 1, it will return 2.
   * - When you pass 2, it will return 0.
   * - When you pass -2, it will return 2.
   *
   * JavaScript modulo operator doesn't handle negative numbers the same as
   * positive numbers so we have to do some additional work in the last line.
   *
   * @param indexDiff a positive or negative number
   * @returns new index (always in bound)
   */
  calculateIndex(indexDiff: number) {
    let currentIndex = this.visibleGroups.findIndex(group => group.groupId === this.selectedItem?.item.group)

    if (this.findGroup(CommandPaletteItemGroupElement.topGroupId).firstItem === this.selectedItem) {
      currentIndex = 0
    }

    const newIndexUnbounded = currentIndex + indexDiff
    const length = this.visibleGroups.length
    return ((newIndexUnbounded % length) + length) % length
  }

  async fetchWithDebounce(provider: Provider, query: Query, isEmpty: boolean): Promise<ProviderResponse> {
    if (provider instanceof ServerDefinedProvider) {
      return provider.element.fetchWithDebounce(query, isEmpty)
    } else {
      return provider.fetch(query, isEmpty)
    }
  }

  async fetch(providers: Provider[] = this.providers, givenOptions: {isEmpty?: boolean} = {}) {
    if (this.hidden) return

    const defaultOptions = {isEmpty: false}
    const options = {
      ...defaultOptions,
      ...givenOptions,
    }

    const query = this.query

    await this.fetchWithSpinner(
      providers.map(async provider => {
        if (!provider || !provider.enabledFor(query)) return

        // For prefetched providers, this will prefetch the data and store the results in memory
        if (provider.prefetch) await provider.prefetch(query)

        const data = await this.fetchWithDebounce(provider, query, options.isEmpty)

        if (data) {
          if (data.error) {
            this.fetchError()
          }

          if (data.octicons && data.octicons.length > 0) {
            this.cacheIcons(data.octicons, true)
          }

          if (data.results.length > 0) {
            this.addItems(query, data.results)
          }

          this.renderCurrentItems()
        }
      }),
    )

    this.itemsUpdated()
  }

  /**
   * This function uses the `requestsInProgress` array to show/hide
   * the loading spinner only when all in-flight requests have finished.
   *
   * @param promises an array of promises to be executed
   */
  async fetchWithSpinner(promises: Array<Promise<void>>) {
    // push the array of promises into the request stack
    this.requestsInProgress.push(promises)

    // show the loading spinner & perform the requests
    this.loadingStateChanged(true)
    await Promise.all(promises)

    // remove this group of requests from the request stack once they have finished
    this.requestsInProgress.splice(this.requestsInProgress.indexOf(promises), 1)

    // if there are no other requests still pending, we can hide the loading spinner
    this.loadingStateChanged(this.requestsInProgress.length > 0)
  }

  addItems(query: Query, items: Item[]) {
    if (!(query.path in this.items)) {
      this.items[query.path] = []
    }

    this.items[query.path]!.push(...items)
  }

  cacheIcons(octicons: Octicon[], dispatchEvent = false) {
    for (const octicon of octicons) {
      this.octicons[octicon.id] = octicon.svg
    }

    if (dispatchEvent) {
      this.dispatchEvent(new CustomEvent('command-palette-page-octicons-cached', {bubbles: true, detail: {octicons}}))
    }
  }

  buildGroups(items: Item[]) {
    const groupIds = [
      CommandPaletteItemGroupElement.topGroupId,
      CommandPaletteItemGroupElement.defaultGroupId,
      ...new Set(items.map(item => item.group)),
    ]

    const querySelector = groupIds.map(id => `command-palette-item-group[data-group-id="${id}"]`).join(',')
    const groupList = document.querySelectorAll<CommandPaletteItemGroupElement>(querySelector)

    for (const groupElement of groupList) {
      if (!this.querySelector(`command-palette-item-group[data-group-id="${groupElement.groupId}"]`)) {
        this.append(groupElement.cloneNode(true))
      }
    }
  }

  // Semi-hacky way to remove the top border from the first visible group,
  // but ensure that the other groups still have their top borders.
  setGroupBorders() {
    if (this.visibleGroups.length > 0) {
      this.visibleGroups[0]!.classList.remove('border-top')

      for (const group of this.visibleGroups) {
        const i = this.visibleGroups.indexOf(group)

        if (i === 0) {
          group.classList.remove('border-top')

          if (group.header) {
            group.classList.remove('py-2')
            group.classList.add('mb-2')

            if (!this.hasVisibleTip) {
              group.classList.add('mt-3')
            } else {
              group.classList.remove('mt-3')
            }
          }
        } else {
          group.classList.add('border-top')

          if (group.header) {
            group.classList.remove('mb-2', 'mt-3')
            group.classList.add('py-2')
          }
        }
      }
    }
  }

  createItemElementAndRender(item: Item, selected: boolean, queryText: string): CommandPaletteItemElement {
    const element = new CommandPaletteItemElement()
    element.setItemAttributes(item)
    element.render(selected, queryText)

    return element
  }

  @debounce(10)
  renderCurrentItems() {
    this.reset()

    const currentItems = this.currentItems
    const renderedItemIds: string[] = []

    if (currentItems && currentItems.length > 0) {
      this.buildGroups(currentItems)

      for (const item of currentItems) {
        if (renderedItemIds.indexOf(item.id) >= 0) continue

        // add the item priority for top result consideration
        const itemScore = item.calculateScore(this.query.text) + item.priority
        let groupId = item.group || CommandPaletteItemGroupElement.defaultGroupId

        if (currentItems.indexOf(item) === 0 && itemScore > CommandPalettePageElement.TopResultThreshold) {
          groupId = 'top'
        }

        const itemElement = this.createItemElementAndRender(item, false, this.query.text)
        const group = this.querySelector<CommandPaletteItemGroupElement>(
          `command-palette-item-group[data-group-id="${groupId}"]`,
        )!

        if (!group.atLimitForScopeType(this.scopeType)) {
          group.push(itemElement)
          renderedItemIds.push(item.id)

          if (item.icon) {
            if (item.icon.type === 'octicon') {
              const iconSvg = this.octicons[item.icon.id!]
              const fallbackIconSvg = this.octicons['dash-color-fg-muted']!

              itemElement.renderOcticon(iconSvg || fallbackIconSvg)
            } else if (item.icon.type === 'avatar') {
              itemElement.renderAvatar(item.icon.url!, item.icon.alt!)
            }
          } else {
            itemElement.iconElement.hidden = true
          }

          itemElement.addEventListener('mousemove', e => {
            const moved = e.movementX !== 0 || e.movementY !== 0

            if (moved && this.selectedItem?.itemId !== itemElement.itemId) {
              this.tryDefaultSelection = false
              this.selectedItem = itemElement
            }
          })
        }
      }

      if (this.shouldSetDefaultSelection) {
        this.selectedItem = this.firstItem
      }

      this.recomputeStyles()
      this.updateSelectedItem()
    }
  }

  recomputeStyles() {
    this.setGroupBorders()
    this.setMaxHeight()
  }

  // sort of like using CSS vh units, we set the max height of the results container to be a % the height of the viewport
  get maximumHeight(): number {
    const maximumPixelHeight = 475
    const percentage = 50 // the item stack should never be more than X% of the viewport height
    const percentagePixels = window.innerHeight * (percentage / 100)

    return Math.min(percentagePixels, maximumPixelHeight)
  }

  get innerContentHeight(): number {
    let height = 0

    for (const child of this.children) {
      const el = child as HTMLElement
      const style = getComputedStyle(el)
      const marginTop = parseInt(style.marginTop.replace('px', ''), 10)
      const marginBottom = parseInt(style.marginBottom.replace('px', ''), 10)
      const totalHeight = el.offsetHeight + marginTop + marginBottom

      if (el.offsetHeight > 0) {
        height += totalHeight
      }
    }

    return height
  }

  // setting the max (& min) height of the item stack will trigger a CSS transition
  // to smoothly animate as results are added and removed
  setMaxHeight() {
    // we disable the transition if the height change is too drastic (X% of max height)
    const distanceThresholdPercentage = 0.9
    const distanceThreshold = this.maximumHeight * distanceThresholdPercentage

    const newHeight = Math.round(Math.min(this.maximumHeight, this.innerContentHeight))
    const diff = Math.abs(this.currentHeight - newHeight)

    if (diff > distanceThreshold) {
      this.classList.add('no-transition')
    } else {
      this.classList.remove('no-transition')
    }

    this.setAttribute('style', `max-height:${newHeight}px; min-height:${newHeight}px;`)
    this.currentHeight = newHeight
  }

  selectedItemChanged(item: Item) {
    const event = new CustomEvent('selectedItemChanged', {
      bubbles: true,
      cancelable: true,
      detail: {
        item,
        isDefaultSelection: this.tryDefaultSelection,
      },
    })

    return this.dispatchEvent(event as CustomEvent)
  }

  loadingStateChanged(loading: boolean) {
    const event = new CustomEvent('loadingStateChanged', {
      bubbles: true,
      cancelable: true,
      detail: {
        loading,
      },
    })

    return this.dispatchEvent(event as CustomEvent)
  }

  fetchError() {
    const event = new CustomEvent('pageFetchError', {
      bubbles: true,
      cancelable: true,
    })

    return this.dispatchEvent(event as CustomEvent)
  }

  itemsUpdated() {
    const currentItems = this.currentItems
    const searchAndHelpItems = currentItems.filter(item => {
      return (
        item.group === CommandPaletteItemGroupElement.footerGroupId ||
        CommandPaletteItemGroupElement.helpGroupIds.includes(item.group)
      )
    })

    if (currentItems.length - searchAndHelpItems.length === 0 && this.requestsInProgress.length > 0) return

    const event = new CustomEvent('itemsUpdated', {
      bubbles: true,
      detail: {
        items: currentItems,
        queryPath: this.query.immutableCopy().path,
      },
    })

    return this.dispatchEvent(event)
  }

  // Called when a previously hidden page is re-shown
  reactivate(query: Query) {
    this.query = query
    this.hidden = false
    this.tryDefaultSelection = true
    this.recomputeStyles()
    this.fetch()
  }

  reset() {
    this.tryDefaultSelection = true
    this.textContent = ''
  }

  connectedCallback() {
    this.classList.add('rounded-bottom-2', 'page-stack-transition-height')
    if (!this.getAttribute('data-targets')) {
      this.setAttribute('data-targets', 'command-palette-page-stack.pages')
    }
    this.setAttribute('style', `max-height:400px;`)

    if (!this.page) {
      this.page = new GlobalProvidersPage({
        title: this.pageTitle,
        scopeId: this.scopeId,
        scopeType: this.scopeType,
      })
    }
  }

  clearItems() {
    this.items = {}
    this.reset()
  }
}
