import type {RepositoryClickTarget, RepositoryStats, RepositoryUIEventTarget} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {getRelativeHref, repositoryStatsPath} from '@github-ui/paths'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useAnalytics} from '@github-ui/use-analytics'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useCallback, useMemo} from 'react'
import {useCurrentUser} from '@github-ui/current-user'

type EventContext = Record<string, string | number | boolean>

type SendRepoEventFunction = (target: RepositoryClickTarget, context?: EventContext) => void
type SendRepoStatsFunction = (type: RepositoryStats, context?: EventContext) => void

/**
 * Use this hook to send user analytics events to the data warehouse.
 * Please note that this hook uses `sendEvent` helper,
 * which enriches event context with additional information about the user, repository, and current page.
 * See: https://thehub.github.com/epd/engineering/products-and-services/internal/hydro/installation/browser-events/
 *
 * You can find a list of all included context properties in `app/helpers/octolytics_helper.rb`.
 * The majority of the events don't require additional context properties as they are sent by default,
 * so check the existing properties in `octolytics_helper` before adding new ones.
 *
 * "repository.click" represents an umbrella event for all repository clicks.
 * "target" is the name of the UI element associated with the event.
 *
 * @example
 * ```tsx
 * function Component() {
 *   const { sendRepoClickEvent } = useReposAnalytics()
 *   return <Button onClick={() => sendRepoClickEvent('FIND_FILE_BUTTON')}>Find file</Button>
 * }
 * ```
 *
 */
export function useReposAnalytics(): {
  sendRepoClickEvent: SendRepoEventFunction
  sendRepoKeyDownEvent: SendRepoEventFunction
  sendStats: SendRepoStatsFunction
  sendMarketplaceActionEvent: SendRepoEventFunction
} {
  const {sendAnalyticsEvent} = useAnalytics()
  const sendReposUIEvent = useSendReposUIEvent()
  const shouldUseUIEventTable = useFeatureFlag('code_nav_ui_events')

  return {
    sendRepoClickEvent: useCallback(
      (target, payload = {}) => {
        sendAnalyticsEvent('repository.click', target, payload)
        if (shouldUseUIEventTable) {
          sendReposUIEvent(target, 'click', payload)
        }
      },
      [sendAnalyticsEvent, sendReposUIEvent, shouldUseUIEventTable],
    ),
    sendRepoKeyDownEvent: useCallback(
      (target, payload = {}) => {
        sendAnalyticsEvent('repository.keydown', target, payload)
        if (shouldUseUIEventTable) {
          sendReposUIEvent(target, 'keydown', payload)
        }
      },
      [sendAnalyticsEvent, sendReposUIEvent, shouldUseUIEventTable],
    ),
    sendStats: useCallback(
      (type, payload = {}) => {
        sendAnalyticsEvent(type, '', payload)
        if (shouldUseUIEventTable) {
          sendReposUIEvent(type, 'stats', payload)
        }
      },
      [sendAnalyticsEvent, sendReposUIEvent, shouldUseUIEventTable],
    ),
    sendMarketplaceActionEvent: useCallback(
      (target, payload = {}) => {
        sendAnalyticsEvent('marketplace.action.click', target, payload)
      },
      [sendAnalyticsEvent],
    ),
  }
}

function useSendReposUIEvent() {
  const repoMetadata = useRepositoryEventMetadata()
  const repo = useCurrentRepository()
  const statsPath = getRelativeHref(repositoryStatsPath, {owner: repo.ownerLogin, repo: repo.name})

  return useCallback(
    (target: RepositoryUIEventTarget, interaction: Interaction, context: EventContext) => {
      const method = 'POST'
      const body: RepositoryUIEvent = {
        target,
        interaction,
        context,
        ...repoMetadata,
        ...getBrowserEventMetadata(),
      } as RepositoryUIEvent

      verifiedFetchJSON(statsPath, {method, body})
    },
    [repoMetadata, statsPath],
  )
}

type Interaction = 'click' | 'keydown' | 'stats'

interface RepositoryUIEvent {
  target: RepositoryUIEventTarget
  interaction: Interaction
  performed_at?: number
  context?: EventContext
  repository_id: number
  repository_nwo: string
  repository_public: boolean
  repository_is_fork: boolean
  react_app: string
  actor_id?: number
  actor_login?: string
  url: string
  user_agent: string
  browser_width: number
  browser_languages: string
}

type BrowserEventMetadata = Pick<RepositoryUIEvent, 'url' | 'user_agent' | 'browser_width' | 'browser_languages'>

function getBrowserEventMetadata(): BrowserEventMetadata {
  return {
    url: window.location.href,
    user_agent: window.navigator.userAgent,
    browser_width: window.innerWidth,
    browser_languages: window.navigator.languages.join(','),
  }
}

type RepositoryEventMetadata = Pick<
  RepositoryUIEvent,
  | 'react_app'
  | 'repository_id'
  | 'repository_nwo'
  | 'repository_public'
  | 'repository_is_fork'
  | 'actor_id'
  | 'actor_login'
>

function useRepositoryEventMetadata(): RepositoryEventMetadata {
  const repo = useCurrentRepository()
  const actor = useCurrentUser()

  return useMemo(
    () => ({
      react_app: 'code-view',
      repository_id: repo.id,
      repository_nwo: `${repo.ownerLogin}/${repo.name}`,
      repository_public: repo.public,
      repository_is_fork: repo.isFork,
      actor_id: actor?.id,
      actor_login: actor?.login,
    }),
    [repo, actor],
  )
}
