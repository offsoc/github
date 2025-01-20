import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {testIdProps} from '@github-ui/test-id-props'
import {ProjectIcon, TableIcon} from '@primer/octicons-react'
import {ActionList, type ActionListItemProps, Radio} from '@primer/react'

import type {SelectType, SelectTypeProps} from '../common/types'
import styles from './Project.module.css'

type ActionListItemProjectCommonProps = {
  /*
   * name: The title of the project
   */
  name: string
  isClassic?: boolean
  selected?: boolean
} & ActionListItemProps

export type ActionListItemProjectProps = ActionListItemProjectCommonProps & SelectTypeProps

export function ActionListItemProject({
  isClassic = false,
  name,
  selectType,
  selected,
  radioGroupName,
  ...props
}: ActionListItemProjectProps) {
  const isNativeActionListItemSelection = selectType === 'multiple' || selectType === 'instant'
  const hasCustomLeadingVisual = selectType === 'single'

  const leadingVisualIcon = isClassic ? <ProjectIcon /> : <TableIcon />

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
              {...testIdProps('project-radio')}
            />
          )}
          {leadingVisualIcon}
        </ActionList.LeadingVisual>
      ) : (
        <ActionList.LeadingVisual>{leadingVisualIcon}</ActionList.LeadingVisual>
      )}
      <div className={styles.Box_0}>{name}</div>
    </ActionList.Item>
  )
}

export function ActionListItemProjectSkeleton({selectType}: {selectType: SelectType}) {
  return (
    <div className={styles.Box_1} {...testIdProps('loading-skeleton')}>
      {/* The width needs to be larger than the height to make a square */}
      {selectType !== 'action' && <LoadingSkeleton variant="rounded" width="md" />}
      <LoadingSkeleton variant="rounded" height="17px" width="17px" className={styles.LoadingSkeleton_0} />
      <LoadingSkeleton variant="rounded" height="sm" className={styles.LoadingSkeleton_1} />
    </div>
  )
}
