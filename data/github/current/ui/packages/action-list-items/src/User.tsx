import {GitHubAvatar} from '@github-ui/github-avatar'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {testIdProps} from '@github-ui/test-id-props'
import {ActionList, type ActionListItemProps, Radio} from '@primer/react'

import type {SelectType, SelectTypeProps} from '../common/types'
import styles from './User.module.css'

type ActionListItemUserCommonProps = {
  avatarUrl: string
  fullName: string
  username: string
  selected?: boolean
} & ActionListItemProps

export type ActionListItemUserProps = ActionListItemUserCommonProps & SelectTypeProps

export function ActionListItemUser({
  avatarUrl,
  fullName,
  username,
  selectType,
  selected,
  radioGroupName,
  ...props
}: ActionListItemUserProps) {
  const isNativeActionListItemSelection = selectType === 'multiple' || selectType === 'instant'
  const hasCustomLeadingVisual = selectType === 'single'

  const leadingVisualIcon = (
    <GitHubAvatar src={avatarUrl} size={20} alt={`@${username}`} className={styles.GitHubAvatar_0} />
  )
  return (
    <ActionList.Item key={username} {...props} {...(isNativeActionListItemSelection ? {selected} : {})}>
      {hasCustomLeadingVisual ? (
        <ActionList.LeadingVisual className={styles.ActionList_LeadingVisual_0}>
          {selectType === 'single' && (
            <Radio
              name={radioGroupName}
              value={username}
              checked={selected}
              className={styles.Radio_0}
              {...testIdProps('user-radio')}
            />
          )}
          {leadingVisualIcon}
        </ActionList.LeadingVisual>
      ) : (
        <ActionList.LeadingVisual>{leadingVisualIcon}</ActionList.LeadingVisual>
      )}
      {username}
      <ActionList.Description variant="inline">{fullName}</ActionList.Description>
    </ActionList.Item>
  )
}

export function ActionListItemUserSkeleton({selectType}: {selectType: SelectType}) {
  return (
    <div className={styles.Box_0} {...testIdProps('loading-skeleton')}>
      {/* The width needs to be larger than the height to make a square */}
      {selectType !== 'action' && <LoadingSkeleton variant="rounded" width="md" />}
      <LoadingSkeleton variant="elliptical" height="21px" width="21px" className={styles.LoadingSkeleton_0} />
      <LoadingSkeleton variant="rounded" height="sm" className={styles.LoadingSkeleton_1} />
    </div>
  )
}
