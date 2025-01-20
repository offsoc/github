import {GitHubAvatar} from '@github-ui/github-avatar'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {testIdProps} from '@github-ui/test-id-props'
import {ArrowRightIcon} from '@primer/octicons-react'
import {ActionList, type ActionListItemProps, Radio} from '@primer/react'

import type {SelectType, SelectTypeProps} from '../common/types'
import styles from './Repository.module.css'

type ActionListItemRepositoryCommonProps = {
  nameWithOwner: string
  ownerAvatarUrl: string
  selected?: boolean
  showTrailingVisual?: boolean
} & ActionListItemProps

export type ActionListItemRepositoryProps = ActionListItemRepositoryCommonProps & SelectTypeProps

export function ActionListItemRepository({
  nameWithOwner,
  ownerAvatarUrl,
  selectType,
  selected,
  showTrailingVisual,
  radioGroupName,
  ...props
}: ActionListItemRepositoryProps) {
  const isNativeActionListItemSelection = selectType === 'multiple' || selectType === 'instant'
  const hasCustomLeadingVisual = selectType === 'single'

  const ownerAvatar = (
    <GitHubAvatar
      src={ownerAvatarUrl}
      size={20}
      alt={`avatar image of ${nameWithOwner}`}
      className={styles.GitHubAvatar_0}
    />
  )

  return (
    <ActionList.Item key={nameWithOwner} {...props} {...(isNativeActionListItemSelection ? {selected} : {})}>
      {hasCustomLeadingVisual ? (
        <ActionList.LeadingVisual className={styles.ActionList_LeadingVisual_0}>
          {selectType === 'single' && (
            <Radio
              name={radioGroupName}
              value={nameWithOwner}
              checked={selected}
              className={styles.Radio_0}
              {...testIdProps('repository-radio')}
            />
          )}
          {ownerAvatar}
        </ActionList.LeadingVisual>
      ) : (
        <ActionList.LeadingVisual>{ownerAvatar}</ActionList.LeadingVisual>
      )}
      <span className={styles.Text_0}>{nameWithOwner}</span>
      {showTrailingVisual && (
        <ActionList.TrailingVisual>
          <ArrowRightIcon size={16} />
        </ActionList.TrailingVisual>
      )}
    </ActionList.Item>
  )
}

export function ActionListItemRepositorySkeleton({selectType}: {selectType: SelectType}) {
  return (
    <div className={styles.Box_1} {...testIdProps('loading-skeleton')}>
      {/* The width needs to be larger than the height to make a square */}
      {selectType !== 'action' && <LoadingSkeleton variant="rounded" width="md" />}
      <LoadingSkeleton variant="elliptical" height="21px" width="21px" className={styles.LoadingSkeleton_0} />
      <LoadingSkeleton variant="rounded" height="sm" className={styles.LoadingSkeleton_1} />
    </div>
  )
}
