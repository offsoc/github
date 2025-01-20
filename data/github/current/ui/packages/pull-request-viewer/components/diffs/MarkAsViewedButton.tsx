import {CheckboxIcon} from '@primer/octicons-react'
import {Button} from '@primer/react'

export function MarkAsViewedButton({isViewed, toggleViewed}: {isViewed: boolean; toggleViewed: () => void}) {
  return (
    <Button
      aria-pressed={isViewed}
      leadingVisual={() =>
        isViewed ? (
          <CheckboxIcon />
        ) : (
          // This SVG is the square around CheckboxIcon without the Check (will not be shipped to Primer due to fear of misuse as a form element, which we don't do here, it's just visual)
          <svg
            // aria-pressed already informs that this is a toggle icon, so we're setting aria-hidden
            aria-hidden="true"
            fill="none"
            height="16"
            role="img"
            viewBox="0 0 16 16"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M2.5 2.75C2.5 2.61193 2.61193 2.5 2.75 2.5H13.25C13.3881 2.5 13.5 2.61193 13.5 2.75V13.25C13.5 13.3881 13.3881 13.5 13.25 13.5H2.75C2.61193 13.5 2.5 13.3881 2.5 13.25V2.75ZM2.75 1C1.7835 1 1 1.7835 1 2.75V13.25C1 14.2165 1.7835 15 2.75 15H13.25C14.2165 15 15 14.2165 15 13.25V2.75C15 1.7835 14.2165 1 13.25 1H2.75Z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
        )
      }
      sx={
        isViewed
          ? {
              borderColor: 'accent.muted',
              backgroundColor: 'accent.subtle',
              color: 'accent.fg',
              '&:hover:not([disabled])': {
                backgroundColor: 'accent.subtle',
              },
            }
          : {}
      }
      onClick={toggleViewed}
    >
      Viewed
    </Button>
  )
}
