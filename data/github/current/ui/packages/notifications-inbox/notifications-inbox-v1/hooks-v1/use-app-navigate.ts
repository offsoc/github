import {useInputElementActiveContext} from '@github-ui/issue-viewer/InputElementActiveContext'
import {issueUrl} from '@github-ui/issue-viewer/Urls'
import {useCommentEditsContext} from '@github-ui/commenting/CommentEditsContext'
import {useNavigate} from '@github-ui/use-navigate'
import {useCallback} from 'react'
import type {NavigateOptions, To} from 'react-router-dom'

import {notificationSearchUrl, notificationUrl} from '../../notifications/utils/urls'
import {MESSAGES} from '../../constants'

// regexp to extract the owner, repo and issue number from a url
const issueRegexp =
  /https?:\/\/github\.(com|localhost|localhost:\d+)\/(?<owner>.*)\/(?<repo>.*)\/issues\/(?<number>\d+)/

export const useAppNavigate = () => {
  const {isAnyInputElementActive} = useInputElementActiveContext()
  const {isCommentEditActive, cancelAllCommentEdits} = useCommentEditsContext()
  const navigate = useNavigate()

  const navigateToUrl = useCallback(
    (to: To, options?: NavigateOptions) => {
      if (isAnyInputElementActive) {
        return
      }
      if (isCommentEditActive()) {
        const confirmed = confirm(MESSAGES.confirmLeave)
        if (!confirmed) {
          return
        }
        cancelAllCommentEdits()
      }
      navigate(to, options)
    },
    [cancelAllCommentEdits, isAnyInputElementActive, isCommentEditActive, navigate],
  )

  const onIssueHrefLinkClick = useCallback(
    (event: MouseEvent) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (event.metaKey || event.shiftKey || event.button === 1) return

      let href = ''
      if (event.currentTarget instanceof HTMLAnchorElement) {
        href = event.currentTarget.href
      } else if (event.target instanceof HTMLAnchorElement) {
        href = event.target.href
      }

      if (href?.length > 0) {
        const match = href.match(issueRegexp)
        if (match && match.groups) {
          const {owner: _owner, repo: _repo, number: _number} = match.groups
          if (_owner && _repo && _number) {
            event.preventDefault()
            const to = issueUrl({owner: _owner, repo: _repo, number: parseInt(_number)})
            navigate(to)
          }
        }
      }
    },
    [navigate],
  )

  const navigateToNotification = (notificationId: string, options?: NavigateOptions) => {
    navigateToUrl(notificationUrl(notificationId), options)
  }

  const navigateToNotificationSearch = useCallback(
    (query?: string, view?: string) => {
      navigate(notificationSearchUrl({query, view}))
    },
    [navigate],
  )

  return {
    onIssueHrefLinkClick,
    navigateToUrl,
    navigateToNotification,
    navigateToNotificationSearch,
  }
}
