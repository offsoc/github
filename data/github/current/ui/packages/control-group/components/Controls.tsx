import {PencilIcon} from '@primer/octicons-react'
import {Box, ToggleSwitch as PrimerToggleSwitch, IconButton, Button as PrimerButton} from '@primer/react'

/* --------------
  Custom Control: Allow consumers to add their own custom controls to the ControlGroup
----------------*/

type CustomProps = {
  children: React.ReactNode
}

export const Custom = ({children}: CustomProps) => {
  return <>{children}</>
}
Custom.displayName = 'ControlGroup.Custom'

/* --------------
      Toggle
----------------*/

type ToggleSwitchProps = React.ComponentProps<typeof PrimerToggleSwitch>

export const ToggleSwitch = (props: ToggleSwitchProps) => {
  return <PrimerToggleSwitch size="small" {...props} />
}

ToggleSwitch.displayName = 'ControlGroup.ToggleSwitch'

/* --------------
      Button
----------------*/

type ButtonProps = React.ComponentProps<typeof PrimerButton>

export const Button = (props: ButtonProps) => {
  return <PrimerButton {...props}>{props.children}</PrimerButton>
}

Button.displayName = 'ControlGroup.Button'

/* --------------
    Inline Edit
----------------*/

type InlineEditProps = {
  value?: string | null
}

type IconButtonProps = React.ComponentProps<typeof IconButton>
type OmittedIconButtonProps = Omit<IconButtonProps, 'icon' | 'aria-labelledby' | 'value'>

export const InlineEdit = ({value = null, ...props}: InlineEditProps & OmittedIconButtonProps) => {
  return (
    <>
      <Box className="inlineEdit" sx={{display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-start'}}>
        <span>{value}</span>
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          unsafeDisableTooltip={true}
          icon={PencilIcon}
          aria-label="Edit"
          sx={{color: 'fg.muted'}}
          {...props}
        />
      </Box>
    </>
  )
}

InlineEdit.displayName = 'ControlGroup.InlineEdit'
