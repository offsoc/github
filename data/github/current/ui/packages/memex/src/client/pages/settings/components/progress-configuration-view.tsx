import {ColorPicker} from '@github-ui/color-picker'
import {testIdProps} from '@github-ui/test-id-props'
import type {Icon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Checkbox, FormControl, Heading} from '@primer/react'
import {useRef} from 'react'

import type {ProgressConfiguration} from '../../../api/columns/contracts/progress'
import {AutosaveMessage} from '../../../components/fields/autosave-message'
import {ProgressBar, ProgressBarVariants} from '../../../components/fields/progress-bar'
import type {SubIssuesProgressColumnModel} from '../../../models/column-model/system/sub-issues-progress'
import {useUpdateProgressConfiguration} from '../../../state-providers/columns/use-update-progress-configuration'
import {Resources} from '../../../strings'
import {CONTENT_WIDTH} from '../constants'
import {BarIcon, RingIcon, SegmentedBarIcon} from './icons'

type Variant = ProgressConfiguration['variant']

const variantOptions: Array<{id: Variant; leadingVisual: Icon; label: string}> = [
  {id: ProgressBarVariants.SOLID, leadingVisual: BarIcon, label: 'Bar'},
  {id: ProgressBarVariants.SEGMENTED, leadingVisual: SegmentedBarIcon, label: 'Segmented bar'},
  {id: ProgressBarVariants.RING, leadingVisual: RingIcon, label: 'Ring'},
]

const VariantSelect = ({value, onSelect}: {value: Variant; onSelect: (value: Variant) => void}) => {
  const selectedIndicatorOption = variantOptions.find(option => option.id === value)

  return (
    <ActionMenu>
      {/*
        The linter complains about alignContent but ActionMenu.Button doesn't yet support another way to align.
        The docs still promote this way, so we're using it for now.
       */}
      {/* eslint-disable-next-line primer-react/no-system-props */}
      <ActionMenu.Button
        aria-label="Progress visualization variant"
        sx={{width: CONTENT_WIDTH}}
        leadingVisual={selectedIndicatorOption?.leadingVisual}
        block
        alignContent="start"
      >
        {selectedIndicatorOption?.label}
      </ActionMenu.Button>
      <ActionMenu.Overlay width="auto">
        <ActionList>
          {variantOptions.map(({id, leadingVisual: LeadingVisualComponent, label}) => (
            <ActionList.Item key={id} onSelect={() => onSelect(id)}>
              {label}
              <ActionList.LeadingVisual>{<LeadingVisualComponent />}</ActionList.LeadingVisual>
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

const HideNumeralsCheckboxField = (props: {
  checked: boolean
  disabled: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  return (
    <form {...testIdProps('hide-numerals-checkbox-field')}>
      <FormControl disabled={props.disabled}>
        <Checkbox {...props} />
        <FormControl.Label>Show numerical value</FormControl.Label>
      </FormControl>
    </form>
  )
}

export const ProgressConfigurationView = ({column}: {column: SubIssuesProgressColumnModel}) => {
  const {updateProgressConfiguration, commitState} = useUpdateProgressConfiguration()
  const variant = column.settings?.progressConfiguration?.variant || ProgressBarVariants.SOLID
  const hideNumerals = column.settings?.progressConfiguration?.hideNumerals || false
  const color = column.settings?.progressConfiguration?.color || 'PURPLE'
  const configuration = {
    color,
    hideNumerals,
    variant,
  }

  const errorMessage = useRef(Resources.genericErrorMessage)

  return (
    <>
      <Heading as="h3" sx={{fontSize: 1, pt: 4, pb: 2}} aria-label={`${column.name} options`}>
        Options
      </Heading>
      <Box
        sx={{
          bg: 'canvas.subtle',
          padding: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 2,
          width: CONTENT_WIDTH,
          minHeight: '5em',
        }}
      >
        <ProgressBar
          completed={2}
          percentCompleted={40}
          total={5}
          variant={variant}
          hideNumerals={hideNumerals}
          color={color}
        />
      </Box>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: 3, pb: 4}}>
        <VariantSelect
          value={variant}
          onSelect={value => {
            updateProgressConfiguration(column, {...configuration, variant: value})
          }}
        />
        <HideNumeralsCheckboxField
          checked={!hideNumerals || variant === ProgressBarVariants.RING}
          disabled={variant === ProgressBarVariants.RING}
          onChange={e => {
            updateProgressConfiguration(column, {...configuration, hideNumerals: !e.target.checked})
          }}
        />
      </Box>
      <ColorPicker
        value={color}
        onChange={value => {
          updateProgressConfiguration(column, {...configuration, color: value})
        }}
        label="Color"
      />
      <AutosaveMessage commitState={commitState} errorMessage={errorMessage} />
    </>
  )
}
