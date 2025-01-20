import {ActionList, Box, Button, Truncate} from '@primer/react'
import {forwardRef, type FunctionComponent, type PropsWithChildren, type ReactNode} from 'react'
import type {IconProps} from '@primer/octicons-react'
import styles from './SharedPicker.module.css'

export type SharedPickerProps = {
  //Props used in the case when there is no selection yet
  leadingIcon?: FunctionComponent<PropsWithChildren<IconProps>>
  hotKey?: string
  //Props used in the case when there is selection
  leadingIconElement?: ReactNode
  sharedPickerMainValue?: ReactNode
  size?: 'small' | 'large'
  // Props used in both cases
  anchorText: string
  anchorProps?: React.HTMLAttributes<HTMLElement>
  ariaLabelledBy?: string
  ariaLabel?: string
  readonly?: boolean
  /**
   * Whether to render the picker as a nested menu item (true) versus a standalone button (false; default).
   */
  nested?: boolean
  ref?: React.Ref<HTMLButtonElement>
  compressedTitle?: string
}

export const SharedPicker = forwardRef<HTMLButtonElement, SharedPickerProps>(
  (
    {
      leadingIconElement,
      anchorText,
      anchorProps,
      sharedPickerMainValue,
      ariaLabel,
      readonly,
      size,
      nested = false,
      leadingIcon: LeadingIcon,
      hotKey,
      ariaLabelledBy,
      compressedTitle,
    },
    ref,
  ) => {
    const sharedProps = {
      'aria-labelledby': ariaLabelledBy,
      'aria-label': ariaLabel,
      // When rendering the `ActionList.Item` instead of a button, we can skip aria-disabled because it is redundant
      // with the `disabled` attribute
      'aria-disabled': nested ? readonly : undefined,
      disabled: readonly,
    }

    if (nested) {
      const leadingIcon = sharedPickerMainValue ? leadingIconElement : LeadingIcon && <LeadingIcon />

      return (
        <ActionList.Item {...anchorProps} {...sharedProps} role="menuitem">
          {leadingIcon && <ActionList.LeadingVisual>{leadingIcon}</ActionList.LeadingVisual>}
          {anchorText}
        </ActionList.Item>
      )
    }

    if (sharedPickerMainValue) {
      return (
        <Button ref={ref} size={size ? size : 'small'} {...anchorProps} {...sharedProps}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Box sx={{color: 'fg.muted', fontWeight: 'normal'}}>{anchorText}</Box>
            <Box
              sx={{
                display: leadingIconElement ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                '> *:not(:last-child)': {
                  mr: '-3px',
                },
              }}
            >
              {leadingIconElement}
            </Box>
            <div className={styles['title']}>
              <Truncate title={compressedTitle ?? sharedPickerMainValue.toString() ?? ''}>
                {sharedPickerMainValue}
              </Truncate>
            </div>
          </Box>
        </Button>
      )
      //  This used to be SharedEmptyPicker
    } else {
      return (
        <Button
          ref={ref}
          sx={{borderStyle: 'dashed', fontWeight: 'normal', color: 'fg.muted'}}
          size={'small'}
          leadingVisual={LeadingIcon}
          trailingVisual={
            hotKey
              ? () => (
                  <Box
                    sx={{
                      color: 'fg.muted',
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor: 'border.default',
                      p: '0px 4px',
                      borderRadius: '6px',
                    }}
                  >
                    {hotKey}
                  </Box>
                )
              : undefined
          }
          {...sharedProps}
          {...anchorProps}
        >
          {anchorText}
        </Button>
      )
    }
  },
)

SharedPicker.displayName = 'SharedPicker'
