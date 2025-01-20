import {createContext, memo, useCallback, useContext, useMemo, useState} from 'react'

import {apiDismissNotice} from '../../api/notice/api-dismiss-notice'
import {DismissedUserNotice} from '../../api/stats/contracts'
import type {EnabledUserNoticesMap, UserNotice} from '../../api/user-notices/contracts'
import {allUserNoticesDisabled, userNotices as allUserNotices} from '../../api/user-notices/contracts'
import {fetchJSONIslandData} from '../../helpers/json-island'
import {usePostStats} from '../../hooks/common/use-post-stats'

export type NoticeVariant = 'modal' | 'unset'
export type NoticeVariantMap = {[P in UserNotice]: NoticeVariant}

type UserNoticesContextType = {
  /**
   *  Dismisses a user notice so that it will no longer be visible to the user.
   *
   * @param notice The notice to dismiss.
   * @param tookAction Did the user take action as designated via notice.
   */
  dismissUserNotice: (notice: UserNotice, tookAction?: boolean) => Promise<void>
  /**
   *  Hides a user notice without dismissing it
   *
   * @param notice The notice to dismiss.
   */
  hideUserNotice: (notice: UserNotice) => void
  /**
   * A map containing the enabled state of each user notice.
   */
  userNotices: EnabledUserNoticesMap
  /**
   * A map containing the variant of each user notice. Used if a popover opens a modal to dismiss.
   */
  userNoticeVariants: NoticeVariantMap
  /**
   *  Sets the variant of a user notice.
   *  Useful for multi-step notices (e.g. returning to popover from a modal)
   *
   * @param notice The notice to dismiss.
   */
  setUserNoticeVariant: (notice: UserNotice, variant: NoticeVariant) => void
}

export const UserNoticesContext = createContext<UserNoticesContextType | null | undefined>(null)

const getInitialUserNotices = () => {
  const notices: EnabledUserNoticesMap = {...allUserNoticesDisabled}
  const jsonIslandNotices = fetchJSONIslandData('memex-user-notices')
  if (jsonIslandNotices) {
    for (const notice of jsonIslandNotices) {
      notices[notice] = true
    }
  }

  return notices
}

const getInitialNoticeVariants = () => {
  return allUserNotices.reduce((map, current) => {
    map[current] = 'unset'
    return map
  }, {} as NoticeVariantMap)
}

export const UserNoticesStateProvider = memo(function UserNoticesStateProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [userNotices, setUserNotices] = useState<EnabledUserNoticesMap>(() => getInitialUserNotices())
  const [userNoticeVariants, setUserNoticeVariants] = useState<NoticeVariantMap>(() => getInitialNoticeVariants())
  const {postStats} = usePostStats()

  const setUserNoticeVariant = useCallback((notice: UserNotice, kind: NoticeVariant) => {
    setUserNoticeVariants(prev => ({...prev, [notice]: kind}))
  }, [])

  const hideUserNotice = useCallback(
    async (notice: UserNotice) => {
      setUserNotices(prev => ({...prev, [notice]: false}))
      setUserNoticeVariant(notice, 'unset')
    },
    [setUserNoticeVariant],
  )

  const dismissUserNotice = useCallback(
    async (notice: UserNotice, tookAction = false) => {
      hideUserNotice(notice)
      try {
        await apiDismissNotice({notice})
        postStats({
          name: DismissedUserNotice,
          context: JSON.stringify({
            notice,
            tookAction,
          }),
        })
      } catch (_error) {
        /**
         * swallow: ignore potentially disruptive dismissal errors.
         * if the user notice is not dismissed, it will be shown again on the next page load.
         */
      }
    },
    [hideUserNotice, postStats],
  )

  const contextValue = useMemo<UserNoticesContextType>(
    () => ({
      userNotices,
      hideUserNotice,
      dismissUserNotice,
      userNoticeVariants,
      setUserNoticeVariant,
    }),
    [userNotices, hideUserNotice, dismissUserNotice, userNoticeVariants, setUserNoticeVariant],
  )

  return <UserNoticesContext.Provider value={contextValue}>{children}</UserNoticesContext.Provider>
})

/**
 * This hooks exposes the context value of the UserNoticesStateProvider.
 */
export const useUserNotices = (): UserNoticesContextType => {
  const contextValue = useContext(UserNoticesContext)

  if (!contextValue) {
    throw new Error('useUserNotices must be used within a UserNoticesContext.Provider')
  }

  return contextValue
}
