import {testIdProps} from '@github-ui/test-id-props'
import {Box, Label} from '@primer/react'

interface AddBreakButtonProps {
  onClick: () => void
  /**
   * The hover target of the first Insert Break button can interfere with the
   * click target of buttons in the header (like `Add Iteration`), so this component
   * provides a way to turn that padding into a margin for that button.
   * */
  removeTopPadding: boolean
}

/**
 * Button to insert a break between two iterations. Intended to be placed directly between
 * iteration rows in the table.
 */
export function AddBreakButton({onClick, removeTopPadding}: AddBreakButtonProps) {
  return (
    <Box
      sx={{
        p: 2,
        position: 'absolute',
        left: 0,
        right: 0,
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 1,
        justifyContent: 'flex-end',
        pr: '20%',
        // Hide the button if the user is not hovering over this element or the button container
        '&:not(:hover):not(:focus-within) > :not(:hover)': {
          opacity: 0,
        },
      }}
    >
      <Box
        sx={{p: 3, position: 'absolute', pt: removeTopPadding ? 0 : undefined, mt: removeTopPadding ? 3 : undefined}}
      >
        <Label
          sx={{
            color: 'fg.muted',
            backgroundColor: 'canvas.default',
            cursor: 'pointer',
            ':hover': {
              color: 'accent.fg',
            },
          }}
          onClick={onClick}
          as="button"
          type="button"
          {...testIdProps('add-break-button')}
        >
          Insert break
        </Label>
      </Box>
    </Box>
  )
}
