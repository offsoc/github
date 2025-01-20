import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {
  FetchDataEvent,
  FilterItem,
  type FilterProvider,
  type Icon,
  type QueryEvent,
} from '@github-ui/query-builder-element/query-builder-api'
import {hasMatch, score} from 'fzy.js'

import {AsyncFilterProvider} from './async-filter-provider'

const USER_SUGGESTION_ENDPOINT = '/filter-suggestions/users'
const AT_ME_VALUE = '@me'

export class UserFilterProvider extends AsyncFilterProvider implements FilterProvider {
  type = 'filter' as const
  icon = 'person' as Icon
  name: string
  description: string
  priority: number
  singularItemName: string
  value: string
  currentUserLogin?: string
  currentUserAvatarUrl?: string

  /// If true, the user login will be used instead of @me
  /// This is useful for newsies, because '@me' is not a valid user filter
  useLogin: boolean

  constructor(
    queryBuilder: QueryBuilderElement,
    {
      name,
      value,
      icon,
      priority,
      useLogin = false,
    }: {
      name: string
      value: string
      icon: Icon
      description: string
      priority: number
      useLogin?: boolean
    },
    currentUserLogin?: string,
    currentUserAvatarUrl?: string,
    repositoryScope?: string,
  ) {
    super(USER_SUGGESTION_ENDPOINT, repositoryScope)

    this.name = name
    this.singularItemName = name
    this.value = value
    this.icon = icon
    this.priority = priority
    this.currentUserLogin = currentUserLogin
    this.currentUserAvatarUrl = currentUserAvatarUrl
    this.useLogin = useLogin

    queryBuilder.addEventListener('query', this)
    queryBuilder.attachProvider(this)
  }

  async handleEvent(event: QueryEvent) {
    const lastElement = event.parsedQuery.at(-1)!

    if (
      (lastElement.value !== '' || this.priority <= 5) &&
      lastElement?.type !== 'filter' &&
      !event.parsedQuery.some(e => e.type === 'filter' && e.filter === this.value) &&
      (hasMatch(lastElement?.value, this.name) || hasMatch(lastElement?.value, this.value))
    ) {
      this.dispatchEvent(new Event('show'))
    }

    if (lastElement?.type !== this.type || lastElement.filter !== this.value) return

    this.abortPreviousRequests()
    const fetchPromise = this.fetchAndEmitData(event)

    this.dispatchEvent(new FetchDataEvent(fetchPromise))
  }

  async fetchAndEmitData(event: QueryEvent): Promise<void> {
    const response = await this.fetchData(event)
    if (!response || !response.ok) return

    const lastElement = event.parsedQuery.at(-1)!
    const users = (await response.json()).users
    const showAtMe =
      (lastElement.value === '' || hasMatch(lastElement.value, AT_ME_VALUE)) && this.currentUserLogin !== ''
    if (showAtMe) {
      this.emitSuggestion(
        this.useLogin ? this.currentUserLogin ?? '' : AT_ME_VALUE,
        '',
        this.currentUserAvatarUrl,
        lastElement.value,
      )
    }

    for (const user of users) {
      // If we are showing @me, don't show yourself
      if (showAtMe && user.login === this.currentUserLogin) {
        continue
      }

      this.emitSuggestion(user.login, user.name, user.avatarUrl, lastElement.value)
    }
  }

  emitSuggestion(login: string, name: string, avatarUrl: string | undefined, query: string) {
    let priority = 3

    if (query) {
      // Weight the score more heavily by login, then influence by name
      const loginWeighting = 0.75
      priority -= score(query, login) * loginWeighting
      priority -= score(query, name) * (1 - loginWeighting)
    }

    // We want to have @me at the top if it's included
    if (login === AT_ME_VALUE) {
      priority = 1
    }

    this.dispatchEvent(
      new FilterItem({
        filter: this.value,
        value: login,
        description: name,
        inlineDescription: true,
        priority,
        icon: this.icon,
        avatar: avatarUrl
          ? {
              url: avatarUrl,
              type: 'user',
            }
          : undefined,
      }),
    )
  }
}
