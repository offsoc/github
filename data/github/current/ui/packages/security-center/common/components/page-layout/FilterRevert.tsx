import {FilterRevert as UiFilterRevert} from '@github-ui/filter'
import {Box} from '@primer/react'

function FilterRevert({show, onRevert}: {show: boolean; onRevert: () => void}): JSX.Element | null {
  if (!show) {
    return null
  }

  return (
    <Box sx={{mt: 1}}>
      <UiFilterRevert as="button" onClick={onRevert} />
    </Box>
  )
}

FilterRevert.displayName = 'PageLayout.FilterRevert'

export default FilterRevert
