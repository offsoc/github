import type {Meta} from '@storybook/react'
import {KeyboardKey} from './KeyboardKey'

type KeyboardKeyProps = React.ComponentProps<typeof KeyboardKey>

const args = {
  keys: 'Mod+Shift+K',
} satisfies KeyboardKeyProps

const meta = {
  title: 'Utilities/KeyboardKey',
  component: KeyboardKey,
} satisfies Meta<typeof KeyboardKey>

export default meta

export const Condensed = {args}

export const Full = {args: {...args, format: 'full'}}

export const OnEmphasis = {args: {...args, variant: 'onEmphasis'}}

const sequenceArgs = {
  keys: 'Mod+x y z',
} satisfies KeyboardKeyProps

export const SequenceCondensed = {args: sequenceArgs}

export const SequenceFull = {args: {...sequenceArgs, format: 'full'}}
