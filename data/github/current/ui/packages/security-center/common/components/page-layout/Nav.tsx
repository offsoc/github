import {Box, TabNav} from '@primer/react'

import {useClickLogging} from '../../hooks/use-click-logging'

type Props = {
  items: Array<{
    key: string
    label: string
    selected?: boolean
  }>
  onSelectionChanged?: (selected: string) => void
}

function Nav({items, onSelectionChanged}: Props): JSX.Element {
  const {logClick} = useClickLogging({category: 'PageLayout.Nav'})

  return (
    <Box sx={{mb: 4}}>
      <TabNav>
        {items.map(item => (
          <TabNav.Link
            as="button"
            key={item.key}
            selected={item.selected}
            onClick={() => {
              logClick({action: 'select nav tab', label: item.label})
              onSelectionChanged?.(item.key)
            }}
          >
            {item.label}
          </TabNav.Link>
        ))}
      </TabNav>
    </Box>
  )
}

Nav.displayName = 'PageLayout.Nav'

export default Nav
