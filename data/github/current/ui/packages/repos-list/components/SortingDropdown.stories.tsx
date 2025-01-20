import {TextInput} from '@primer/react'
import type {Meta} from '@storybook/react'
import {useState} from 'react'

import {SortingDropdown} from './SortingDropdown'

const meta: Meta<typeof SortingDropdown> = {
  title: 'Apps/Repos List/Components/SortingDropdown',
  component: SortingDropdown,
}

export default meta

export const Default = () => {
  const [key, setKey] = useState('')
  return (
    <div>
      <TextInput sx={{mb: 4}} monospace placeholder="Selected key" value={key} onChange={e => setKey(e.target.value)} />
      <SortingDropdown sortingItemSelected={key} onSortingItemSelect={setKey} />
    </div>
  )
}
