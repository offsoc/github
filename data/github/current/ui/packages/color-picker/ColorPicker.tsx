import {type ColorName, colorNames, isColorName, useNamedColor} from '@github-ui/use-named-color'
import {CheckCircleFillIcon, CircleIcon} from '@primer/octicons-react'
import {Box, Radio, Text, type BoxProps} from '@primer/react'
import {testIdProps} from '@github-ui/test-id-props'
import type React from 'react'
import {type ChangeEventHandler, useId, forwardRef} from 'react'
import {Tooltip} from '@primer/react/next'
import type {ForwardRefComponent} from '@primer/react/lib-esm/utils/polymorphic'

export interface ColorPickerProps {
  value: ColorName
  onChange: (value: ColorName) => void
  label: React.ReactNode
}

// The tooltip component wraps its first immediate child with aria-attributes, however we want the
// aria-labelledby to be applied to the input element. This component prevents aria attributes from
// being applied to the incorrect element
export const BoxWithoutAriaLabel = forwardRef(
  ({children, 'aria-describedby': _describedBy, 'aria-labelledby': _labelledby, ...props}, forwardedRef) => {
    return (
      <Box ref={forwardedRef} {...props}>
        {children}
      </Box>
    )
  },
) as ForwardRefComponent<'div' | 'label', BoxProps>

BoxWithoutAriaLabel.displayName = 'BoxWithoutAriaLabel'

export const ColorPicker = ({value, onChange, label}: ColorPickerProps) => {
  const name = useId()

  const handleChange: ChangeEventHandler<HTMLInputElement> = event => {
    const newValue = event.target.value
    if (isColorName(newValue)) onChange(newValue)
  }

  return (
    <Box as="fieldset" sx={{border: 0, padding: 0, margin: 0}}>
      <Text as="legend" sx={{fontWeight: 'bold', mb: 2}}>
        {label}
      </Text>

      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
        {colorNames.map(color => (
          <ColorOption key={color} name={name} color={color} onChange={handleChange} selected={value === color} />
        ))}
      </Box>
    </Box>
  )
}

interface ColorOptionProps {
  name: string
  color: ColorName
  onChange: ChangeEventHandler<HTMLInputElement>
  selected: boolean
}

const ColorOption = ({color, onChange, selected, name}: ColorOptionProps) => {
  const {fg, bg} = useNamedColor(color)
  const capitalizedColor = (color[0] ?? '') + color.slice(1).toLowerCase()
  const id = useId()

  return (
    <Tooltip text={capitalizedColor} direction="s" id={id}>
      <BoxWithoutAriaLabel
        as="label"
        sx={{
          p: 2,
          background: selected ? fg : bg,
          color: selected ? 'canvas.default' : fg,
          borderRadius: 2,
          lineHeight: 0,
          // :has is not yet supported in all browsers, but this isn't critical - it's just
          // to improve accessibility slightly. We can be OK with progressive enhancement as
          // browsers ship support for :has.
          ':has(:focus-visible)': {
            outlineWidth: '2px',
            outlineStyle: 'solid',
            outlineColor: 'accent.fg',
            outlineOffset: '1px',
          },
        }}
        {...testIdProps(`color-picker-option-${capitalizedColor}`)}
      >
        <Radio
          aria-labelledby={id}
          name={name}
          value={color}
          checked={selected}
          onChange={onChange}
          sx={{clipPath: 'circle(0)', position: 'absolute', outline: 'none !important'}}
        />
        {selected ? <CheckCircleFillIcon /> : <CircleIcon />}
      </BoxWithoutAriaLabel>
    </Tooltip>
  )
}
