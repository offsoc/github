import {ownerPath} from '@github-ui/paths'
import {ActionList, ActionMenu, Link, Text} from '@primer/react'
import {forwardRef, type HTMLAttributes, useRef} from 'react'

import {mixedValuePlaceholder} from './CustomPropertySelectPanel'

export interface CustomPropertyBooleanSelectProps {
  defaultValue?: string | null
  propertyValue: string
  mixed?: boolean
  onChange: (value: string) => void
  orgName?: string
  anchorProps?: HTMLAttributes<HTMLButtonElement>
}

export const CustomPropertyBooleanSelect = forwardRef(
  (
    {
      defaultValue = null,
      propertyValue,
      mixed = false,
      onChange,
      orgName = '',
      anchorProps = {},
    }: CustomPropertyBooleanSelectProps,
    ref: React.ForwardedRef<HTMLButtonElement>,
  ) => {
    const initiallyMixedRef = useRef(mixed)

    const defaultValueSelected = !!defaultValue && propertyValue === ''
    const displayedDefault = `default (${defaultValue})`

    const headerButtonText = (() => {
      if (mixed) {
        return mixedValuePlaceholder
      }
      if (defaultValueSelected) {
        return displayedDefault
      }
      return propertyValue || 'Choose an option'
    })()

    return (
      <ActionMenu anchorRef={ref as React.RefObject<HTMLButtonElement>}>
        <ActionMenu.Button
          {...anchorProps}
          sx={{width: '100%', 'span[data-component=buttonContent]': {justifyContent: 'start'}}}
        >
          {headerButtonText}
        </ActionMenu.Button>
        <ActionMenu.Overlay width={defaultValue ? 'medium' : 'small'}>
          <ActionList selectionVariant="single" role="menu" aria-label="True/false property value selections">
            {initiallyMixedRef.current && (
              <ActionList.Item selected={mixed} inactiveText="This property has multiple values">
                Mixed
              </ActionList.Item>
            )}
            {defaultValue && (
              <ActionList.Item onSelect={() => onChange('')} selected={defaultValueSelected && !mixed}>
                <Text sx={{fontWeight: 'normal'}}>{displayedDefault}</Text>
                <ActionList.Description variant="block">
                  Inherited from{' '}
                  <Link inline href={ownerPath({owner: orgName})}>
                    {orgName}
                  </Link>
                </ActionList.Description>
              </ActionList.Item>
            )}

            {(initiallyMixedRef.current || defaultValue) && <ActionList.Divider />}

            {['true', 'false'].map(value => {
              const selected = propertyValue === value
              return (
                <ActionList.Item
                  key={value}
                  selected={selected}
                  onSelect={() => (selected ? onChange('') : onChange(value))}
                >
                  {value}
                </ActionList.Item>
              )
            })}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    )
  },
)

CustomPropertyBooleanSelect.displayName = 'CustomPropertyBooleanSelect'
