import type {Meta} from '@storybook/react'

import {albumDefinition} from '../test-utils/mock-data'
import {DefinitionDangerZone} from './DefinitionDangerZone'

const meta: Meta = {
  title: 'Apps/Custom Properties/Components/DefinitionDangerZone',
}

export default meta

export const Default = () => <DefinitionDangerZone definition={albumDefinition} />
