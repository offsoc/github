import {Box} from '@primer/react'

import {themeGetSx} from '../../helpers/theme-get-sx'

/**
 * This component is used as a placeholder when the user is hovering a card
 * over an empty column to indicate to the user where this will be added if
 * the card were to be dropped.
 */
export const EmptyColumnSash: React.FC = () => (
  <Box
    sx={{
      content: '',
      display: 'block',
      width: '100%',
      backgroundColor: 'accent.emphasis',
      height: themeGetSx('space.1'),
      border: '0',
      borderRadius: 2,
    }}
  />
)
