import {type SafeHTMLString, SafeHTMLText} from '@github-ui/safe-html'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {testIdProps} from '@github-ui/test-id-props'
import {ActionList, type ActionListItemProps, Radio} from '@primer/react'

import type {SelectType, SelectTypeProps} from '../common/types'
import styles from './Label.module.css'

type ActionListItemLabelCommonProps = {
  description?: string
  hexColor: string
  id: string
  name: string
  nameHTML?: SafeHTMLString
  selected?: boolean
} & ActionListItemProps

export type ActionListItemLabelProps = ActionListItemLabelCommonProps & SelectTypeProps

export function ActionListItemLabel({
  description,
  hexColor,
  id,
  name,
  nameHTML,
  selectType,
  selected,
  radioGroupName,
  ...props
}: ActionListItemLabelProps) {
  const isNativeActionListItemSelection = selectType === 'multiple' || selectType === 'instant'
  const hasCustomLeadingVisual = selectType === 'single'

  return (
    <ActionList.Item
      key={id}
      className={description ? undefined : styles.ActionList_Item_0}
      {...props}
      {...(isNativeActionListItemSelection ? {selected} : {})}
    >
      {hasCustomLeadingVisual ? (
        <ActionList.LeadingVisual className={styles.ActionList_LeadingVisual_0}>
          {selectType === 'single' && (
            <Radio
              name={radioGroupName}
              value={id}
              checked={selected}
              className={styles.Radio_0}
              {...testIdProps('label-radio')}
            />
          )}
          <Circle color={hexColor} />
        </ActionList.LeadingVisual>
      ) : (
        <ActionList.LeadingVisual>
          <Circle color={hexColor} />
        </ActionList.LeadingVisual>
      )}
      {(nameHTML && <SafeHTMLText html={nameHTML} className={styles.SafeHTMLText_0} />) || name}
      <ActionList.Description variant="block">{description}</ActionList.Description>
    </ActionList.Item>
  )
}

export function ActionListItemLabelSkeleton({selectType}: {selectType: SelectType}) {
  return (
    <div className={styles.Box_2} {...testIdProps('loading-skeleton')}>
      {/* The width needs to be larger than the height to make a square */}
      {selectType !== 'action' && <LoadingSkeleton variant="rounded" width="md" />}
      <div className={styles.Box_0}>
        <LoadingSkeleton variant="elliptical" height="13px" width="13px" className={styles.LoadingSkeleton_0} />
      </div>
      <div className={styles.Box_3}>
        <LoadingSkeleton variant="rounded" height="sm" className={styles.LoadingSkeleton_1} />
        <LoadingSkeleton variant="rounded" height="sm" className={styles.Box_3} />
      </div>
    </div>
  )
}

function Circle({color}: {color: string}) {
  return (
    <div
      className={styles.Box_1}
      style={{
        backgroundColor: `#${color}`,
      }}
      {...testIdProps('label-circle')}
    />
  )
}
