import type {IconProps} from '@primer/octicons-react'
import {ActionList, Box, Button} from '@primer/react'
import type {FunctionComponent, PropsWithChildren} from 'react'

export type EmptyPickerProps = {
  leadingIcon?: FunctionComponent<PropsWithChildren<IconProps>>
  hotKey?: string
  label: string
  anchorProps?: React.HTMLAttributes<HTMLElement>
  readonly?: boolean
  ariaLabelledBy?: string
  /**
   * Whether to render the empty picker as a nested menu item (true) versus a standalone button (false; default).
   */
  nested?: boolean
}

export const SharedEmptyPicker = ({
  leadingIcon: LeadingIcon,
  hotKey,
  label,
  anchorProps,
  readonly,
  nested,
  ariaLabelledBy,
}: EmptyPickerProps) => {
  const sharedProps = {'aria-disabled': readonly, disabled: readonly, 'aria-labelledby': ariaLabelledBy}

  if (nested) {
    return (
      <ActionList.Item {...anchorProps} {...sharedProps} role="menuitem">
        {LeadingIcon && (
          <ActionList.LeadingVisual>
            <LeadingIcon />
          </ActionList.LeadingVisual>
        )}
        {label}
      </ActionList.Item>
    )
  }

  return (
    <Button
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
      {label}
    </Button>
  )
}
