import {ArchiveIcon} from '@primer/octicons-react'
import {Octicon, Spinner, Text} from '@primer/react'
import {memo} from 'react'

import {Blankslate} from '../../../../components/common/blankslate'

export const NoArchivedItems = memo(function NoArchivedItems() {
  return (
    <Blankslate
      sx={{
        backgroundColor: theme => `${theme.colors.canvas.default}`,
        display: 'flex',
        flexGrow: 1,
        m: 6,
      }}
    >
      <Octicon icon={ArchiveIcon} size={30} sx={{color: 'fg.muted'}} />
      <h2>There aren&apos;t any archived items</h2>
      <Text as="p" sx={{color: 'fg.muted'}}>
        Archive items from a project view and they&apos;ll be shown here.
      </Text>
    </Blankslate>
  )
})
export const NoFilteredItems = memo(function NoFilteredItems() {
  return (
    <Blankslate
      sx={{
        backgroundColor: theme => `${theme.colors.canvas.default}`,
        display: 'flex',
        flexGrow: 1,
        m: 6,
      }}
    >
      <Octicon icon={ArchiveIcon} size={30} sx={{color: 'fg.muted'}} />
      <h2>No results matched your filter</h2>
    </Blankslate>
  )
})
export const Loader = memo(function Loader() {
  return (
    <Blankslate
      sx={{
        backgroundColor: theme => `${theme.colors.canvas.default}`,
        display: 'flex',
        flexGrow: 1,
        m: 6,
      }}
    >
      <Spinner />
    </Blankslate>
  )
})
