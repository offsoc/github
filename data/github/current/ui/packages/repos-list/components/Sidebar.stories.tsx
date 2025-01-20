import type {Meta} from '@storybook/react'

import type {TypeFilter} from '../types/repos-list-types'
import {Sidebar, SidebarCollapsedButton} from './Sidebar'

const meta: Meta = {
  title: 'Apps/Repos List/Components/Sidebar',
}

export default meta

const sampleTypes: TypeFilter[] = [
  {id: 'all', text: 'All'},
  {id: 'public', text: 'Public'},
  {id: 'private', text: 'Private'},
]

export const Default = () => {
  return <Sidebar type="public" onQueryChanged={() => undefined} types={sampleTypes} />
}

export const Button = () => {
  return <SidebarCollapsedButton type="" onQueryChanged={() => undefined} types={sampleTypes} listTitle="Public" />
}
