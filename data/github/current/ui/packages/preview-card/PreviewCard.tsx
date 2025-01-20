// Matches app/views/site/_hovercard_template.html.erb which is the template used in the rest of the monolith
// This component's contents get set by app/assets/modules/github/behaviors/hovercards.ts

import {Box} from '@primer/react'

export function PreviewCardOutlet() {
  return (
    <Box
      className="Popover js-hovercard-content"
      sx={{
        position: 'absolute',
        display: 'none',
        outline: 'none',
      }}
      tabIndex={0}
    >
      <div
        className="Popover-message Popover-message--bottom-left Popover-message--large Box color-shadow-large"
        style={{width: '360px'}}
      />
    </Box>
  )
}
