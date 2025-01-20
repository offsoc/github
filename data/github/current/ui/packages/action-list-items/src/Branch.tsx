import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {testIdProps} from '@github-ui/test-id-props'
import {GitBranchIcon} from '@primer/octicons-react'
import {ActionList, type ActionListItemProps, Radio} from '@primer/react'

import type {SelectType, SelectTypeProps} from '../common/types'
import styles from './Branch.module.css'

type ActionListItemBranchCommonProps = {
  /*
   * name: The title of the pull request or branch.
   */
  name: string
  selected?: boolean
} & ActionListItemProps

export type ActionListItemBranchProps = ActionListItemBranchCommonProps & SelectTypeProps

export function ActionListItemBranch({
  name,
  selectType,
  selected,
  radioGroupName,
  ...props
}: ActionListItemBranchProps) {
  const isNativeActionListItemSelection = selectType === 'multiple' || selectType === 'instant'
  const hasCustomLeadingVisual = selectType === 'single'

  return (
    <ActionList.Item key={name} {...props} {...(isNativeActionListItemSelection ? {selected} : {})}>
      {hasCustomLeadingVisual ? (
        <ActionList.LeadingVisual className={styles.ActionList_LeadingVisual_0}>
          {selectType === 'single' && (
            <Radio
              name={radioGroupName}
              value={name}
              checked={selected}
              className={styles.Radio_0}
              {...testIdProps('pull-request-or-branch-radio')}
            />
          )}
          <GitBranchIcon />
        </ActionList.LeadingVisual>
      ) : (
        <ActionList.LeadingVisual>
          <GitBranchIcon />
        </ActionList.LeadingVisual>
      )}
      <div className={styles.Box_0}>{name}</div>
    </ActionList.Item>
  )
}

export function ActionListItemBranchSkeleton({selectType}: {selectType: SelectType}) {
  return (
    <div className={styles.Box_1} {...testIdProps('loading-skeleton')}>
      {/* The width needs to be larger than the height to make a square */}
      {selectType !== 'action' && <LoadingSkeleton variant="rounded" width="md" />}
      <LoadingSkeleton variant="rounded" height="17px" width="17px" className={styles.LoadingSkeleton_0} />
      <LoadingSkeleton variant="rounded" height="sm" className={styles.LoadingSkeleton_1} />
    </div>
  )
}
