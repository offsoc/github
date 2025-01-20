import type React from 'react'
import {LABELS} from '../constants/labels'

import {LabelDots} from './LabelDots'
import {SharedPicker} from './SharedPicker'
import {type SafeHTMLString, SafeHTMLText} from '@github-ui/safe-html'
import type {IconProps} from '@primer/octicons-react'
import {forwardRef, type FunctionComponent, type PropsWithChildren} from 'react'

type CompressedLabelAnchorProps = {
  size?: 'small' | 'large'
  labelNamesWithColor: Array<{nameHTML: string; color: string}>
  anchorProps?: React.HTMLAttributes<HTMLElement>
  MAX_DISPLAYED_LABELS?: number
  readonly?: boolean
  leadingIcon?: FunctionComponent<PropsWithChildren<IconProps>>
  hotKey?: string
  anchorText?: string
  compressedLabelTitle?: string
}

export const CompressedLabelsToken = forwardRef<HTMLButtonElement, CompressedLabelAnchorProps>(
  (
    {
      size = 'large',
      labelNamesWithColor,
      anchorProps,
      MAX_DISPLAYED_LABELS = 5,
      readonly,
      leadingIcon,
      hotKey,
      anchorText,
    },
    ref,
  ) => {
    const compressedLabelTitle = labelNamesWithColor
      .slice(0, MAX_DISPLAYED_LABELS)
      .map(a => a.nameHTML)
      .join(', ')
      .concat(
        labelNamesWithColor.length > MAX_DISPLAYED_LABELS
          ? `, ${labelNamesWithColor.length - MAX_DISPLAYED_LABELS}+`
          : '',
      )

    return (
      <SharedPicker
        anchorProps={anchorProps}
        readonly={readonly}
        anchorText={anchorText ? anchorText : labelNamesWithColor.length > 1 ? LABELS.labels : LABELS.noLabels}
        sharedPickerMainValue={
          labelNamesWithColor.length > 0 && (
            <LabelNames
              labelNamesWithColor={labelNamesWithColor}
              MAX_DISPLAYED_LABELS={MAX_DISPLAYED_LABELS}
              compressedLabelTitle={compressedLabelTitle}
            />
          )
        }
        leadingIconElement={
          labelNamesWithColor.length > 0 && (
            <LabelDots
              MAX_DISPLAYED_LABELS={MAX_DISPLAYED_LABELS}
              labelColors={labelNamesWithColor.map(l => l.color)}
            />
          )
        }
        ariaLabel={LABELS.selectLabels}
        size={size}
        // for the empty variant
        leadingIcon={leadingIcon}
        hotKey={hotKey}
        ref={ref}
        compressedTitle={compressedLabelTitle}
      />
    )
  },
)

CompressedLabelsToken.displayName = 'CompressedLabelsToken'

const LabelNames = ({compressedLabelTitle}: CompressedLabelAnchorProps) => {
  return <SafeHTMLText html={compressedLabelTitle as SafeHTMLString} />
}
